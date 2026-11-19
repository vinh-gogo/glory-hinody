/**
 * Glory Hinody — Eclipse Editorial Motion & Interaction Controller (nausmind-motion.js v2)
 * Inertia-Aware Snap Physics, Frame-Rate-Independent Damping, Auto-Sleeping rAF,
 * GPU Scroll Reveals, Inner Header Scroll State & Native View Transitions
 */
(function () {
  'use strict';

  var SNAP_COOLDOWN_MS = 620;
  var DIVE_DURATION_MS = 1050;
  var CLICK_DIVE_DURATION_MS = 900;
  var SECOND_SCROLL_DIVE_MIN_MS = 440;

  var reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  var isReducedMotion = reducedMotionQuery ? !!reducedMotionQuery.matches : false;

  var finePointerQuery = window.matchMedia
    ? window.matchMedia('(pointer: fine)')
    : null;
  var hasFinePointer = finePointerQuery ? !!finePointerQuery.matches : true;

  function nowMs() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  function clamp(val, minVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, val));
  }

  function easeOutQuint(t) {
    return 1.0 - Math.pow(1.0 - t, 5.0);
  }

  function easeInOutQuart(t) {
    return t < 0.5
      ? 8.0 * t * t * t * t
      : 1.0 - Math.pow(-2.0 * t + 2.0, 4.0) / 2.0;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 1. WORD-BY-WORD QUOTE PREPARATION & SCROLL REVEAL HELPERS
   * ═════════════════════════════════════════════════════════════════════════ */
  function prepareWordRevealElement(el) {
    if (!el || el.getAttribute('data-word-split') === '1') return;
    el.setAttribute('data-word-split', '1');

    var rawText = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!rawText) return;

    el.setAttribute('aria-label', rawText);

    var goldCount = parseInt(el.getAttribute('data-gold-words') || '4', 10);
    if (isNaN(goldCount) || goldCount < 0) goldCount = 4;

    var words = rawText.split(' ');
    var goldStart = Math.max(0, words.length - goldCount);
    var frag = document.createDocumentFragment();

    for (var i = 0; i < words.length; i++) {
      var span = document.createElement('span');
      span.className = i >= goldStart ? 'nm-word nm-word-gold' : 'nm-word';
      span.style.transitionDelay = (isReducedMotion ? 0 : Math.min(i * 26, 620)) + 'ms';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = words[i];
      frag.appendChild(span);

      if (i < words.length - 1) {
        frag.appendChild(document.createTextNode(' '));
      }
    }

    el.textContent = '';
    el.appendChild(frag);
  }

  function prepareAllWordReveals(root) {
    var scope = root || document;
    var items = scope.querySelectorAll('[data-word-reveal]');
    for (var i = 0; i < items.length; i++) {
      prepareWordRevealElement(items[i]);
    }
  }

  function revealElement(el) {
    if (!el) return;
    if (el.classList.contains('reveal-on-scroll')) {
      el.classList.add('revealed');
    }
    if (el.hasAttribute('data-word-reveal')) {
      prepareWordRevealElement(el);
      el.classList.add('is-revealed');
    }
  }

  function initInnerPageScrollReveals() {
    prepareAllWordReveals(document);

    var targets = document.querySelectorAll('.reveal-on-scroll, [data-word-reveal]');
    if (!targets.length) return;

    if (isReducedMotion || typeof IntersectionObserver === 'undefined') {
      for (var k = 0; k < targets.length; k++) {
        revealElement(targets[k]);
      }
      return;
    }

    var viewportCutoff = (window.innerHeight || 800) * 1.05;
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, {
      threshold: 0.04,
      rootMargin: '0px 0px 40px 0px'
    });

    for (var j = 0; j < targets.length; j++) {
      var item = targets[j];
      var rect = item.getBoundingClientRect();
      if (rect.top < viewportCutoff && rect.bottom > -40) {
        revealElement(item);
      } else {
        observer.observe(item);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2. MOBILE RIGHT OBSIDIAN DRAWER (#mobile-menu & #mobile-drawer-overlay)
   * ═════════════════════════════════════════════════════════════════════════ */
  var isDrawerOpen = false;

  function setDrawerState(open) {
    var menu = document.getElementById('mobile-menu');
    var overlay = document.getElementById('mobile-drawer-overlay');
    var toggles = document.querySelectorAll('[data-drawer-toggle]');

    isDrawerOpen = !!open && !!menu;

    if (menu) {
      menu.classList.toggle('is-open', isDrawerOpen);
    }
    if (overlay) {
      overlay.classList.toggle('is-open', isDrawerOpen);
    }
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute('aria-expanded', isDrawerOpen ? 'true' : 'false');
    }

    if (document.body && !document.body.classList.contains('is-home')) {
      document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    }
  }

  function initMobileDrawer() {
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target || !target.closest) return;

      var toggleBtn = target.closest('[data-drawer-toggle]');
      if (toggleBtn) {
        ev.preventDefault();
        setDrawerState(!isDrawerOpen);
        return;
      }

      var closeBtn = target.closest('[data-drawer-close]');
      if (closeBtn && isDrawerOpen) {
        ev.preventDefault();
        setDrawerState(false);
        return;
      }

      if (isDrawerOpen) {
        var menuLink = target.closest('#mobile-menu a[href]');
        if (menuLink) {
          setDrawerState(false);
        }
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && isDrawerOpen) {
        setDrawerState(false);
      }
    });

    window.addEventListener('resize', function () {
      if (isDrawerOpen && (window.innerWidth || 1024) > 900) {
        setDrawerState(false);
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. MASTER MOTION SYSTEM (INERTIA-AWARE SNAP + AUTO-SLEEPING RAF)
   * ═════════════════════════════════════════════════════════════════════════ */
  function initMotionSystem() {
    initMobileDrawer();

    var isHome = !!(document.body && document.body.classList.contains('is-home'));
    var siteNav = document.getElementById('site-nav');
    var scrollContainer = document.getElementById('scroll-container');
    var stargazingCaption = document.getElementById('stargazing-caption');
    var stargazingText = stargazingCaption ? stargazingCaption.querySelector('.stargazing-text') : null;
    var snapDotsWrap = document.getElementById('snap-dots');
    var snapDots = snapDotsWrap
      ? Array.prototype.slice.call(snapDotsWrap.querySelectorAll('.snap-dot[data-snap-target]'))
      : [];
    var sections = (isHome && scrollContainer)
      ? Array.prototype.slice.call(scrollContainer.querySelectorAll('.snap-section'))
      : [];

    var cursorGlow = document.getElementById('cursor-glow');
    var starCanvas = document.getElementById('starCanvas');
    var lineResearcher = document.querySelector('.line-researcher');
    var lineEngineer = document.querySelector('.line-engineer');
    var lineDreamer = document.querySelector('.line-dreamer');

    /* State for Home Fullpage & Camera Tween */
    var isStargazing = true;
    var isDiving = false;
    var isClickDiving = false;
    var diveStartTs = 0;
    var activeIndex = 0;
    var isTransitioning = false;
    var unlockTimer = 0;
    var heroTimers = [];
    var heroParallaxReady = false;
    var heroParallaxBlend = 0.0;

    /* Inertia-aware trackpad wheel state */
    var wheelAccum = 0.0;
    var lastWheelTs = 0;
    var prevAbsDelta = 0.0;
    var lastSnapTs = 0;
    var touchStartY = 0;
    var touchStartX = 0;

    var cameraTween = null;

    /* Pointer & Cursor Sheen State */
    var targetMx = 0.0;
    var targetMy = 0.0;
    var currMx = 0.0;
    var currMy = 0.0;
    var cursorTargetX = -999.0;
    var cursorTargetY = -999.0;
    var cursorCurrX = -999.0;
    var cursorCurrY = -999.0;
    var cursorActive = false;

    /* Auto-sleeping rAF scheduler */
    var motionRafId = 0;
    var lastMotionTs = nowMs();

    prepareAllWordReveals(document);

    function wakeMotionLoop() {
      if (motionRafId) return;
      lastMotionTs = nowMs();
      motionRafId = window.requestAnimationFrame(motionFrame);
    }

    function lockTransition(ms) {
      isTransitioning = true;
      wheelAccum = 0.0;
      lastSnapTs = nowMs();
      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(function () {
        isTransitioning = false;
        wheelAccum = 0.0;
      }, ms);
    }

    function clearHeroTimers() {
      for (var i = 0; i < heroTimers.length; i++) {
        clearTimeout(heroTimers[i]);
      }
      heroTimers.length = 0;
    }

    function resetHeroLineParallax() {
      heroParallaxReady = false;
      heroParallaxBlend = 0.0;
      var lines = [lineResearcher, lineEngineer, lineDreamer];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i]) {
          lines[i].style.transition = '';
          lines[i].style.transform = '';
        }
      }
    }

    function restoreStargazeCaptionText() {
      if (!stargazingCaption) return;
      stargazingCaption.classList.remove('diving');
      if (stargazingText && stargazingText.hasAttribute('data-orig-text')) {
        stargazingText.textContent = stargazingText.getAttribute('data-orig-text') || '';
      }
    }

    function setDiveCaptionState() {
      if (!stargazingCaption) return;
      stargazingCaption.classList.add('diving');
      if (stargazingText) {
        var diveText = stargazingText.getAttribute('data-dive-text');
        if (diveText) {
          if (!stargazingText.hasAttribute('data-orig-text')) {
            stargazingText.setAttribute('data-orig-text', stargazingText.textContent || '');
          }
          stargazingText.textContent = diveText;
        }
      }
    }

    function getCosmicModeSafe() {
      return (typeof window.getCosmicMode === 'function') ? window.getCosmicMode() : 'star';
    }

    function getCameraDistanceSafe() {
      return (typeof window.getCameraDistance === 'function') ? window.getCameraDistance() : 28.0;
    }

    function getCameraBoundsSafe() {
      return (typeof window.getCameraBounds === 'function')
        ? window.getCameraBounds()
        : { dMin: 1.6, dMax: 28.0, dStargaze: 28.0 };
    }

    function setCameraDistanceSafe(d) {
      if (typeof window.setCameraDistance === 'function') {
        window.setCameraDistance(d);
      }
    }

    function setStarSpeedSafe(mult) {
      if (typeof window.setStarSpeed === 'function') {
        window.setStarSpeed(mult);
      }
    }

    function tweenCamera(targetD, durationMs, onDone) {
      var dur = isReducedMotion ? 0 : (typeof durationMs === 'number' ? durationMs : DIVE_DURATION_MS);
      var fromD = getCameraDistanceSafe();

      if (dur <= 0 || Math.abs(targetD - fromD) < 0.02) {
        cameraTween = null;
        setCameraDistanceSafe(targetD);
        if (typeof onDone === 'function') onDone();
        return;
      }

      cameraTween = {
        from: fromD,
        to: targetD,
        startTs: nowMs(),
        duration: dur,
        onDone: onDone || null
      };
      wakeMotionLoop();
    }

    function updateSnapDots(idx) {
      for (var i = 0; i < snapDots.length; i++) {
        var dot = snapDots[i];
        var dotTarget = parseInt(dot.getAttribute('data-snap-target') || String(i), 10);
        var isCurrent = dotTarget === idx;
        dot.classList.toggle('is-active', isCurrent);
        if (isCurrent) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      }
    }

    function applySectionClasses(idx) {
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        sec.classList.remove('is-active', 'exit-up', 'exit-down');
        if (i < idx) {
          sec.classList.add('exit-up');
        } else if (i > idx) {
          sec.classList.add('exit-down');
        } else {
          sec.classList.add('is-active');
        }
      }
    }

    function triggerSectionReveals(section, idx, instant) {
      if (!section) return;

      if (section.id === 'hero' || idx === 0) {
        clearHeroTimers();
        resetHeroLineParallax();

        var heroLines = section.querySelectorAll('.hero-line');
        var heroHint = section.querySelector('.hero-scroll-hint');
        var delays = [20, 80, 145, 210, 275];

        if (instant || isReducedMotion) {
          for (var h = 0; h < heroLines.length; h++) {
            heroLines[h].classList.add('visible');
          }
          if (heroHint) heroHint.classList.add('visible');
          heroParallaxReady = true;
          wakeMotionLoop();
        } else {
          for (var j = 0; j < heroLines.length; j++) {
            (function (lineEl, delayMs) {
              heroTimers.push(setTimeout(function () {
                lineEl.classList.add('visible');
              }, delayMs));
            })(heroLines[j], j < delays.length ? delays[j] : (30 + j * 90));
          }
          if (heroHint) {
            heroTimers.push(setTimeout(function () {
              heroHint.classList.add('visible');
            }, 460));
          }
          heroTimers.push(setTimeout(function () {
            heroParallaxReady = true;
            wakeMotionLoop();
          }, 860));
        }
      } else {
        resetHeroLineParallax();
      }

      var reveals = section.querySelectorAll('.reveal-on-scroll, [data-word-reveal]');
      for (var r = 0; r < reveals.length; r++) {
        revealElement(reveals[r]);
      }

      var isCta = section.id === 'cta' || idx === 4;
      setStarSpeedSafe(isCta ? 5.2 : 1.0);
    }

    function enterContent(targetIdx, opts) {
      if (!isHome || !sections.length) return;
      var instant = !!(opts && opts.instant);
      var idx = clamp(typeof targetIdx === 'number' ? targetIdx : 0, 0, sections.length - 1);

      isStargazing = false;
      isDiving = false;
      isClickDiving = false;
      activeIndex = idx;

      lockTransition(instant ? 60 : 540);

      if (stargazingCaption) {
        stargazingCaption.classList.remove('visible', 'diving');
      }
      restoreStargazeCaptionText();

      if (siteNav) {
        siteNav.classList.remove('nav-hidden');
        siteNav.classList.add('nav-active');
      }
      if (scrollContainer) {
        scrollContainer.classList.add('content-visible');
      }
      if (snapDotsWrap) {
        snapDotsWrap.classList.add('visible');
      }

      applySectionClasses(idx);
      updateSnapDots(idx);
      triggerSectionReveals(sections[idx], idx, instant);
    }

    function goToSnap(nextIdx) {
      if (!isHome || !sections.length) return;
      if (isStargazing) {
        enterContent(nextIdx, { instant: false });
        return;
      }
      if (isTransitioning) return;
      if (nextIdx < 0 || nextIdx >= sections.length || nextIdx === activeIndex) return;

      lockTransition(SNAP_COOLDOWN_MS);
      activeIndex = nextIdx;

      applySectionClasses(nextIdx);
      updateSnapDots(nextIdx);
      triggerSectionReveals(sections[nextIdx], nextIdx, false);
    }

    function exitToStargaze() {
      if (!isHome || isStargazing || isTransitioning) return;

      isStargazing = true;
      isDiving = false;
      isClickDiving = false;
      activeIndex = 0;

      lockTransition(SNAP_COOLDOWN_MS);
      clearHeroTimers();
      resetHeroLineParallax();

      if (scrollContainer) {
        scrollContainer.classList.remove('content-visible');
      }
      if (siteNav) {
        siteNav.classList.remove('nav-active');
        siteNav.classList.add('nav-hidden');
      }
      if (snapDotsWrap) {
        snapDotsWrap.classList.remove('visible');
      }

      for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('is-active', 'exit-up', 'exit-down');
      }
      var heroLines = document.querySelectorAll('#hero .hero-line, #hero .hero-scroll-hint');
      for (var h = 0; h < heroLines.length; h++) {
        heroLines[h].classList.remove('visible');
      }

      restoreStargazeCaptionText();
      if (stargazingCaption) {
        stargazingCaption.classList.add('visible');
      }

      setStarSpeedSafe(1.0);

      var bounds = getCameraBoundsSafe();
      if (getCosmicModeSafe() === 'blackhole') {
        tweenCamera(bounds.dStargaze, DIVE_DURATION_MS);
      } else {
        setCameraDistanceSafe(bounds.dStargaze);
      }

      if (window.location.hash) {
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (err) {}
      }
    }

    function handleStargazeDownIntent() {
      if (isTransitioning || isClickDiving) return;

      var mode = getCosmicModeSafe();
      var dist = getCameraDistanceSafe();
      var bounds = getCameraBoundsSafe();

      if (mode === 'blackhole' && dist > 2.0) {
        if (!isDiving) {
          isDiving = true;
          diveStartTs = nowMs();
          setDiveCaptionState();
          tweenCamera(bounds.dMin, DIVE_DURATION_MS, function () {
            isDiving = false;
          });
        } else if (nowMs() - diveStartTs >= SECOND_SCROLL_DIVE_MIN_MS) {
          isDiving = false;
          tweenCamera(bounds.dMin, 320);
          enterContent(0, { instant: false });
        }
      } else {
        setCameraDistanceSafe(bounds.dMin);
        enterContent(0, { instant: false });
      }
    }

    function handleStargazeUpIntent() {
      if (isTransitioning || isClickDiving) return;
      if (getCosmicModeSafe() === 'blackhole') {
        var bounds = getCameraBoundsSafe();
        if (getCameraDistanceSafe() < bounds.dMax - 0.5) {
          isDiving = false;
          restoreStargazeCaptionText();
          tweenCamera(bounds.dMax, DIVE_DURATION_MS);
        }
      }
    }

    function findSectionIndexByHash(hashStr) {
      if (!hashStr || hashStr.length < 2) return -1;
      var id = hashStr.charAt(0) === '#' ? hashStr.slice(1) : hashStr;
      if (!id) return -1;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === id) return i;
      }
      return -1;
    }

    function canActiveSectionScrollInternally(directionY) {
      var sec = sections[activeIndex];
      if (!sec) return false;
      if (sec.scrollHeight <= sec.clientHeight + 8) return false;
      if (directionY > 0) {
        return sec.scrollTop + sec.clientHeight < sec.scrollHeight - 4;
      }
      return sec.scrollTop > 4;
    }

    /* ── Home vs Inner Page Initialization ── */
    if (isHome && sections.length > 0) {
      var hashMatchIdx = findSectionIndexByHash(window.location.hash);
      if (hashMatchIdx >= 0) {
        setCameraDistanceSafe(getCameraBoundsSafe().dMin);
        enterContent(hashMatchIdx, { instant: true });
      } else {
        isStargazing = true;
        activeIndex = 0;
        if (stargazingCaption) stargazingCaption.classList.add('visible');
        if (siteNav) {
          siteNav.classList.add('nav-hidden');
          siteNav.classList.remove('nav-active');
        }
        if (scrollContainer) scrollContainer.classList.remove('content-visible');
        if (snapDotsWrap) snapDotsWrap.classList.remove('visible');
        setCameraDistanceSafe(getCameraBoundsSafe().dStargaze);
        setStarSpeedSafe(1.0);
      }

      /* Inertia-aware wheel navigation (filters decaying trackpad momentum tail) */
      window.addEventListener('wheel', function (ev) {
        if (isDrawerOpen || ev.ctrlKey) return;

        if (!isStargazing && canActiveSectionScrollInternally(ev.deltaY)) {
          return;
        }

        ev.preventDefault();

        var now = nowMs();
        var absDy = Math.abs(ev.deltaY);

        if (isTransitioning || isClickDiving) {
          wheelAccum = 0.0;
          prevAbsDelta = absDy;
          lastWheelTs = now;
          return;
        }

        /* Ignore decaying momentum tails immediately after a completed snap */
        var sinceSnap = now - lastSnapTs;
        var isContinuousStream = (now - lastWheelTs) < 110;
        if (sinceSnap < 1150 && isContinuousStream && absDy <= prevAbsDelta * 1.05 && absDy < 45) {
          prevAbsDelta = absDy;
          lastWheelTs = now;
          return;
        }

        if (now - lastWheelTs > 150) {
          wheelAccum = 0.0;
        }
        lastWheelTs = now;
        prevAbsDelta = absDy;
        wheelAccum += ev.deltaY;

        if (isStargazing) {
          if (ev.deltaY > 18 || wheelAccum > 26) {
            wheelAccum = 0.0;
            handleStargazeDownIntent();
          } else if (ev.deltaY < -18 || wheelAccum < -26) {
            wheelAccum = 0.0;
            handleStargazeUpIntent();
          }
        } else {
          if (ev.deltaY > 20 || wheelAccum > 32) {
            wheelAccum = 0.0;
            goToSnap(activeIndex + 1);
          } else if (ev.deltaY < -20 || wheelAccum < -32) {
            wheelAccum = 0.0;
            if (activeIndex === 0) {
              exitToStargaze();
            } else {
              goToSnap(activeIndex - 1);
            }
          }
        }
      }, { passive: false });

      /* Touch swipe navigation */
      window.addEventListener('touchstart', function (ev) {
        if (!ev.touches || !ev.touches.length) return;
        touchStartY = ev.touches[0].clientY;
        touchStartX = ev.touches[0].clientX;
      }, { passive: true });

      window.addEventListener('touchend', function (ev) {
        if (isDrawerOpen || isTransitioning || isClickDiving) return;
        if (!ev.changedTouches || !ev.changedTouches.length) return;

        var dy = touchStartY - ev.changedTouches[0].clientY;
        var dx = touchStartX - ev.changedTouches[0].clientX;
        if (Math.abs(dy) < 34 || Math.abs(dx) > Math.abs(dy) * 1.1) return;

        if (!isStargazing && canActiveSectionScrollInternally(dy)) return;

        if (isStargazing) {
          if (dy > 34) {
            handleStargazeDownIntent();
          } else if (dy < -34) {
            handleStargazeUpIntent();
          }
        } else {
          if (dy > 34) {
            goToSnap(activeIndex + 1);
          } else if (dy < -34) {
            if (activeIndex === 0) {
              exitToStargaze();
            } else {
              goToSnap(activeIndex - 1);
            }
          }
        }
      }, { passive: true });

      /* Keyboard navigation */
      window.addEventListener('keydown', function (ev) {
        if (isDrawerOpen || isTransitioning || isClickDiving) return;
        if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

        var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || (ev.target && ev.target.isContentEditable)) {
          return;
        }

        var key = ev.key;
        var isDownKey = key === 'ArrowDown' || key === 'PageDown' || key === ' ';
        var isUpKey = key === 'ArrowUp' || key === 'PageUp';

        if (isStargazing) {
          if (isDownKey) {
            if (key === ' ' && (tag === 'button' || tag === 'a')) return;
            ev.preventDefault();
            handleStargazeDownIntent();
          } else if (isUpKey) {
            ev.preventDefault();
            handleStargazeUpIntent();
          }
        } else {
          if (isDownKey) {
            if (key === ' ' && (tag === 'button' || tag === 'a')) return;
            ev.preventDefault();
            goToSnap(activeIndex + 1);
          } else if (isUpKey) {
            ev.preventDefault();
            if (activeIndex === 0) {
              exitToStargaze();
            } else {
              goToSnap(activeIndex - 1);
            }
          } else if (key === 'Home') {
            ev.preventDefault();
            exitToStargaze();
          } else if (key === 'End') {
            ev.preventDefault();
            goToSnap(sections.length - 1);
          }
        }
      });

      /* Click handlers: [data-stargaze-enter], [data-stargaze-return], .snap-dot */
      document.addEventListener('click', function (ev) {
        var target = ev.target;
        if (!target || !target.closest) return;

        var enterBtn = target.closest('[data-stargaze-enter]');
        if (enterBtn) {
          ev.preventDefault();
          if (!isStargazing || isClickDiving) return;

          var bounds = getCameraBoundsSafe();
          if (getCosmicModeSafe() === 'blackhole' && getCameraDistanceSafe() > 2.0 && !isReducedMotion) {
            isClickDiving = true;
            isDiving = true;
            setDiveCaptionState();
            tweenCamera(bounds.dMin, CLICK_DIVE_DURATION_MS, function () {
              isClickDiving = false;
              isDiving = false;
              if (isStargazing) {
                enterContent(0, { instant: false });
              }
            });
          } else {
            setCameraDistanceSafe(bounds.dMin);
            enterContent(0, { instant: false });
          }
          return;
        }

        var returnBtn = target.closest('[data-stargaze-return]');
        if (returnBtn && isHome) {
          ev.preventDefault();
          setDrawerState(false);
          if (!isStargazing) {
            exitToStargaze();
          }
          return;
        }

        var dotBtn = target.closest('.snap-dot[data-snap-target]');
        if (dotBtn) {
          ev.preventDefault();
          var targetIdx = parseInt(dotBtn.getAttribute('data-snap-target') || '0', 10);
          if (!isNaN(targetIdx)) {
            if (isStargazing) {
              setCameraDistanceSafe(getCameraBoundsSafe().dMin);
              enterContent(targetIdx, { instant: false });
            } else {
              goToSnap(targetIdx);
            }
          }
        }
      });

      window.addEventListener('hashchange', function () {
        var idx = findSectionIndexByHash(window.location.hash);
        if (idx >= 0) {
          setCameraDistanceSafe(getCameraBoundsSafe().dMin);
          if (isStargazing) {
            enterContent(idx, { instant: false });
          } else {
            goToSnap(idx);
          }
        }
      });
    } else {
      /* Inner Pages: active nav + dynamic scroll header state + GPU reveals */
      if (siteNav) {
        siteNav.classList.remove('nav-hidden');
        siteNav.classList.add('nav-active');

        var navScrollTicking = false;
        var syncInnerNavScroll = function () {
          navScrollTicking = false;
          var y = window.pageYOffset || document.documentElement.scrollTop || 0;
          siteNav.classList.toggle('is-scrolled', y > 24);
        };
        window.addEventListener('scroll', function () {
          if (!navScrollTicking) {
            navScrollTicking = true;
            window.requestAnimationFrame(syncInnerNavScroll);
          }
        }, { passive: true });
        syncInnerNavScroll();
      }

      initInnerPageScrollReveals();
    }

    /* ═════════════════════════════════════════════════════════════════════════
     * 4. POINTER PARALLAX, WHISPER CURSOR SHEEN & AUTO-SLEEPING RAF LOOP
     * ═══════════════════════════════════════════════════════════════════════ */
    if (hasFinePointer) {
      if (cursorGlow) {
        cursorGlow.style.left = '0px';
        cursorGlow.style.top = '0px';
      }

      window.addEventListener('mousemove', function (ev) {
        if (cursorGlow && !isReducedMotion) {
          var halfW = (cursorGlow.offsetWidth || 440) * 0.5;
          var halfH = (cursorGlow.offsetHeight || 440) * 0.5;
          cursorTargetX = ev.clientX - halfW;
          cursorTargetY = ev.clientY - halfH;
          if (!cursorActive) {
            cursorCurrX = cursorTargetX;
            cursorCurrY = cursorTargetY;
            cursorActive = true;
          }
          cursorGlow.classList.add('is-visible');
        }

        if (!isReducedMotion) {
          var w = window.innerWidth || 1;
          var h = window.innerHeight || 1;
          targetMx = clamp((ev.clientX / w) - 0.5, -0.5, 0.5);
          targetMy = clamp((ev.clientY / h) - 0.5, -0.5, 0.5);
          wakeMotionLoop();
        }
      }, { passive: true });

      document.addEventListener('mouseleave', function () {
        if (cursorGlow) {
          cursorGlow.classList.remove('is-visible');
        }
        cursorActive = false;
        targetMx = 0.0;
        targetMy = 0.0;
        wakeMotionLoop();
      });
    }

    function motionFrame() {
      motionRafId = 0;

      var now = nowMs();
      var dtSec = clamp((now - lastMotionTs) / 1000.0, 0.0, 0.065);
      lastMotionTs = now;

      var keepAlive = false;

      /* Step camera dive/return tween */
      if (cameraTween) {
        var elapsed = now - cameraTween.startTs;
        var t = clamp(elapsed / cameraTween.duration, 0.0, 1.0);
        var eased = easeInOutQuart(t);
        var dVal = cameraTween.from + (cameraTween.to - cameraTween.from) * eased;
        setCameraDistanceSafe(dVal);

        if (t >= 1.0) {
          var doneCb = cameraTween.onDone;
          cameraTween = null;
          if (typeof doneCb === 'function') doneCb();
        } else {
          keepAlive = true;
        }
      }

      /* Frame-rate-independent pointer & cursor smoothing */
      if (hasFinePointer && !isReducedMotion && !document.hidden) {
        var ptrStep = 1.0 - Math.exp(-5.4 * dtSec);
        currMx += (targetMx - currMx) * ptrStep;
        currMy += (targetMy - currMy) * ptrStep;

        var ptrMoving = Math.abs(targetMx - currMx) > 0.0004 || Math.abs(targetMy - currMy) > 0.0004;
        if (!ptrMoving) {
          currMx = targetMx;
          currMy = targetMy;
        } else {
          keepAlive = true;
        }

        if (cursorGlow && cursorActive) {
          var glowStep = 1.0 - Math.exp(-11.0 * dtSec);
          cursorCurrX += (cursorTargetX - cursorCurrX) * glowStep;
          cursorCurrY += (cursorTargetY - cursorCurrY) * glowStep;
          cursorGlow.style.transform = 'translate3d(' + cursorCurrX.toFixed(1) + 'px, ' + cursorCurrY.toFixed(1) + 'px, 0)';
          if (Math.abs(cursorTargetX - cursorCurrX) > 0.4 || Math.abs(cursorTargetY - cursorCurrY) > 0.4) {
            keepAlive = true;
          }
        }

        if (starCanvas) {
          var sx = (currMx * -18.0).toFixed(2);
          var sy = (currMy * -12.0).toFixed(2);
          starCanvas.style.transform = 'translate3d(' + sx + 'px, ' + sy + 'px, 0) scale(1.03)';
        }

        if (isHome && !isStargazing && activeIndex === 0 && heroParallaxReady) {
          var blendStep = 1.0 - Math.exp(-4.5 * dtSec);
          heroParallaxBlend += (1.0 - heroParallaxBlend) * blendStep;
          if (1.0 - heroParallaxBlend > 0.004) {
            keepAlive = true;
          } else {
            heroParallaxBlend = 1.0;
          }
          var mx = currMx * heroParallaxBlend;
          var my = currMy * heroParallaxBlend;

          if (lineResearcher) {
            lineResearcher.style.transform = 'translate3d(' + (mx * 14.0).toFixed(2) + 'px, ' + (my * 9.0).toFixed(2) + 'px, 0)';
          }
          if (lineEngineer) {
            lineEngineer.style.transform = 'translate3d(' + (mx * 24.0).toFixed(2) + 'px, ' + (my * 15.0).toFixed(2) + 'px, 0)';
          }
          if (lineDreamer) {
            lineDreamer.style.transform = 'translate3d(' + (mx * 34.0).toFixed(2) + 'px, ' + (my * 22.0).toFixed(2) + 'px, 0)';
          }
        }
      }

      if (keepAlive) {
        motionRafId = window.requestAnimationFrame(motionFrame);
      }
    }

    /* ═════════════════════════════════════════════════════════════════════════
     * 5. INSTANTANEOUS HASH & DRAWER LINK HANDLING (NO 220MS CURTAIN DELAY)
     * ═══════════════════════════════════════════════════════════════════════ */
    document.addEventListener('click', function (ev) {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

      var link = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download')) return;

      var targetAttr = link.getAttribute('target');
      if (targetAttr && targetAttr !== '_self') return;

      var rawHref = link.getAttribute('href') || '';
      if (!rawHref) return;

      if (rawHref.charAt(0) === '#') {
        if (isHome) {
          var directSnapIdx = findSectionIndexByHash(rawHref);
          if (directSnapIdx >= 0) {
            ev.preventDefault();
            setDrawerState(false);
            setCameraDistanceSafe(getCameraBoundsSafe().dMin);
            if (isStargazing) {
              enterContent(directSnapIdx, { instant: false });
            } else {
              goToSnap(directSnapIdx);
            }
          }
        }
        return;
      }

      if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(rawHref)) return;

      var destUrl = null;
      try {
        destUrl = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }

      if (destUrl.origin !== window.location.origin) return;

      if (destUrl.pathname === window.location.pathname && destUrl.search === window.location.search) {
        if (destUrl.hash && isHome) {
          var snapIdx = findSectionIndexByHash(destUrl.hash);
          if (snapIdx >= 0) {
            ev.preventDefault();
            setDrawerState(false);
            setCameraDistanceSafe(getCameraBoundsSafe().dMin);
            if (isStargazing) {
              enterContent(snapIdx, { instant: false });
            } else {
              goToSnap(snapIdx);
            }
          }
        }
        return;
      }

      /* Close mobile drawer cleanly and allow immediate native @view-transition navigation */
      setDrawerState(false);
    });

    window.NausmindMotion = {
      enterContent: enterContent,
      exitToStargaze: exitToStargaze,
      goToSnap: goToSnap,
      tweenCamera: tweenCamera,
      refreshReveals: initInnerPageScrollReveals
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionSystem);
  } else {
    initMotionSystem();
  }
})();
