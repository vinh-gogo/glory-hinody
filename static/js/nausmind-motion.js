/**
 * Glory Hinody — Eclipse 3D Motion & Orbital Interaction Controller (nausmind-motion.js v3)
 * 360-Deg Inertial 3D Camera Orbit Drag (Desktop & Touch), Curved 3D Orbital Dive Flight,
 * Live HUD Telemetry, Inertia-Aware Snap Physics, Auto-Sleeping rAF & Native View Transitions
 */
(function () {
  'use strict';

  var SNAP_COOLDOWN_MS = 620;
  var DIVE_DURATION_MS = 1050;
  var CLICK_DIVE_DURATION_MS = 920;
  var SECOND_SCROLL_DIVE_MIN_MS = 440;
  var DIVE_TARGET_YAW = 0.46;   /* +26° curved orbital slingshot sweeping cleanly past the 3D planet's crescent */
  var DIVE_TARGET_PITCH = 0.11;

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

  function easeInOutQuart(t) {
    return t < 0.5
      ? 8.0 * t * t * t * t
      : 1.0 - Math.pow(-2.0 * t + 2.0, 4.0) / 2.0;
  }

  function wrapAnglePi(rad) {
    var r = rad % (Math.PI * 2.0);
    if (r > Math.PI) r -= Math.PI * 2.0;
    if (r < -Math.PI) r += Math.PI * 2.0;
    return r;
  }

  function formatDeg(rad) {
    var deg = wrapAnglePi(rad) * (180.0 / Math.PI);
    var sign = deg >= 0 ? '+' : '-';
    var abs = Math.abs(deg).toFixed(1);
    while (abs.length < 5) abs = '0' + abs;
    return sign + abs + '°';
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

    if (menu) menu.classList.toggle('is-open', isDrawerOpen);
    if (overlay) overlay.classList.toggle('is-open', isDrawerOpen);
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
        if (menuLink) setDrawerState(false);
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && isDrawerOpen) setDrawerState(false);
    });

    window.addEventListener('resize', function () {
      if (isDrawerOpen && (window.innerWidth || 1024) > 900) setDrawerState(false);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. MASTER 3D MOTION & ORBIT CONTROLLER
   * ═════════════════════════════════════════════════════════════════════════ */
  function initMotionSystem() {
    initMobileDrawer();

    var isHome = !!(document.body && document.body.classList.contains('is-home'));
    var siteNav = document.getElementById('site-nav');
    var scrollContainer = document.getElementById('scroll-container');
    var stargazingCaption = document.getElementById('stargazing-caption');
    var stargazingHud = document.getElementById('stargazing-hud');
    var orbitTelemetry = document.getElementById('orbit-telemetry');
    var orbitResetBtn = document.getElementById('orbit-reset-btn');
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

    /* Home & 3D Orbit State */
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

    /* 3D Drag-to-Orbit Physics */
    var isOrbitDragging = false;
    var orbitPointerId = null;
    var dragLastX = 0;
    var dragLastY = 0;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragMode = 'none'; /* 'none' | 'orbit' | 'swipe' */
    var orbitYaw = 0.0;
    var orbitPitch = 0.0;
    var orbitRoll = 0.0;
    var velYaw = 0.0;
    var velPitch = 0.0;
    var lastHudSyncTs = 0;

    /* Combined 3D Camera Flight Tween (Distance + Yaw + Pitch simultaneously!) */
    var cameraTween = null;

    /* Trackpad Wheel State */
    var wheelAccum = 0.0;
    var lastWheelTs = 0;
    var prevAbsDelta = 0.0;
    var lastSnapTs = 0;
    var touchStartY = 0;
    var touchStartX = 0;

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

    function setStargazingClasses(active) {
      if (document.body) {
        document.body.classList.toggle('is-stargazing', !!active);
        if (!active) document.body.classList.remove('is-orbiting');
      }
      if (stargazingHud) {
        stargazingHud.classList.toggle('visible', !!active);
      }
      if (typeof window.setStargazingState === 'function') {
        window.setStargazingState(!!active);
      }
    }

    function syncOrbitTelemetry(force) {
      var now = nowMs();
      if (!force && now - lastHudSyncTs < 55) return;
      lastHudSyncTs = now;

      var d = getCameraDistanceSafe();
      if (orbitTelemetry) {
        orbitTelemetry.textContent =
          'AZ ' + formatDeg(orbitYaw) + ' · EL ' + formatDeg(orbitPitch) + ' · ' + d.toFixed(1) + ' Rs';
      }
      if (orbitResetBtn) {
        var isDirty = Math.abs(wrapAnglePi(orbitYaw)) > 0.06 || Math.abs(orbitPitch) > 0.05 || d < getCameraBoundsSafe().dStargaze - 1.0;
        orbitResetBtn.classList.toggle('is-dirty', isStargazing && isDirty);
      }
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
      for (var i = 0; i < heroTimers.length; i++) clearTimeout(heroTimers[i]);
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
      return (typeof window.getCameraDistance === 'function') ? window.getCameraDistance() : 28.5;
    }

    function getCameraBoundsSafe() {
      return (typeof window.getCameraBounds === 'function')
        ? window.getCameraBounds()
        : { dMin: 1.6, dMax: 28.5, dStargaze: 28.5 };
    }

    function setCameraDistanceSafe(d) {
      if (typeof window.setCameraDistance === 'function') window.setCameraDistance(d);
    }

    function setOrbitAnglesSafe(y, p, r) {
      orbitYaw = y;
      orbitPitch = clamp(p, -0.58, 0.58);
      orbitRoll = clamp(typeof r === 'number' ? r : orbitRoll, -6.0, 6.0);
      if (typeof window.setOrbitAngles === 'function') {
        window.setOrbitAngles(orbitYaw, orbitPitch, orbitRoll);
      }
    }

    function setStarSpeedSafe(mult) {
      if (typeof window.setStarSpeed === 'function') window.setStarSpeed(mult);
    }

    /* Smooth 3D Flight Tween (distance + yaw + pitch simultaneously along curved path) */
    function tweenCamera3D(targetD, targetYaw, targetPitch, durationMs, onDone) {
      var dur = isReducedMotion ? 0 : (typeof durationMs === 'number' ? durationMs : DIVE_DURATION_MS);
      var fromD = getCameraDistanceSafe();
      var fromYaw = wrapAnglePi(orbitYaw);
      var fromPitch = orbitPitch;
      var toYaw = (typeof targetYaw === 'number') ? targetYaw : fromYaw;
      var toPitch = (typeof targetPitch === 'number') ? clamp(targetPitch, -0.58, 0.58) : fromPitch;

      /* Shortest angular arc across ±π */
      var deltaYaw = wrapAnglePi(toYaw - fromYaw);
      var finalYaw = fromYaw + deltaYaw;

      velYaw = 0.0;
      velPitch = 0.0;

      if (dur <= 0 || (Math.abs(targetD - fromD) < 0.02 && Math.abs(deltaYaw) < 0.005 && Math.abs(toPitch - fromPitch) < 0.005)) {
        cameraTween = null;
        setCameraDistanceSafe(targetD);
        setOrbitAnglesSafe(finalYaw, toPitch, 0.0);
        syncOrbitTelemetry(true);
        if (typeof onDone === 'function') onDone();
        return;
      }

      cameraTween = {
        fromD: fromD,
        toD: targetD,
        fromYaw: fromYaw,
        toYaw: finalYaw,
        fromPitch: fromPitch,
        toPitch: toPitch,
        startTs: nowMs(),
        duration: dur,
        onDone: onDone || null
      };
      wakeMotionLoop();
    }

    function tweenCamera(targetD, durationMs, onDone) {
      tweenCamera3D(targetD, orbitYaw, orbitPitch, durationMs, onDone);
    }

    function resetOrbitView() {
      if (!isHome) return;
      var bounds = getCameraBoundsSafe();
      restoreStargazeCaptionText();
      isDiving = false;
      tweenCamera3D(bounds.dStargaze, 0.0, 0.0, 820);
    }

    function updateSnapDots(idx) {
      for (var i = 0; i < snapDots.length; i++) {
        var dot = snapDots[i];
        var dotTarget = parseInt(dot.getAttribute('data-snap-target') || String(i), 10);
        var isCurrent = dotTarget === idx;
        dot.classList.toggle('is-active', isCurrent);
        if (isCurrent) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      }
    }

    function applySectionClasses(idx) {
      for (var i = 0; i < sections.length; i++) {
        var sec = sections[i];
        sec.classList.remove('is-active', 'exit-up', 'exit-down');
        if (i < idx) sec.classList.add('exit-up');
        else if (i > idx) sec.classList.add('exit-down');
        else sec.classList.add('is-active');
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
          for (var h = 0; h < heroLines.length; h++) heroLines[h].classList.add('visible');
          if (heroHint) heroHint.classList.add('visible');
          heroParallaxReady = true;
          wakeMotionLoop();
        } else {
          for (var j = 0; j < heroLines.length; j++) {
            (function (lineEl, delayMs) {
              heroTimers.push(setTimeout(function () {
                lineEl.classList.add('visible');
              }, delayMs));
            })(heroLines[j], j < delays.length ? delays[j] : (20 + j * 80));
          }
          if (heroHint) {
            heroTimers.push(setTimeout(function () {
              heroHint.classList.add('visible');
            }, 400));
          }
          heroTimers.push(setTimeout(function () {
            heroParallaxReady = true;
            wakeMotionLoop();
          }, 820));
        }
      } else {
        resetHeroLineParallax();
      }

      var reveals = section.querySelectorAll('.reveal-on-scroll, [data-word-reveal]');
      for (var r = 0; r < reveals.length; r++) revealElement(reveals[r]);

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
      isOrbitDragging = false;
      activeIndex = idx;

      setStargazingClasses(false);
      lockTransition(instant ? 60 : 540);

      if (stargazingCaption) stargazingCaption.classList.remove('visible', 'diving');
      restoreStargazeCaptionText();

      if (siteNav) {
        siteNav.classList.remove('nav-hidden');
        siteNav.classList.add('nav-active');
      }
      if (scrollContainer) scrollContainer.classList.add('content-visible');
      if (snapDotsWrap) snapDotsWrap.classList.add('visible');

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

      setStargazingClasses(true);
      lockTransition(SNAP_COOLDOWN_MS);
      clearHeroTimers();
      resetHeroLineParallax();

      if (scrollContainer) scrollContainer.classList.remove('content-visible');
      if (siteNav) {
        siteNav.classList.remove('nav-active');
        siteNav.classList.add('nav-hidden');
      }
      if (snapDotsWrap) snapDotsWrap.classList.remove('visible');

      for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('is-active', 'exit-up', 'exit-down');
      }
      var heroLines = document.querySelectorAll('#hero .hero-line, #hero .hero-scroll-hint');
      for (var h = 0; h < heroLines.length; h++) heroLines[h].classList.remove('visible');

      restoreStargazeCaptionText();
      if (stargazingCaption) stargazingCaption.classList.add('visible');

      setStarSpeedSafe(1.0);

      var bounds = getCameraBoundsSafe();
      if (getCosmicModeSafe() === 'blackhole') {
        tweenCamera3D(bounds.dStargaze, 0.0, 0.0, DIVE_DURATION_MS);
      } else {
        setCameraDistanceSafe(bounds.dStargaze);
        setOrbitAnglesSafe(0.0, 0.0, 0.0);
        syncOrbitTelemetry(true);
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

      if (mode === 'blackhole' && dist > 2.2) {
        if (!isDiving) {
          isDiving = true;
          diveStartTs = nowMs();
          setDiveCaptionState();
          /* Curved 3D orbital fly-around right past the 3D planet's crescent limb */
          tweenCamera3D(bounds.dMin, DIVE_TARGET_YAW, DIVE_TARGET_PITCH, DIVE_DURATION_MS, function () {
            isDiving = false;
          });
        } else if (nowMs() - diveStartTs >= SECOND_SCROLL_DIVE_MIN_MS) {
          isDiving = false;
          tweenCamera3D(bounds.dMin, DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 300);
          enterContent(0, { instant: false });
        }
      } else {
        setCameraDistanceSafe(bounds.dMin);
        setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
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
          tweenCamera3D(bounds.dMax, 0.0, 0.0, DIVE_DURATION_MS);
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
      if (directionY > 0) return sec.scrollTop + sec.clientHeight < sec.scrollHeight - 4;
      return sec.scrollTop > 4;
    }

    /* ── Home vs Inner Page Initialization ── */
    if (isHome && sections.length > 0) {
      var hashMatchIdx = findSectionIndexByHash(window.location.hash);
      if (hashMatchIdx >= 0) {
        setCameraDistanceSafe(getCameraBoundsSafe().dMin);
        setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
        enterContent(hashMatchIdx, { instant: true });
      } else {
        isStargazing = true;
        activeIndex = 0;
        setStargazingClasses(true);
        if (stargazingCaption) stargazingCaption.classList.add('visible');
        if (siteNav) {
          siteNav.classList.add('nav-hidden');
          siteNav.classList.remove('nav-active');
        }
        if (scrollContainer) scrollContainer.classList.remove('content-visible');
        if (snapDotsWrap) snapDotsWrap.classList.remove('visible');
        setCameraDistanceSafe(getCameraBoundsSafe().dStargaze);
        setOrbitAnglesSafe(0.0, 0.0, 0.0);
        setStarSpeedSafe(1.0);
        syncOrbitTelemetry(true);
      }

      /* ── 360° Interactive Pointer Drag-to-Orbit in 3D Stargazing Mode ── */
      function isInteractiveUI(target) {
        return !!(target && target.closest && target.closest('a, button, input, #stargazing-caption, #stargazing-hud, #site-nav, #mobile-menu'));
      }

      window.addEventListener('pointerdown', function (ev) {
        if (!isStargazing || isDrawerOpen || isClickDiving) return;
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        if (isInteractiveUI(ev.target)) return;

        isOrbitDragging = true;
        orbitPointerId = ev.pointerId;
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        dragLastX = ev.clientX;
        dragLastY = ev.clientY;
        dragMode = ev.pointerType === 'touch' ? 'none' : 'orbit';
        cameraTween = null;

        if (dragMode === 'orbit' && document.body) {
          document.body.classList.add('is-orbiting');
        }
      }, { passive: true });

      window.addEventListener('pointermove', function (ev) {
        if (!isOrbitDragging || ev.pointerId !== orbitPointerId) return;
        if (!isStargazing) {
          isOrbitDragging = false;
          return;
        }

        var dx = ev.clientX - dragLastX;
        var dy = ev.clientY - dragLastY;
        dragLastX = ev.clientX;
        dragLastY = ev.clientY;

        /* On touch screens, resolve horizontal orbit drag vs vertical scroll-dive swipe */
        if (dragMode === 'none') {
          var totalDx = Math.abs(ev.clientX - dragStartX);
          var totalDy = Math.abs(ev.clientY - dragStartY);
          if (totalDx < 8 && totalDy < 8) return;
          if (totalDx >= totalDy * 0.85) {
            dragMode = 'orbit';
            if (document.body) document.body.classList.add('is-orbiting');
          } else {
            dragMode = 'swipe';
            return;
          }
        }

        if (dragMode !== 'orbit') return;

        var w = Math.max(window.innerWidth || 1280, 320);
        var h = Math.max(window.innerHeight || 800, 320);
        var yawStep = -(dx / w) * 3.1;
        var pitchStep = (dy / h) * 2.0;

        setOrbitAnglesSafe(
          orbitYaw + yawStep,
          orbitPitch + pitchStep,
          clamp(-yawStep * 28.0, -3.5, 3.5)
        );

        velYaw = yawStep * 24.0;
        velPitch = pitchStep * 20.0;
        syncOrbitTelemetry(false);
        wakeMotionLoop();
      }, { passive: true });

      function endOrbitDrag(ev) {
        if (!isOrbitDragging) return;
        if (ev && ev.pointerId != null && ev.pointerId !== orbitPointerId) return;
        isOrbitDragging = false;
        orbitPointerId = null;
        dragMode = 'none';
        if (document.body) document.body.classList.remove('is-orbiting');
        wakeMotionLoop();
      }

      window.addEventListener('pointerup', endOrbitDrag, { passive: true });
      window.addEventListener('pointercancel', endOrbitDrag, { passive: true });

      /* Double-click open 3D space to smoothly spring back to the iconic Planetary Eclipse view */
      window.addEventListener('dblclick', function (ev) {
        if (!isStargazing || isDrawerOpen || isClickDiving) return;
        if (isInteractiveUI(ev.target)) return;
        resetOrbitView();
      });

      /* Inertia-aware wheel navigation */
      window.addEventListener('wheel', function (ev) {
        if (isDrawerOpen || ev.ctrlKey) return;

        if (!isStargazing && canActiveSectionScrollInternally(ev.deltaY)) return;

        ev.preventDefault();

        var now = nowMs();
        var absDy = Math.abs(ev.deltaY);

        if (isTransitioning || isClickDiving) {
          wheelAccum = 0.0;
          prevAbsDelta = absDy;
          lastWheelTs = now;
          return;
        }

        var sinceSnap = now - lastSnapTs;
        var isContinuousStream = (now - lastWheelTs) < 110;
        if (sinceSnap < 1150 && isContinuousStream && absDy <= prevAbsDelta * 1.05 && absDy < 45) {
          prevAbsDelta = absDy;
          lastWheelTs = now;
          return;
        }

        if (now - lastWheelTs > 150) wheelAccum = 0.0;
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
            if (activeIndex === 0) exitToStargaze();
            else goToSnap(activeIndex - 1);
          }
        }
      }, { passive: false });

      /* Touch swipe navigation (vertical swipes enter/snap; horizontal drags orbit in 3D) */
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
        if (Math.abs(dy) < 38 || Math.abs(dx) > Math.abs(dy) * 0.9) return;

        if (!isStargazing && canActiveSectionScrollInternally(dy)) return;

        if (isStargazing) {
          if (dy > 38) handleStargazeDownIntent();
          else if (dy < -38) handleStargazeUpIntent();
        } else {
          if (dy > 38) goToSnap(activeIndex + 1);
          else if (dy < -38) {
            if (activeIndex === 0) exitToStargaze();
            else goToSnap(activeIndex - 1);
          }
        }
      }, { passive: true });

      /* Keyboard navigation (ArrowLeft/ArrowRight orbit in 3D when stargazing; R resets view) */
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
          if (key === 'ArrowLeft') {
            ev.preventDefault();
            velYaw = 1.65;
            wakeMotionLoop();
            return;
          }
          if (key === 'ArrowRight') {
            ev.preventDefault();
            velYaw = -1.65;
            wakeMotionLoop();
            return;
          }
          if (key === 'r' || key === 'R') {
            ev.preventDefault();
            resetOrbitView();
            return;
          }
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
            if (activeIndex === 0) exitToStargaze();
            else goToSnap(activeIndex - 1);
          } else if (key === 'Home') {
            ev.preventDefault();
            exitToStargaze();
          } else if (key === 'End') {
            ev.preventDefault();
            goToSnap(sections.length - 1);
          }
        }
      });

      /* Click handlers: [data-stargaze-enter], [data-stargaze-return], [data-orbit-reset], .snap-dot */
      document.addEventListener('click', function (ev) {
        var target = ev.target;
        if (!target || !target.closest) return;

        var resetBtn = target.closest('[data-orbit-reset]');
        if (resetBtn) {
          ev.preventDefault();
          resetOrbitView();
          return;
        }

        var enterBtn = target.closest('[data-stargaze-enter]');
        if (enterBtn) {
          ev.preventDefault();
          if (!isStargazing || isClickDiving) return;

          var bounds = getCameraBoundsSafe();
          if (getCosmicModeSafe() === 'blackhole' && getCameraDistanceSafe() > 2.2 && !isReducedMotion) {
            isClickDiving = true;
            isDiving = true;
            setDiveCaptionState();
            tweenCamera3D(bounds.dMin, DIVE_TARGET_YAW, DIVE_TARGET_PITCH, CLICK_DIVE_DURATION_MS, function () {
              isClickDiving = false;
              isDiving = false;
              if (isStargazing) enterContent(0, { instant: false });
            });
          } else {
            setCameraDistanceSafe(bounds.dMin);
            setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
            enterContent(0, { instant: false });
          }
          return;
        }

        var returnBtn = target.closest('[data-stargaze-return]');
        if (returnBtn && isHome) {
          ev.preventDefault();
          setDrawerState(false);
          if (!isStargazing) exitToStargaze();
          return;
        }

        var dotBtn = target.closest('.snap-dot[data-snap-target]');
        if (dotBtn) {
          ev.preventDefault();
          var targetIdx = parseInt(dotBtn.getAttribute('data-snap-target') || '0', 10);
          if (!isNaN(targetIdx)) {
            if (isStargazing) {
              setCameraDistanceSafe(getCameraBoundsSafe().dMin);
              setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
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
          setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
          if (isStargazing) enterContent(idx, { instant: false });
          else goToSnap(idx);
        }
      });
    } else {
      /* Inner Pages */
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
     * 4. POINTER PARALLAX, INERTIAL 3D ORBIT & AUTO-SLEEPING RAF LOOP
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
        if (cursorGlow) cursorGlow.classList.remove('is-visible');
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

      /* 1. Step 3D Curved Flight Tween (Distance + Yaw + Pitch with Orbital Slingshot Safety) */
      if (cameraTween) {
        var elapsed = now - cameraTween.startTs;
        var t = clamp(elapsed / cameraTween.duration, 0.0, 1.0);
        var eased = easeInOutQuart(t);
        var isInwardDive = cameraTween.toD < cameraTween.fromD - 2.0;
        var yawEased = isInwardDive ? (1.0 - Math.pow(1.0 - t, 2.5)) : eased;
        var dVal = cameraTween.fromD + (cameraTween.toD - cameraTween.fromD) * eased;
        var yawVal = cameraTween.fromYaw + (cameraTween.toYaw - cameraTween.fromYaw) * yawEased;
        var pitchVal = cameraTween.fromPitch + (cameraTween.toPitch - cameraTween.fromPitch) * eased;
        var bankRoll = Math.sin(t * Math.PI) * clamp((cameraTween.toYaw - cameraTween.fromYaw) * 3.8, -3.2, 3.2);

        setCameraDistanceSafe(dVal);
        setOrbitAnglesSafe(yawVal, pitchVal, bankRoll);
        syncOrbitTelemetry(false);

        if (t >= 1.0) {
          var doneCb = cameraTween.onDone;
          cameraTween = null;
          setOrbitAnglesSafe(yawVal, pitchVal, 0.0);
          syncOrbitTelemetry(true);
          if (typeof doneCb === 'function') doneCb();
        } else {
          keepAlive = true;
        }
      } else if (isHome && isStargazing && !isOrbitDragging) {
        /* 2. Inertial 3D Orbital Glide after drag release + roll level-out */
        var hasVel = Math.abs(velYaw) > 0.002 || Math.abs(velPitch) > 0.002 || Math.abs(orbitRoll) > 0.03;
        if (hasVel) {
          var damp = Math.exp(-3.4 * dtSec);
          velYaw *= damp;
          velPitch *= damp;
          var nextRoll = orbitRoll * Math.exp(-5.0 * dtSec);
          setOrbitAnglesSafe(
            orbitYaw + velYaw * dtSec,
            orbitPitch + velPitch * dtSec,
            nextRoll
          );
          syncOrbitTelemetry(false);
          keepAlive = true;
        } else {
          velYaw = 0.0;
          velPitch = 0.0;
          if (orbitRoll !== 0.0) {
            setOrbitAnglesSafe(orbitYaw, orbitPitch, 0.0);
          }
        }
      }

      /* 3. Frame-rate-independent pointer & cursor sheen smoothing */
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

        /* Only apply flat canvas shift on inner pages or 2D Starfield mode (3D Eclipse projects natively!) */
        if (starCanvas && (!isHome || getCosmicModeSafe() !== 'blackhole')) {
          var sx = (currMx * -18.0).toFixed(2);
          var sy = (currMy * -12.0).toFixed(2);
          starCanvas.style.transform = 'translate3d(' + sx + 'px, ' + sy + 'px, 0) scale(1.03)';
        } else if (starCanvas) {
          starCanvas.style.transform = '';
        }

        if (isHome && !isStargazing && activeIndex === 0 && heroParallaxReady) {
          var blendStep = 1.0 - Math.exp(-4.5 * dtSec);
          heroParallaxBlend += (1.0 - heroParallaxBlend) * blendStep;
          if (1.0 - heroParallaxBlend > 0.004) keepAlive = true;
          else heroParallaxBlend = 1.0;

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
     * 5. INSTANTANEOUS HASH & DRAWER LINK HANDLING (NATIVE @view-transition)
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
            setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
            if (isStargazing) enterContent(directSnapIdx, { instant: false });
            else goToSnap(directSnapIdx);
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
            setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
            if (isStargazing) enterContent(snapIdx, { instant: false });
            else goToSnap(snapIdx);
          }
        }
        return;
      }

      setDrawerState(false);
    });

    window.NausmindMotion = {
      enterContent: enterContent,
      exitToStargaze: exitToStargaze,
      goToSnap: goToSnap,
      tweenCamera: tweenCamera,
      tweenCamera3D: tweenCamera3D,
      resetOrbitView: resetOrbitView,
      refreshReveals: initInnerPageScrollReveals
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionSystem);
  } else {
    initMotionSystem();
  }
})();
