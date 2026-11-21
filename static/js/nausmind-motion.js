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
    var orbitExploreBtn = document.getElementById('orbit-explore-btn');
    var earthHotspotLink = document.getElementById('earth-planet-link');
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

    /* Combined 3D Camera Flight Tween (Distance + Yaw + Pitch + Cinema LookTarget/Zoom) */
    var cameraTween = null;

    /* Full Cinema Rig Auto-Explore Controller (8-Shot Closed-Loop C2 Periodic Cubic B-Spline) */
    var EXPLORE_LOOP_SEC = 58.0;
    var TWO_PI = Math.PI * 2.0;
    var CINEMA_SHOTS = [
      /* 0: Establishing Eclipse (Ngọ 180° · Sư Tử) */
      { yaw: -0.13, pitch:  0.00, dist: 28.2, tx:  0.0,  ty:  0.2, tz: 0.0, zoom: 0.96 },
      /* 1: Telephoto Hero Close-Up locked onto Earth glory-vocabulary */
      { yaw: -0.28, pitch: -0.14, dist: 21.0, tx: -15.4, ty: -7.4, tz: 3.1, zoom: 1.74 },
      /* 2: Wide Celestial Crown Pan across Cancer (Mùi) -> Gemini (Thân) clearing giant planet */
      { yaw: -0.96, pitch:  0.24, dist: 28.4, tx:  0.0,  ty:  6.6, tz: 0.0, zoom: 0.90 },
      /* 3: High-Angle Accretion Vortex Flyby (Dậu · Kim Ngưu & Pleiades) */
      { yaw: -1.68, pitch: -0.34, dist: 20.0, tx:  0.0,  ty:  4.2, tz: 0.0, zoom: 1.06 },
      /* 4: Far-Side Constellation Tilt across Aries (Tuất) -> Pisces (Hợi) */
      { yaw: -2.46, pitch:  0.14, dist: 27.0, tx:  0.0,  ty:  6.5, tz: 0.0, zoom: 0.93 },
      /* 5: Intimate North Galactic Crossing (Tý 0° · Bảo Bình) with Giant Planet Eclipsing Behind BH */
      { yaw: -3.28, pitch: -0.09, dist: 16.6, tx:  0.0,  ty:  0.8, tz: 0.0, zoom: 1.20 },
      /* 6: Dramatic Hero Sweep past Backlit Night-Side Earth & Moon to Scorpius (Mão) */
      { yaw: -4.56, pitch: -0.04, dist: 25.0, tx:  0.0,  ty:  1.4, tz: 0.0, zoom: 1.02 },
      /* 7: Grand Wide Pull-Out across Libra (Thìn) & Virgo (Tỵ) flowing endlessly through Ngọ */
      { yaw: -5.48, pitch: -0.11, dist: 28.2, tx:  0.0,  ty:  2.4, tz: 0.0, zoom: 0.91 }
    ];
    var isAutoExploring = false;
    var explorePhaseSec = 0.0;
    var exploreEntrySec = 0.0;
    var exploreEntryOrigin = null;
    var exploreTimeScale = 1.0;
    var isEarthHovered = false;
    var isRelaxingCinemaRig = false;
    var reducedMotionExploreStepTs = 0;

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

    function formatCompassDeg(deg) {
      var wrapped = ((deg % 360.0) + 360.0) % 360.0;
      var s = wrapped.toFixed(1);
      while (s.length < 5) s = '0' + s;
      return s + '°';
    }

    function syncOrbitTelemetry(force) {
      var now = nowMs();
      if (!force && now - lastHudSyncTs < 55) return;
      lastHudSyncTs = now;

      var d = getCameraDistanceSafe();
      if (orbitTelemetry) {
        var focused = (typeof window.getFocusedConstellation === 'function')
          ? window.getFocusedConstellation()
          : null;
        if (focused) {
          var isEn = /^en/i.test(document.documentElement ? (document.documentElement.lang || '') : '');
          var azLabel = formatCompassDeg(focused.compassAzDeg);
          if (isEn) {
            orbitTelemetry.textContent =
              focused.chiEn.toUpperCase() + ' ' + azLabel + ' · ' + focused.nameEn.toUpperCase() + ' · EL ' + formatDeg(orbitPitch) + ' · ' + d.toFixed(1) + ' Rs';
          } else {
            orbitTelemetry.textContent =
              'CUNG ' + focused.chiVi.toUpperCase() + ' ' + azLabel + ' · ' + focused.nameVi.toUpperCase() + ' · EL ' + formatDeg(orbitPitch) + ' · ' + d.toFixed(1) + ' Rs';
          }
        } else {
          orbitTelemetry.textContent =
            'AZ ' + formatDeg(orbitYaw) + ' · EL ' + formatDeg(orbitPitch) + ' · ' + d.toFixed(1) + ' Rs';
        }
      }
      if (orbitResetBtn) {
        var rigNow = getCinemaRigSafe();
        var isRigDirty = Math.abs(rigNow.x) > 0.08 || Math.abs(rigNow.y) > 0.08 || Math.abs(rigNow.z) > 0.08 || Math.abs(rigNow.zoom - 1.0) > 0.02;
        var isDirty = isAutoExploring || Math.abs(wrapAnglePi(orbitYaw)) > 0.06 || Math.abs(orbitPitch) > 0.05 || d < getCameraBoundsSafe().dStargaze - 1.0 || isRigDirty;
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

    var syncingOrbitFromMotion = false;

    function setOrbitAnglesSafe(y, p, r) {
      orbitYaw = y;
      orbitPitch = clamp(p, -0.58, 0.58);
      orbitRoll = clamp(typeof r === 'number' ? r : orbitRoll, -6.0, 6.0);
      if (typeof window.setOrbitAngles === 'function') {
        syncingOrbitFromMotion = true;
        window.setOrbitAngles(orbitYaw, orbitPitch, orbitRoll);
        syncingOrbitFromMotion = false;
      }
    }

    window.__nmSyncOrbitHud = function (yaw, pitch, roll) {
      if (syncingOrbitFromMotion) return;
      if (typeof yaw === 'number' && isFinite(yaw)) orbitYaw = yaw;
      if (typeof pitch === 'number' && isFinite(pitch)) orbitPitch = clamp(pitch, -0.58, 0.58);
      if (typeof roll === 'number' && isFinite(roll)) orbitRoll = clamp(roll, -6.0, 6.0);
      syncOrbitTelemetry(true);
    };

    function setStarSpeedSafe(mult) {
      if (typeof window.setStarSpeed === 'function') window.setStarSpeed(mult);
    }

    function getCinemaRigSafe() {
      return (typeof window.getCinemaRig === 'function')
        ? window.getCinemaRig()
        : { x: 0.0, y: 0.0, z: 0.0, zoom: 1.0 };
    }

    function setCinemaRigSafe(tx, ty, tz, zoomMul) {
      if (typeof window.setCinemaRig === 'function') {
        window.setCinemaRig(tx, ty, tz, zoomMul);
      }
    }

    function setCinemaExploreBlendSafe(target, immediate) {
      if (typeof window.setCinemaExploreBlend === 'function') {
        window.setCinemaExploreBlend(target, !!immediate);
      }
    }

    function getCinemaExploreBlendSafe() {
      return (typeof window.getCinemaExploreBlend === 'function')
        ? window.getCinemaExploreBlend()
        : 0.0;
    }

    /* Uniform Periodic Cubic B-Spline (exact C2 continuity across all knots & cycle wrap, zero overshoot) */
    function cubicBSpline(p0, p1, p2, p3, u) {
      var u2 = u * u;
      var u3 = u2 * u;
      var om = 1.0 - u;
      return (
        (om * om * om) * p0 +
        (3.0 * u3 - 6.0 * u2 + 4.0) * p1 +
        (-3.0 * u3 + 3.0 * u2 + 3.0 * u + 1.0) * p2 +
        u3 * p3
      ) / 6.0;
    }

    function cubicBSplineDeriv(p0, p1, p2, p3, u) {
      var u2 = u * u;
      var om = 1.0 - u;
      return (
        (-om * om) * p0 +
        (3.0 * u2 - 4.0 * u) * p1 +
        (-3.0 * u2 + 2.0 * u + 1.0) * p2 +
        u2 * p3
      ) * 0.5;
    }

    function getShotWrappedYaw(rawIdx) {
      var n = CINEMA_SHOTS.length;
      if (rawIdx < 0) return CINEMA_SHOTS[rawIdx + n].yaw + TWO_PI;
      if (rawIdx >= n) return CINEMA_SHOTS[rawIdx - n].yaw - TWO_PI;
      return CINEMA_SHOTS[rawIdx].yaw;
    }

    function sampleCinemaSpline(phaseSec) {
      var n = CINEMA_SHOTS.length;
      var wrapped = ((phaseSec % EXPLORE_LOOP_SEC) + EXPLORE_LOOP_SEC) % EXPLORE_LOOP_SEC;
      var scaled = (wrapped / EXPLORE_LOOP_SEC) * n;
      var seg = Math.floor(scaled) % n;
      var u = scaled - Math.floor(scaled);

      var s0 = CINEMA_SHOTS[(seg - 1 + n) % n];
      var s1 = CINEMA_SHOTS[seg];
      var s2 = CINEMA_SHOTS[(seg + 1) % n];
      var s3 = CINEMA_SHOTS[(seg + 2) % n];

      var y0 = getShotWrappedYaw(seg - 1);
      var y1 = getShotWrappedYaw(seg);
      var y2 = getShotWrappedYaw(seg + 1);
      var y3 = getShotWrappedYaw(seg + 2);

      var yaw = cubicBSpline(y0, y1, y2, y3, u);
      var yawVel = cubicBSplineDeriv(y0, y1, y2, y3, u) * (n / EXPLORE_LOOP_SEC);
      var pitch = clamp(cubicBSpline(s0.pitch, s1.pitch, s2.pitch, s3.pitch, u), -0.52, 0.52);
      var dist = cubicBSpline(s0.dist, s1.dist, s2.dist, s3.dist, u);
      var tx = cubicBSpline(s0.tx, s1.tx, s2.tx, s3.tx, u);
      var ty = cubicBSpline(s0.ty, s1.ty, s2.ty, s3.ty, u);
      var tz = cubicBSpline(s0.tz, s1.tz, s2.tz, s3.tz, u);
      var zoom = clamp(cubicBSpline(s0.zoom, s1.zoom, s2.zoom, s3.zoom, u), 0.86, 1.56);

      /* C2-smooth runtime clearance floor around foreground Giant Planet at yaw ≈ -0.662 rad */
      var planetDelta = Math.abs(wrapAnglePi(yaw + 0.662));
      if (planetDelta < 0.72) {
        var uPl = 1.0 - (planetDelta / 0.72);
        var wPl = uPl * uPl * uPl * (uPl * (uPl * 6.0 - 15.0) + 10.0);
        var floorDist = 16.0 + 12.35 * wPl;
        var kSmax = 1.6;
        var hSmax = clamp(0.5 + 0.5 * (floorDist - dist) / kSmax, 0.0, 1.0);
        dist = dist + (floorDist - dist) * hSmax + kSmax * hSmax * (1.0 - hSmax);
      }
      dist = clamp(dist, 16.0, 28.5);

      return { yaw: yaw, yawVel: yawVel, pitch: pitch, dist: dist, tx: tx, ty: ty, tz: tz, zoom: zoom };
    }

    function sampleCinemaFrame(phaseSec) {
      var cur = sampleCinemaSpline(phaseSec);
      cur.roll = clamp(-cur.yawVel * 5.2, -3.2, 3.2);
      return cur;
    }

    function syncExploreButtonUI() {
      if (!orbitExploreBtn) return;
      orbitExploreBtn.classList.toggle('is-exploring', isAutoExploring);
      orbitExploreBtn.setAttribute('aria-pressed', isAutoExploring ? 'true' : 'false');
      var labelEl = orbitExploreBtn.querySelector('.orbit-explore-label');
      if (labelEl) {
        var nextText = isAutoExploring
          ? (orbitExploreBtn.getAttribute('data-label-stop') || 'Stop Explore')
          : (orbitExploreBtn.getAttribute('data-label-start') || 'Auto Explore');
        labelEl.textContent = nextText;
      }
    }

    function findBestExploreStartPhase(currYaw) {
      if (Math.abs(wrapAnglePi(currYaw)) < 0.48 && Math.abs(orbitPitch) < 0.30) {
        return 0.0;
      }
      var bestT = 0.0;
      var bestErr = 99.0;
      var samples = 48;
      for (var i = 0; i < samples; i++) {
        var t = (i / samples) * EXPLORE_LOOP_SEC;
        var p = sampleCinemaSpline(t);
        var err = Math.abs(wrapAnglePi(p.yaw - currYaw));
        if (err < bestErr) {
          bestErr = err;
          bestT = t;
        }
      }
      return bestT;
    }

    function startAutoExplore() {
      if (!isHome || !isStargazing || isClickDiving) return;
      if (getCosmicModeSafe() !== 'blackhole') return;

      cameraTween = null;
      isDiving = false;
      isRelaxingCinemaRig = false;
      velYaw = 0.0;
      velPitch = 0.0;
      restoreStargazeCaptionText();

      var rig = getCinemaRigSafe();
      explorePhaseSec = findBestExploreStartPhase(orbitYaw);
      exploreEntrySec = 0.0;
      exploreTimeScale = 1.0;
      exploreEntryOrigin = {
        yaw: wrapAnglePi(orbitYaw),
        pitch: orbitPitch,
        dist: getCameraDistanceSafe(),
        roll: orbitRoll,
        tx: rig.x,
        ty: rig.y,
        tz: rig.z,
        zoom: rig.zoom,
        exploreBlend: getCinemaExploreBlendSafe()
      };
      if (isReducedMotion) {
        setCinemaExploreBlendSafe(1.0, true);
      }
      reducedMotionExploreStepTs = nowMs();
      isAutoExploring = true;
      syncExploreButtonUI();
      syncOrbitTelemetry(true);
      wakeMotionLoop();
    }

    function stopAutoExplore(relaxRig) {
      if (!isAutoExploring && !relaxRig) return;
      isAutoExploring = false;
      exploreEntryOrigin = null;
      setCinemaExploreBlendSafe(0.0, false);
      if (relaxRig) {
        isRelaxingCinemaRig = true;
        wakeMotionLoop();
      }
      syncExploreButtonUI();
      syncOrbitTelemetry(true);
    }

    function toggleAutoExplore() {
      if (isAutoExploring) stopAutoExplore(false);
      else startAutoExplore();
    }

    function setExploreTimeSec(sec) {
      if (!isHome) return;
      var t = Number(sec) || 0.0;
      explorePhaseSec = ((t % EXPLORE_LOOP_SEC) + EXPLORE_LOOP_SEC) % EXPLORE_LOOP_SEC;
      exploreEntrySec = 10.0;
      exploreEntryOrigin = null;
      var pose = sampleCinemaFrame(explorePhaseSec);
      setCinemaExploreBlendSafe(1.0, true);
      setCameraDistanceSafe(pose.dist);
      setCinemaRigSafe(pose.tx, pose.ty, pose.tz, pose.zoom);
      setOrbitAnglesSafe(pose.yaw, pose.pitch, pose.roll);
      syncOrbitTelemetry(true);
    }

    /* Smooth 3D Flight Tween (distance + yaw + pitch + cinema rig simultaneously along curved path) */
    function tweenCamera3D(targetD, targetYaw, targetPitch, durationMs, onDone) {
      var dur = isReducedMotion ? 0 : (typeof durationMs === 'number' ? durationMs : DIVE_DURATION_MS);
      var fromD = getCameraDistanceSafe();
      var fromYaw = wrapAnglePi(orbitYaw);
      var fromPitch = orbitPitch;
      var fromRig = getCinemaRigSafe();
      var toYaw = (typeof targetYaw === 'number') ? targetYaw : fromYaw;
      var toPitch = (typeof targetPitch === 'number') ? clamp(targetPitch, -0.58, 0.58) : fromPitch;

      /* Shortest angular arc across ±π */
      var deltaYaw = wrapAnglePi(toYaw - fromYaw);
      var finalYaw = fromYaw + deltaYaw;

      velYaw = 0.0;
      velPitch = 0.0;
      isRelaxingCinemaRig = false;

      var rigMoved = Math.abs(fromRig.x) > 0.02 || Math.abs(fromRig.y) > 0.02 || Math.abs(fromRig.z) > 0.02 || Math.abs(fromRig.zoom - 1.0) > 0.01;

      if (dur <= 0 || (!rigMoved && Math.abs(targetD - fromD) < 0.02 && Math.abs(deltaYaw) < 0.005 && Math.abs(toPitch - fromPitch) < 0.005)) {
        cameraTween = null;
        setCameraDistanceSafe(targetD);
        setCinemaRigSafe(0.0, 0.0, 0.0, 1.0);
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
        fromTx: fromRig.x,
        fromTy: fromRig.y,
        fromTz: fromRig.z,
        fromZoom: fromRig.zoom,
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
      stopAutoExplore(false);
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

      stopAutoExplore(false);
      isRelaxingCinemaRig = false;
      setCinemaExploreBlendSafe(0.0, true);
      setCinemaRigSafe(0.0, 0.0, 0.0, 1.0);

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
      stopAutoExplore(false);

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
        setCinemaRigSafe(0.0, 0.0, 0.0, 1.0);
        setOrbitAnglesSafe(DIVE_TARGET_YAW, DIVE_TARGET_PITCH, 0.0);
        enterContent(0, { instant: false });
      }
    }

    function handleStargazeUpIntent() {
      if (isTransitioning || isClickDiving) return;
      if (getCosmicModeSafe() === 'blackhole') {
        var bounds = getCameraBoundsSafe();
        var rig = getCinemaRigSafe();
        var rigDirty = Math.abs(rig.x) > 0.08 || Math.abs(rig.y) > 0.08 || Math.abs(rig.z) > 0.08 || Math.abs(rig.zoom - 1.0) > 0.02;
        if (isAutoExploring || getCameraDistanceSafe() < bounds.dMax - 0.5 || rigDirty) {
          stopAutoExplore(false);
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

      if (earthHotspotLink) {
        earthHotspotLink.addEventListener('mouseenter', function () {
          isEarthHovered = true;
        }, { passive: true });
        earthHotspotLink.addEventListener('mouseleave', function () {
          isEarthHovered = false;
        }, { passive: true });
      }

      window.addEventListener('nm:cosmic-mode-change', function (ev) {
        if (ev && ev.detail && ev.detail.mode !== 'blackhole') {
          stopAutoExplore(false);
        }
      });

      window.addEventListener('pointerdown', function (ev) {
        if (!isStargazing || isDrawerOpen || isClickDiving) return;
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        if (isInteractiveUI(ev.target)) return;

        if (isAutoExploring) {
          stopAutoExplore(true);
        } else {
          var rigDrag = getCinemaRigSafe();
          if (Math.abs(rigDrag.x) > 0.05 || Math.abs(rigDrag.y) > 0.05 || Math.abs(rigDrag.z) > 0.05 || Math.abs(rigDrag.zoom - 1.0) > 0.02) {
            isRelaxingCinemaRig = true;
            wakeMotionLoop();
          }
        }

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
          if (key === 'a' || key === 'A') {
            ev.preventDefault();
            toggleAutoExplore();
            return;
          }
          if (key === 'Escape' && isAutoExploring) {
            ev.preventDefault();
            stopAutoExplore(false);
            return;
          }
          if (key === 'ArrowLeft') {
            ev.preventDefault();
            stopAutoExplore(true);
            velYaw = 1.65;
            wakeMotionLoop();
            return;
          }
          if (key === 'ArrowRight') {
            ev.preventDefault();
            stopAutoExplore(true);
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

      /* Click handlers: [data-orbit-explore], [data-orbit-reset], [data-stargaze-enter], [data-stargaze-return], .snap-dot */
      document.addEventListener('click', function (ev) {
        var target = ev.target;
        if (!target || !target.closest) return;

        var exploreBtn = target.closest('[data-orbit-explore]');
        if (exploreBtn) {
          ev.preventDefault();
          toggleAutoExplore();
          return;
        }

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
          stopAutoExplore(false);

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

      /* 1. Step 3D Curved Flight Tween (Distance + Yaw + Pitch + Cinema Rig with Slingshot Safety) */
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
        var txVal = (cameraTween.fromTx || 0.0) * (1.0 - eased);
        var tyVal = (cameraTween.fromTy || 0.0) * (1.0 - eased);
        var tzVal = (cameraTween.fromTz || 0.0) * (1.0 - eased);
        var zoomVal = (cameraTween.fromZoom || 1.0) + (1.0 - (cameraTween.fromZoom || 1.0)) * eased;

        setCameraDistanceSafe(dVal);
        setCinemaRigSafe(txVal, tyVal, tzVal, zoomVal);
        setOrbitAnglesSafe(yawVal, pitchVal, bankRoll);
        syncOrbitTelemetry(false);

        if (t >= 1.0) {
          var doneCb = cameraTween.onDone;
          cameraTween = null;
          setCinemaRigSafe(0.0, 0.0, 0.0, 1.0);
          setOrbitAnglesSafe(yawVal, pitchVal, 0.0);
          syncOrbitTelemetry(true);
          if (typeof doneCb === 'function') doneCb();
        } else {
          keepAlive = true;
        }
      } else if (isHome && isStargazing && isAutoExploring && !isOrbitDragging) {
        /* 2a. Full Cinema Rig Auto-Explore Tour (4-Axis Spline + LookTarget + Dynamic Lens + Bullet-Time Hover) */
        if (!document.hidden) {
          if (isReducedMotion) {
            if (now - reducedMotionExploreStepTs >= 3800) {
              reducedMotionExploreStepTs = now;
              explorePhaseSec = (explorePhaseSec + (EXPLORE_LOOP_SEC / CINEMA_SHOTS.length)) % EXPLORE_LOOP_SEC;
              var rmPose = sampleCinemaFrame(explorePhaseSec);
              setCameraDistanceSafe(rmPose.dist);
              setCinemaRigSafe(rmPose.tx, rmPose.ty, rmPose.tz, rmPose.zoom);
              setOrbitAnglesSafe(rmPose.yaw, rmPose.pitch, 0.0);
              syncOrbitTelemetry(true);
            }
          } else {
            var targetScale = isEarthHovered ? 0.14 : 1.0;
            exploreTimeScale += (targetScale - exploreTimeScale) * (1.0 - Math.exp(-5.0 * dtSec));
            explorePhaseSec = (explorePhaseSec + dtSec * exploreTimeScale) % EXPLORE_LOOP_SEC;
            exploreEntrySec += dtSec;

            var splinePose = sampleCinemaFrame(explorePhaseSec);
            var outYaw = splinePose.yaw;
            var outPitch = splinePose.pitch;
            var outDist = splinePose.dist;
            var outRoll = splinePose.roll;
            var outTx = splinePose.tx;
            var outTy = splinePose.ty;
            var outTz = splinePose.tz;
            var outZoom = splinePose.zoom;

            if (exploreEntryOrigin && exploreEntrySec < 2.45) {
              var eb = clamp(exploreEntrySec / 2.45, 0.0, 1.0);
              var s = eb * eb * eb * (eb * (eb * 6.0 - 15.0) + 10.0);
              var dyShortest = wrapAnglePi(splinePose.yaw - exploreEntryOrigin.yaw);
              outYaw = exploreEntryOrigin.yaw + dyShortest * s;
              outPitch = exploreEntryOrigin.pitch + (splinePose.pitch - exploreEntryOrigin.pitch) * s;
              outDist = exploreEntryOrigin.dist + (splinePose.dist - exploreEntryOrigin.dist) * s;
              outRoll = exploreEntryOrigin.roll + (splinePose.roll - exploreEntryOrigin.roll) * s;
              outTx = exploreEntryOrigin.tx + (splinePose.tx - exploreEntryOrigin.tx) * s;
              outTy = exploreEntryOrigin.ty + (splinePose.ty - exploreEntryOrigin.ty) * s;
              outTz = exploreEntryOrigin.tz + (splinePose.tz - exploreEntryOrigin.tz) * s;
              outZoom = exploreEntryOrigin.zoom + (splinePose.zoom - exploreEntryOrigin.zoom) * s;
              var outExploreBlend = (exploreEntryOrigin.exploreBlend || 0.0) + (1.0 - (exploreEntryOrigin.exploreBlend || 0.0)) * s;
              setCinemaExploreBlendSafe(outExploreBlend, true);
            } else {
              exploreEntryOrigin = null;
              setCinemaExploreBlendSafe(1.0, true);
            }

            setCameraDistanceSafe(outDist);
            setCinemaRigSafe(outTx, outTy, outTz, outZoom);
            setOrbitAnglesSafe(outYaw, outPitch, outRoll);
            syncOrbitTelemetry(false);
          }
        }
        keepAlive = true;
      } else if (isHome && isStargazing && !isOrbitDragging) {
        /* 2b. Inertial 3D Orbital Glide after drag release + roll level-out */
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

      /* 2c. Smooth Cinema Rig relaxation back to Gargantua center when user takes manual control */
      if (isRelaxingCinemaRig && !cameraTween && !isAutoExploring) {
        var rNow = getCinemaRigSafe();
        var rDecay = Math.exp(-4.6 * dtSec);
        var nx = rNow.x * rDecay;
        var ny = rNow.y * rDecay;
        var nz = rNow.z * rDecay;
        var nZoom = 1.0 + (rNow.zoom - 1.0) * rDecay;
        var boundsR = getCameraBoundsSafe();
        var dNow = getCameraDistanceSafe();
        var nDist = dNow + (boundsR.dStargaze - dNow) * (1.0 - Math.exp(-3.2 * dtSec));
        var stillRelaxing = Math.abs(nx) > 0.02 || Math.abs(ny) > 0.02 || Math.abs(nz) > 0.02 || Math.abs(nZoom - 1.0) > 0.004 || Math.abs(boundsR.dStargaze - nDist) > 0.08;
        if (!stillRelaxing) {
          setCinemaRigSafe(0.0, 0.0, 0.0, 1.0);
          setCameraDistanceSafe(boundsR.dStargaze);
          isRelaxingCinemaRig = false;
          syncOrbitTelemetry(true);
        } else {
          setCinemaRigSafe(nx, ny, nz, nZoom);
          setCameraDistanceSafe(nDist);
          syncOrbitTelemetry(false);
          keepAlive = true;
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
      startAutoExplore: startAutoExplore,
      stopAutoExplore: stopAutoExplore,
      toggleAutoExplore: toggleAutoExplore,
      isAutoExploring: function () { return isAutoExploring; },
      setExploreTimeSec: setExploreTimeSec,
      refreshReveals: initInnerPageScrollReveals
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionSystem);
  } else {
    initMotionSystem();
  }
})();
