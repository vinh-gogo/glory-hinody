/**
 * Glory Hinody — Eclipse 3D Cosmic Engine (nausmind-cosmos.js v3)
 * Zero-dependency True-3D WebGL1 Relativistic Gargantua Planetary Eclipse
 * (World-Space 3D Planet + Companion Moon + Volumetric Rayleigh Atmosphere +
 * ACES Filmic Tone Mapping) + Synchronized 3D Perspective Stardust & Star Dome
 */
(function () {
  'use strict';

  var D_MIN = 1.6;
  var D_MAX = 28.5;
  var D_STARGAZE = 28.5;
  var STORAGE_KEY = 'nm_cosmic_mode';

  var cameraDistance = D_STARGAZE;
  var cameraZ = mapDistToZ(D_STARGAZE);
  var targetStarSpeed = 1.0;
  var currentStarSpeed = 1.0;
  var cosmicMode = 'star';
  var isHome = false;
  var isStargazingMode = true;
  var domReady = false;
  var explicitDistanceSet = false;

  /* 3D Spherical Orbit State (radians / degrees) */
  var orbitYaw = 0.0;
  var orbitPitch = 0.0;
  var orbitRollDeg = 0.0;

  var reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  var isReducedMotion = reducedMotionQuery ? !!reducedMotionQuery.matches : false;

  var pointerTargetX = 0.0;
  var pointerTargetY = 0.0;
  var pointerCurrX = 0.0;
  var pointerCurrY = 0.0;

  var bhContainer = null;
  var starCanvas = null;
  var earthHotspotEl = null;
  var EARTH_WORLD = { x: -11.0, y: -4.3, z: 2.2, r: 1.72, atmR: 1.94 };
  var earthScreenState = { visible: false, x: 0, y: 0, radiusPx: 0, opacity: 0 };

  var glState = null;
  var glFailed = false;
  var starState = null;
  var rafId = 0;
  var isPaused = false;
  var needsStaticRender = true;
  var startTimeMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  var lastTickMs = startTimeMs;

  function nowMs() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  function clamp(val, minVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, val));
  }

  function mapDistToZ(d) {
    var clamped = clamp(Number(d) || D_STARGAZE, D_MIN, D_MAX);
    return 6.0 + ((D_MAX - clamped) / (D_MAX - D_MIN)) * -16.0;
  }

  function computeFraming(cssW, cssH) {
    var safeH = Math.max(cssH, 1);
    var aspect = cssW / safeH;
    var zoom = 1.0;
    if (aspect < 0.72) {
      zoom = 0.92;
    } else if (aspect < 0.95) {
      zoom = 0.96;
    } else if (aspect > 1.85) {
      zoom = 0.96;
    } else if (aspect > 1.45) {
      zoom = 1.0;
    }

    var baseFrameX = 0.02;
    if (aspect >= 1.35) {
      baseFrameX = 0.062;
    } else if (aspect >= 1.05) {
      baseFrameX = 0.045;
    }

    return {
      pov: aspect < 0.8 ? 68.0 : 62.0,
      opticalZoom: clamp(zoom, 0.88, 1.12),
      frameX: baseFrameX,
      frameY: (aspect < 1.0 ? 0.03 : 0.02) + (32.0 / safeH) * 0.03,
      yaw: 0.0,
      pitch: 0.0
    };
  }

  function getSavedMode() {
    try {
      var val = sessionStorage.getItem(STORAGE_KEY);
      if (val === 'blackhole' || val === 'star') return val;
    } catch (err) {}
    return null;
  }

  function saveMode(mode) {
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {}
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 1. PROCEDURAL 2048x1024 EQUIRECTANGULAR SKY TEXTURE (MIDNIGHT COBALT)
   * ═════════════════════════════════════════════════════════════════════════ */
  function createProceduralSkyCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#03050b';
    ctx.fillRect(0, 0, width, height);

    /* Subtle midnight atmospheric galactic plane dust band */
    var bandGrad = ctx.createLinearGradient(0, height * 0.22, 0, height * 0.78);
    bandGrad.addColorStop(0.0, 'rgba(12, 22, 46, 0)');
    bandGrad.addColorStop(0.5, 'rgba(26, 48, 90, 0.11)');
    bandGrad.addColorStop(1.0, 'rgba(12, 22, 46, 0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, width, height);

    var nebulae = [
      { x: 0.24, y: 0.64, r: 0.30, c0: 'rgba(24, 48, 96, 0.14)', c1: 'rgba(6, 12, 26, 0)' },
      { x: 0.72, y: 0.32, r: 0.28, c0: 'rgba(34, 62, 114, 0.13)', c1: 'rgba(8, 14, 30, 0)' },
      { x: 0.52, y: 0.48, r: 0.24, c0: 'rgba(226, 190, 132, 0.06)', c1: 'rgba(36, 26, 14, 0)' },
      { x: 0.14, y: 0.28, r: 0.22, c0: 'rgba(20, 38, 78, 0.10)', c1: 'rgba(6, 10, 22, 0)' },
      { x: 0.86, y: 0.68, r: 0.24, c0: 'rgba(196, 158, 102, 0.065)', c1: 'rgba(30, 22, 12, 0)' }
    ];

    for (var n = 0; n < nebulae.length; n++) {
      var nb = nebulae[n];
      var gx = nb.x * width;
      var gy = nb.y * height;
      var gr = nb.r * width;
      var radGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      radGrad.addColorStop(0.0, nb.c0);
      radGrad.addColorStop(1.0, nb.c1);
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    }

    /* ~1750 crisp pinpoint stars for 360-degree 3D orbital sky dome */
    for (var s = 0; s < 1750; s++) {
      var sx = Math.random() * width;
      var sy = Math.random() * height;
      var eqDist = Math.abs(sy / height - 0.5);
      var nearEquator = eqDist < 0.14;
      var tempRoll = Math.random();
      var rgb = tempRoll < 0.56
        ? '248, 248, 252'
        : (tempRoll < 0.84 ? '196, 218, 252' : '244, 223, 185');

      var isDustStreak = !nearEquator && Math.random() < 0.06;
      var alpha = 0.14 + (nearEquator ? 0.28 : 0.48) * Math.pow(Math.random(), 2.2);

      ctx.fillStyle = 'rgba(' + rgb + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      if (isDustStreak) {
        var rot = Math.random() * Math.PI * 2.0;
        var rx = 1.4 + 4.0 * Math.random();
        var ry = 0.2 + 0.34 * Math.random();
        if (ctx.ellipse) {
          ctx.ellipse(sx, sy, rx, ry, rot, 0, Math.PI * 2.0);
        } else {
          ctx.arc(sx, sy, 0.6, 0, Math.PI * 2.0);
        }
        ctx.fill();
      } else {
        var sr = (nearEquator ? 0.58 : 0.86) * Math.pow(Math.random(), 4.8) + 0.18;
        ctx.arc(sx, sy, sr, 0, Math.PI * 2.0);
        ctx.fill();

        if (!nearEquator && sr > 0.70 && alpha > 0.34) {
          var haloR = sr * 4.0;
          var halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
          halo.addColorStop(0.0, 'rgba(' + rgb + ', ' + (alpha * 0.42).toFixed(3) + ')');
          halo.addColorStop(1.0, 'rgba(' + rgb + ', 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2.0);
          ctx.fill();
        }
      }
    }

    return canvas;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 2. TRUE-3D WEBGL1 RELATIVISTIC GARGANTUA + ORBITING PLANET & MOON SHADER
   * ═════════════════════════════════════════════════════════════════════════ */
  var VERTEX_SHADER_SRC = [
    'attribute vec2 aPosition;',
    'void main() {',
    '  gl_Position = vec4(aPosition, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER_SRC = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    'precision highp int;',
    '#else',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',
    '',
    '#define SPEED_OF_LIGHT       1.0',
    '#define EVENT_HORIZON_RADIUS 1.0',
    '#define BACKGROUND_DISTANCE  10000.0',
    '#define PROJECTION_DISTANCE  1.0',
    '#define SCALE_FACTOR         1.0',
    '#define PI                   3.14159265359',
    '#define MAX_RAY_STEPS        220',
    '',
    'uniform float     uAccretionDisk;',
    'uniform sampler2D uStarTex;',
    'uniform vec2      uResolution;',
    'uniform vec3      uCameraTranslate;',
    'uniform float     uPov;',
    'uniform float     uOpticalZoom;',
    'uniform vec2      uFramingOffset;',
    'uniform int       uMaxIterations;',
    'uniform float     uStepSize;',
    'uniform float     uTime;',
    'uniform float     uDiskSpeed;',
    'uniform float     uExposure;',
    'uniform float     uPitchDeg;',
    'uniform float     uRollDeg;',
    '',
    'const vec3  camera_pos      = vec3(0.0, 0.72, 22.5);',
    'const float PHOTON_RING_R   = 1.54;',
    'const float PHOTON_RING_W   = 0.22;',
    '',
    'const float innerDiskRadius = 2.0;',
    'const float outerDiskRadius = 8.2;',
    'const float diskInnerSoft   = 0.34;',
    'const float diskOuterSoft   = 0.85;',
    '',
    'const float disk_flow       = 9.5;',
    'const float ORBIT_OMEGA_K   = 0.92;',
    'const float INFALL_K        = 0.064;',
    'const float SPIRAL_TIGHT_K  = 1.25;',
    '',
    '/* True 3D World-Space Celestial Bodies (Foreground Planet + Moon + Earth-like glory-vocabulary) */',
    'const vec3  PLANET_POS      = vec3(10.6, 0.28, 13.6);',
    'const float PLANET_R        = 7.60;',
    'const float PLANET_ATM_R    = 8.05;',
    '',
    'const vec3  MOON_POS        = vec3(-12.2, 4.2, 6.2);',
    'const float MOON_R          = 0.85;',
    'const float MOON_ATM_R      = 0.92;',
    '',
    'const vec3  EARTH_POS       = vec3(-11.0, -4.3, 2.2);',
    'const float EARTH_R         = 1.72;',
    'const float EARTH_ATM_R     = 1.94;',
    '',
    'mat4 translate_RowOrder(float x, float y, float z) {',
    '  return mat4(',
    '    1.0, 0.0, 0.0, 0.0,',
    '    0.0, 1.0, 0.0, 0.0,',
    '    0.0, 0.0, 1.0, 0.0,',
    '    x,   y,   z,   1.0',
    '  );',
    '}',
    '',
    'mat4 scale_m(float x, float y, float z) {',
    '  return mat4(',
    '    x,   0.0, 0.0, 0.0,',
    '    0.0, y,   0.0, 0.0,',
    '    0.0, 0.0, z,   0.0,',
    '    0.0, 0.0, 0.0, 1.0',
    '  );',
    '}',
    '',
    'mat4 rotate_x(float t) {',
    '  float c = cos(t);',
    '  float s = sin(t);',
    '  return mat4(',
    '    1.0, 0.0, 0.0, 0.0,',
    '    0.0, c,  -s,   0.0,',
    '    0.0, s,   c,   0.0,',
    '    0.0, 0.0, 0.0, 1.0',
    '  );',
    '}',
    '',
    'mat4 rotate_y(float t) {',
    '  float c = cos(t);',
    '  float s = sin(t);',
    '  return mat4(',
    '     c,  0.0, s,   0.0,',
    '    0.0, 1.0, 0.0, 0.0,',
    '    -s,  0.0, c,   0.0,',
    '    0.0, 0.0, 0.0, 1.0',
    '  );',
    '}',
    '',
    'float hash(float n) {',
    '  return fract(sin(n) * 753.5453123);',
    '}',
    '',
    'float noise(vec3 x) {',
    '  vec3 p = floor(x);',
    '  vec3 f = fract(x);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float n = p.x + p.y * 157.0 + 113.0 * p.z;',
    '  return mix(',
    '    mix(mix(hash(n +   0.0), hash(n +   1.0), f.x),',
    '        mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),',
    '    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),',
    '        mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y),',
    '    f.z',
    '  );',
    '}',
    '',
    'float fbm3(vec3 pos, float iterScale, float detail, float weight) {',
    '  float mul = weight;',
    '  float add = 1.0 - 0.5 * mul;',
    '  float t   = noise(pos) * mul + add;',
    '  pos *= iterScale;',
    '  mul = exp2(log2(weight) - 1.0 / detail);',
    '  add = 1.0 - 0.5 * mul;',
    '  t  *= noise(pos) * mul + add;',
    '  pos *= iterScale;',
    '  mul = exp2(log2(weight) - 2.0 / detail);',
    '  add = 1.0 - 0.5 * mul;',
    '  t  *= noise(pos) * mul + add;',
    '  return t;',
    '}',
    '',
    'float fbm2(vec3 pos, float iterScale, float detail, float weight) {',
    '  float mul = weight;',
    '  float add = 1.0 - 0.5 * mul;',
    '  float t   = noise(pos) * mul + add;',
    '  pos *= iterScale;',
    '  mul = exp2(log2(weight) - 1.0 / detail);',
    '  add = 1.0 - 0.5 * mul;',
    '  t  *= noise(pos) * mul + add;',
    '  return t;',
    '}',
    '',
    'vec3 acesToneMap(vec3 x) {',
    '  float a = 2.51;',
    '  float b = 0.03;',
    '  float c = 2.43;',
    '  float d = 0.59;',
    '  float e = 0.14;',
    '  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);',
    '}',
    '',
    '/* Exact 3D ray-sphere intersection (normalized rd) -> (tNear, tFar) */',
    'vec2 raySphere(vec3 ro, vec3 rd, vec3 center, float radius) {',
    '  vec3 oc = ro - center;',
    '  float b = dot(oc, rd);',
    '  float c = dot(oc, oc) - radius * radius;',
    '  float h = b * b - c;',
    '  if (h < 0.0) return vec2(-1.0);',
    '  float s = sqrt(h);',
    '  return vec2(-b - s, -b + s);',
    '}',
    '',
    '/* 3D Physical Planetary Shading (Delicate Rayleigh Rim + Accretion Disk Bounce + Lunar Crescent) */',
    'vec3 shadePlanet3D(vec3 ro, vec3 rd, float tHit, vec3 center, float isMoon) {',
    '  vec3 hitPos = ro + rd * tHit;',
    '  vec3 N = normalize(hitPos - center);',
    '  vec3 V = -rd;',
    '  vec3 L = normalize(-hitPos);',
    '',
    '  float ndl = dot(N, L);',
    '  float ndv = max(dot(N, V), 0.0);',
    '  float fresnel = pow(1.0 - ndv, 3.6);',
    '  float rimSharp = pow(1.0 - ndv, 9.5);',
    '  float backLit = pow(max(dot(rd, normalize(-ro)), 0.0), 3.8);',
    '',
    '  /* Slow subtle 3D axial rotation for atmospheric cloud/dust bands & lunar maria */',
    '  float spin = uTime * (isMoon > 0.5 ? 0.014 : 0.007);',
    '  float cs = cos(spin);',
    '  float sn = sin(spin);',
    '  vec3 rotN = vec3(N.x * cs - N.z * sn, N.y, N.x * sn + N.z * cs);',
    '',
    '  if (isMoon > 0.5) {',
    '    float maria = fbm3(rotN * 3.2, 2.2, 1.0, 0.58);',
    '    float craters = fbm2(rotN * 11.0, 2.0, 1.0, 0.45);',
    '    float lunarTex = clamp(maria * 0.72 + craters * 0.28, 0.35, 1.25);',
    '    float crescent = smoothstep(-0.08, 0.58, ndl);',
    '    vec3 darkSide = vec3(0.008, 0.013, 0.024) + vec3(0.020, 0.036, 0.068) * fresnel;',
    '    vec3 litSide = mix(vec3(0.14, 0.14, 0.16), vec3(0.42, 0.38, 0.33), lunarTex - 0.32);',
    '    vec3 mCol = mix(darkSide, litSide, crescent);',
    '    mCol += mix(vec3(0.46, 0.64, 0.92), vec3(0.96, 0.88, 0.74), crescent) * rimSharp * (0.14 + 0.52 * crescent);',
    '    return mCol;',
    '  }',
    '',
    '  float bands = fbm2(vec3(rotN.x * 2.1, rotN.y * 5.2, rotN.z * 2.1), 2.15, 1.0, 0.48);',
    '  float fineDetail = fbm2(rotN * 6.0, 2.0, 1.0, 0.38);',
    '  float surfVar = clamp(bands * 0.72 + fineDetail * 0.28, 0.45, 1.32);',
    '',
    '  /* Day/Night terminator + velvety lower-hemisphere accretion plane reflection */',
    '  float dayLight = smoothstep(-0.26, 0.62, ndl);',
    '  float lowerBounce = smoothstep(0.18, -0.52, N.y) * smoothstep(-0.78, 0.35, ndl);',
    '  float eqGlow = exp(-abs(N.y + 0.10) * 4.2) * smoothstep(-0.62, 0.28, ndl);',
    '',
    '  vec3 nightCol = mix(vec3(0.006, 0.010, 0.022), vec3(0.018, 0.034, 0.068), fresnel);',
    '  vec3 warmAlbedo = mix(vec3(0.22, 0.18, 0.12), vec3(0.52, 0.42, 0.29), surfVar - 0.35);',
    '  vec3 col = mix(nightCol, warmAlbedo, dayLight * 0.82);',
    '',
    '  /* Warm golden-champagne bounce from Gargantua equatorial plane onto lower limb */',
    '  vec3 bounceTint = vec3(0.36, 0.28, 0.18) * (0.84 + 0.24 * bands);',
    '  col += bounceTint * lowerBounce * 0.62;',
    '  col += vec3(0.30, 0.22, 0.13) * eqGlow * 0.36;',
    '',
    '  /* Razor-fine 3D Rayleigh Atmospheric Silver-White Limb */',
    '  vec3 rimHue = mix(vec3(0.46, 0.68, 0.98), vec3(1.0, 0.96, 0.90), smoothstep(-0.22, 0.45, ndl));',
    '  float rimPower = 0.22 + 0.86 * dayLight + 0.68 * backLit;',
    '  col += rimHue * rimSharp * rimPower * 0.92;',
    '  col += mix(vec3(0.14, 0.28, 0.56), vec3(0.86, 0.72, 0.50), dayLight) * fresnel * (0.10 + 0.22 * dayLight);',
    '',
    '  return col;',
    '}',
    '',
    '/* 3D Earth-Like Living Planet Shading (glory-vocabulary: Oceans, Continents, Ice Caps, Clouds & City Lights) */',
    'vec3 shadeEarth3D(vec3 ro, vec3 rd, float tHit, vec3 center) {',
    '  vec3 hitPos = ro + rd * tHit;',
    '  vec3 N = normalize(hitPos - center);',
    '  vec3 V = -rd;',
    '  vec3 L = normalize(-hitPos);',
    '',
    '  float ndl = dot(N, L);',
    '  float ndv = max(dot(N, V), 0.0);',
    '  float fresnel = pow(1.0 - ndv, 3.2);',
    '  float rimSharp = pow(1.0 - ndv, 7.8);',
    '',
    '  /* 23.4-deg axial obliquity + steady planetary rotation */',
    '  float tiltC = 0.9177;',
    '  float tiltS = 0.3971;',
    '  vec3 tiltN = vec3(N.x, N.y * tiltC - N.z * tiltS, N.y * tiltS + N.z * tiltC);',
    '  float spin = uTime * 0.048 + 1.35;',
    '  float cs = cos(spin);',
    '  float sn = sin(spin);',
    '  vec3 rotN = vec3(tiltN.x * cs - tiltN.z * sn, tiltN.y, tiltN.x * sn + tiltN.z * cs);',
    '',
    '  /* Continents, coastal shelves, mountain highlands & polar ice caps */',
    '  float contMacro = fbm3(rotN * 2.15 + vec3(1.4, -0.5, 2.1), 2.15, 1.0, 0.62);',
    '  float contFine  = fbm2(rotN * 5.60 + vec3(3.1, 1.7, -2.4), 2.10, 1.0, 0.44);',
    '  float elev      = contMacro * 0.72 + contFine * 0.28;',
    '',
    '  float landMask  = smoothstep(0.992, 1.032, elev);',
    '  float shallow   = smoothstep(0.945, 1.002, elev) * (1.0 - landMask);',
    '  float biomeVar  = fbm2(rotN * 3.8 + vec3(-2.0, 0.8, 1.2), 2.0, 1.0, 0.50);',
    '  float lat       = abs(rotN.y);',
    '  float iceMask   = smoothstep(0.75, 0.88, lat + (contFine - 1.0) * 0.22);',
    '',
    '  vec3 deepOcean  = vec3(0.022, 0.115, 0.340);',
    '  vec3 coastOcean = vec3(0.065, 0.340, 0.540);',
    '  vec3 oceanCol   = mix(deepOcean, coastOcean, shallow);',
    '',
    '  vec3 forestCol  = vec3(0.095, 0.285, 0.135);',
    '  vec3 aridCol    = vec3(0.470, 0.385, 0.235);',
    '  vec3 tundraCol  = vec3(0.240, 0.310, 0.220);',
    '  float aridMask  = smoothstep(0.96, 1.18, biomeVar) * smoothstep(0.62, 0.12, lat);',
    '  vec3 landCol    = mix(forestCol, aridCol, aridMask);',
    '  landCol         = mix(landCol, tundraCol, smoothstep(0.45, 0.76, lat));',
    '  landCol         = mix(landCol, vec3(0.66, 0.68, 0.71), smoothstep(1.13, 1.28, elev));',
    '',
    '  vec3 surfAlbedo = mix(oceanCol, landCol, landMask);',
    '  surfAlbedo      = mix(surfAlbedo, vec3(0.84, 0.90, 0.96), iceMask);',
    '',
    '  /* Independent swirling cloud layer */',
    '  float cSpin = spin * 1.28 + 0.55;',
    '  float ccs = cos(cSpin);',
    '  float csn = sin(cSpin);',
    '  vec3 cloudN = vec3(tiltN.x * ccs - tiltN.z * csn, tiltN.y, tiltN.x * csn + tiltN.z * ccs);',
    '  float swirl = fbm2(cloudN * 2.1, 2.0, 1.0, 0.50) - 1.0;',
    '  float cNoise = fbm3(cloudN * 3.15 + vec3(swirl * 0.65, cloudN.x * 0.45, -swirl * 0.55), 2.25, 1.0, 0.66);',
    '  float cloudMask = smoothstep(1.035, 1.22, cNoise) * 0.88;',
    '',
    '  float dayLight   = smoothstep(-0.14, 0.52, ndl);',
    '  float terminator = exp(-abs(ndl + 0.02) * 13.0);',
    '  float nightMask  = smoothstep(0.04, -0.28, ndl);',
    '',
    '  vec3 litSurf   = surfAlbedo * (0.14 + 1.18 * dayLight);',
    '  vec3 nightSurf = surfAlbedo * vec3(0.05, 0.08, 0.16) + vec3(0.008, 0.018, 0.042);',
    '  vec3 col       = mix(nightSurf, litSurf, dayLight);',
    '',
    '  /* Solar-champagne ocean specular glint */',
    '  vec3 H = normalize(L + V);',
    '  float oceanSpec = pow(max(dot(N, H), 0.0), 34.0) * (1.0 - landMask) * (1.0 - iceMask) * (1.0 - cloudMask * 0.85) * dayLight;',
    '  col += vec3(0.95, 0.84, 0.66) * oceanSpec * 0.55;',
    '',
    '  /* Delicate night-side golden city light clusters on continents */',
    '  float cityRaw = fbm2(rotN * 19.0 + vec3(2.3, -1.1, 0.7), 2.15, 1.0, 0.72);',
    '  float cities  = smoothstep(1.12, 1.26, cityRaw) * landMask * (1.0 - iceMask) * (1.0 - cloudMask * 0.65);',
    '  col += vec3(0.98, 0.78, 0.42) * cities * nightMask * 0.62;',
    '',
    '  /* Cloud deck shading with warm golden-rose terminator scattering */',
    '  vec3 cloudCol = mix(vec3(0.025, 0.045, 0.095), vec3(0.92, 0.95, 0.99), dayLight);',
    '  cloudCol += vec3(0.42, 0.24, 0.14) * terminator * 0.45;',
    '  col = mix(col, cloudCol, cloudMask);',
    '',
    '  /* Signature Earth Azure-Cyan Rayleigh Atmospheric Limb */',
    '  col += vec3(0.16, 0.46, 0.94) * fresnel * (0.24 + 0.78 * dayLight);',
    '  col += vec3(0.56, 0.84, 1.00) * rimSharp * (0.34 + 1.08 * dayLight);',
    '  col += vec3(0.92, 0.68, 0.42) * terminator * fresnel * 0.28;',
    '',
    '  return col;',
    '}',
    '',
    '/* 3D Volumetric Earth Azure Atmospheric Halo for Grazing Rays */',
    'vec3 computeEarthAtmHalo3D(vec3 ro, vec3 rd, vec3 center, float bodyR, float atmR) {',
    '  vec2 hitA = raySphere(ro, rd, center, atmR);',
    '  if (hitA.y <= 0.0) return vec3(0.0);',
    '',
    '  float tNear = max(hitA.x, 0.0);',
    '  float tMid = 0.5 * (tNear + hitA.y);',
    '  vec3 closestPt = ro + rd * tMid;',
    '  float distC = length(closestPt - center);',
    '  float hNorm = clamp((distC - bodyR) / max(atmR - bodyR, 1.0e-4), 0.0, 1.0);',
    '',
    '  vec3 N = normalize(closestPt - center);',
    '  vec3 L = normalize(-closestPt);',
    '  float lit = smoothstep(-0.42, 0.48, dot(N, L));',
    '',
    '  float edgeSharp = exp(-hNorm * 14.0);',
    '  float outerSoft = exp(-hNorm * 4.8);',
    '  vec3 colCore  = vec3(0.42, 0.78, 1.00) * edgeSharp * (0.28 + 0.92 * lit);',
    '  vec3 colOuter = vec3(0.14, 0.44, 0.92) * outerSoft * (0.10 + 0.30 * lit);',
    '  return colCore + colOuter;',
    '}',
    '',
    '/* 3D Volumetric Outer Atmospheric Halo for Grazing Rays (Razor-Crisp Hairline Limb) */',
    'vec3 computeAtmHalo3D(vec3 ro, vec3 rd, vec3 center, float bodyR, float atmR) {',
    '  vec2 hitA = raySphere(ro, rd, center, atmR);',
    '  if (hitA.y <= 0.0) return vec3(0.0);',
    '',
    '  float tNear = max(hitA.x, 0.0);',
    '  float tMid = 0.5 * (tNear + hitA.y);',
    '  vec3 closestPt = ro + rd * tMid;',
    '  float distC = length(closestPt - center);',
    '  float hNorm = clamp((distC - bodyR) / max(atmR - bodyR, 1.0e-4), 0.0, 1.0);',
    '',
    '  vec3 N = normalize(closestPt - center);',
    '  vec3 L = normalize(-closestPt);',
    '  float lit = smoothstep(-0.46, 0.42, dot(N, L));',
    '  float backLit = pow(max(dot(rd, normalize(-ro)), 0.0), 3.6);',
    '',
    '  float edgeSharp = exp(-hNorm * 20.0);',
    '  float outerSoft = exp(-hNorm * 6.0);',
    '  vec3 colCore = mix(vec3(0.58, 0.76, 1.0), vec3(1.0, 0.97, 0.91), lit) * edgeSharp * (0.20 + 0.86 * lit + 0.68 * backLit);',
    '  vec3 colOuter = mix(vec3(0.18, 0.38, 0.74), vec3(0.92, 0.76, 0.52), lit * 0.62) * outerSoft * (0.06 + 0.20 * lit + 0.16 * backLit);',
    '  return colCore + colOuter;',
    '}',
    '',
    'struct Ray {',
    '  vec4 origin;',
    '  vec4 direction;',
    '};',
    '',
    'Ray pixelToWorldRay() {',
    '  float rollRad = radians(uRollDeg);',
    '  vec3 up = normalize(vec3(sin(rollRad), cos(rollRad), 0.0));',
    '  float pitchAngle = uCameraTranslate.y + radians(uPitchDeg);',
    '  vec4 look_from = rotate_y(uCameraTranslate.x) *',
    '                   rotate_x(-pitchAngle) *',
    '                   vec4(camera_pos + vec3(0.0, 0.0, uCameraTranslate.z), 1.0);',
    '  vec3 view      = vec3(-look_from.x, -look_from.y, -look_from.z);',
    '  vec3 n_view    = normalize(view);',
    '  vec3 n_upview  = normalize(cross(up, n_view));',
    '  vec3 c_vup     = cross(n_view, n_upview);',
    '',
    '  mat4 offset = mat4(',
    '    vec4(n_upview, 0.0),',
    '    vec4(c_vup,    0.0),',
    '    vec4(n_view,   0.0),',
    '    vec4(0.0, 0.0, 0.0, 1.0)',
    '  );',
    '  mat4 transform = translate_RowOrder(-0.5 * uResolution.x, -0.5 * uResolution.y, PROJECTION_DISTANCE);',
    '  mat4 look_t    = translate_RowOrder(look_from.x, look_from.y, look_from.z);',
    '',
    '  float pov_rad = radians(uPov);',
    '  float h       = PROJECTION_DISTANCE * 2.0 * tan(0.5 * pov_rad) / max(uOpticalZoom, 0.65);',
    '  mat4 scaled   = scale_m(',
    '    h / (uResolution.y * SCALE_FACTOR),',
    '    h / (uResolution.y * SCALE_FACTOR),',
    '    1.0',
    '  );',
    '',
    '  vec4 local_pixel = vec4(',
    '    gl_FragCoord.x - uFramingOffset.x * uResolution.x,',
    '    gl_FragCoord.y - uFramingOffset.y * uResolution.y,',
    '    0.0,',
    '    1.0',
    '  );',
    '  vec4 world_coord = look_t * offset * scaled * transform * local_pixel;',
    '',
    '  Ray ray;',
    '  ray.origin    = look_from;',
    '  ray.direction = world_coord - look_from;',
    '  return ray;',
    '}',
    '',
    'vec3 geodesic_equation(vec3 position, float h2) {',
    '  float r2 = max(dot(position, position), 1.0e-5);',
    '  float r5 = r2 * r2 * sqrt(r2);',
    '  return -1.5 * h2 * position / r5;',
    '}',
    '',
    'vec4 intersect_sphere(Ray ray, float radius) {',
    '  float a = dot(ray.direction, ray.direction);',
    '  float b = dot(ray.direction, ray.origin) * 2.0;',
    '  float c = dot(ray.origin, ray.origin) - radius * radius;',
    '  float d = max(b * b - 4.0 * a * c, 0.0);',
    '  float sgn = b < 0.0 ? -1.0 : 1.0;',
    '  float q = -0.5 * (b + sgn * sqrt(d));',
    '  float r1 = q / max(a, 1.0e-7);',
    '  float r2 = c / (abs(q) < 1.0e-7 ? -1.0e-7 : q);',
    '  float tHit = max(r1, r2);',
    '  return ray.origin + tHit * ray.direction;',
    '}',
    '',
    'vec4 GetColor(Ray ray) {',
    '  vec4 positioned = intersect_sphere(ray, BACKGROUND_DISTANCE);',
    '  float theta = atan(positioned.x, positioned.z);',
    '  float normY = positioned.y / BACKGROUND_DISTANCE;',
    '',
    '  float ySample = sign(normY) * pow(max(abs(normY), 1.0e-6), 0.55);',
    '  if (normY > 0.0) {',
    '    ySample *= 1.16;',
    '  }',
    '',
    '  vec2 new_coord = vec2(theta / (2.0 * PI) + 0.5, clamp(ySample * 0.5 + 0.5, 0.001, 0.999));',
    '  vec4 bg = texture2D(uStarTex, new_coord);',
    '',
    '  float bgDim = mix(1.0, 0.34, smoothstep(0.10, -0.45, normY));',
    '  return vec4(bg.rgb * bgDim, 1.0);',
    '}',
    '',
    'vec4 compute(inout vec3 position, inout vec3 velocity, inout Ray ray, inout float minApproach,',
    '             out float diskCoverage, out float firstDiskDist, out vec3 diskOnly) {',
    '  vec3  perpendicular = cross(position, velocity);',
    '  float h2            = dot(perpendicular, perpendicular);',
    '  float diskTime      = uTime * uDiskSpeed;',
    '',
    '  vec3  accumDisk     = vec3(0.0);',
    '  float transmittance = 1.0;',
    '  firstDiskDist       = 1.0e6;',
    '  vec3  roInit        = position;',
    '',
    '  for (int i = 0; i < MAX_RAY_STEPS; i++) {',
    '    if (i >= uMaxIterations) {',
    '      break;',
    '    }',
    '    float dist  = length(position);',
    '    minApproach = min(minApproach, dist);',
    '',
    '    /* Cap step size near the accretion plane so rays never skip or stair-step across y = 0 */',
    '    float rawStep   = dist * dist * uStepSize;',
    '    float maxStep   = (dist < outerDiskRadius + 4.5) ? max(0.24, dist * 0.11) : max(0.65, dist * 0.16);',
    '    float step_size = min(rawStep, maxStep);',
    '    vec3  rk_delta  = velocity * step_size;',
    '',
    '    vec3 k1 = step_size * geodesic_equation(position, h2);',
    '    vec3 k2 = step_size * geodesic_equation(position + rk_delta + 0.5 * k1, h2);',
    '    vec3 k3 = step_size * geodesic_equation(position + rk_delta + 0.5 * k2, h2);',
    '    vec3 k4 = step_size * geodesic_equation(position + rk_delta + k3,      h2);',
    '    vec3 d  = (k1 + 2.0 * (k2 + k3) + k4) / 6.0;',
    '',
    '    vec3 nextPos = position + rk_delta;',
    '    vec3 nextVel = velocity + d;',
    '',
    '    /* Exact single-trigger crossing test on integrated segment (volumetric accumulation, zero abrupt breaks) */',
    '    bool crossedPlane = (position.y > 0.0 && nextPos.y <= 0.0) || (position.y < 0.0 && nextPos.y >= 0.0);',
    '    if (uAccretionDisk == 1.0 && crossedPlane && abs(position.y - nextPos.y) > 1.0e-6) {',
    '      float t_cross      = clamp(position.y / (position.y - nextPos.y), 0.0, 1.0);',
    '      vec3  crossingPos  = mix(position, nextPos, t_cross);',
    '      float crossingDist = length(crossingPos);',
    '',
    '      if (crossingDist > innerDiskRadius - diskInnerSoft && crossingDist < outerDiskRadius + diskOuterSoft) {',
    '        minApproach = min(minApproach, crossingDist);',
    '',
    '        float deltaR    = outerDiskRadius - innerDiskRadius;',
    '        float disk_dist = max(crossingDist - innerDiskRadius, 0.0);',
    '        float safeDist  = max(crossingDist, innerDiskRadius + 0.08);',
    '',
    '        float theta = atan(crossingPos.z, crossingPos.x);',
    '        float diskX = crossingPos.x;',
    '        float diskZ = crossingPos.z;',
    '',
    '        float omega     = ORBIT_OMEGA_K * pow(safeDist, -1.5);',
    '        float infallV   = INFALL_K * pow(safeDist, -0.85);',
    '        float spinAngle = diskTime * omega;',
    '',
    '        float c = cos(spinAngle);',
    '        float s = sin(spinAngle);',
    '        float rotX = diskX * c - diskZ * s;',
    '        float rotZ = diskX * s + diskZ * c;',
    '',
    '        float radialNorm  = clamp(disk_dist / deltaR, 0.0, 1.0);',
    '        float infallPhase = radialNorm - diskTime * infallV;',
    '        float spiralTilt  = theta * SPIRAL_TIGHT_K + infallPhase * 2.8 + (disk_flow * 0.06) / safeDist;',
    '',
    '        vec3 noiseCoord = vec3(',
    '          rotX * 0.62 + infallPhase * 3.5 + spiralTilt * 0.45,',
    '          rotZ * 0.62 + infallPhase * 1.2,',
    '          safeDist * 0.16 + sin(spiralTilt + diskTime * infallV) * 0.11',
    '        );',
    '',
    '        float radialMask = smoothstep(innerDiskRadius - diskInnerSoft, innerDiskRadius + diskInnerSoft * 1.4, crossingDist)',
    '                         * smoothstep(outerDiskRadius + diskOuterSoft, outerDiskRadius - diskOuterSoft * 1.6, crossingDist);',
    '',
    '        float radialFalloff = pow(clamp(1.0 - radialNorm * 0.84, 0.0, 1.0), 1.25);',
    '        float turbA = fbm3(noiseCoord, 2.55, 1.0, 0.80);',
    '        float c2 = cos(spinAngle * 2.1);',
    '        float s2 = sin(spinAngle * 2.1);',
    '        vec3 noiseCoordFast = vec3(',
    '          diskX * c2 - diskZ * s2,',
    '          diskX * s2 + diskZ * c2,',
    '          safeDist * 0.2 - diskTime * infallV * 1.35',
    '        );',
    '        float turbB = fbm2(noiseCoordFast * 1.7 + vec3(infallPhase * 2.0, 0.0, spinAngle), 2.35, 1.0, 0.74);',
    '        float turbulence = clamp(turbA * 0.58 + turbB * 0.50, 0.0, 1.38);',
    '        float innerRim = smoothstep(innerDiskRadius + 0.82, innerDiskRadius - 0.05, crossingDist);',
    '        float density_variation = mix(0.44, 1.20, turbulence);',
    '        density_variation = mix(density_variation, max(density_variation, 0.94), innerRim * 0.30);',
    '',
    '        /* Step-size-independent continuous optical thickness & emission (smoothly 0 at edges -> zero seam!) */',
    '        float diskDensity = radialMask * radialFalloff * density_variation;',
    '        float diskAlpha   = clamp(diskDensity * 1.85, 0.0, 0.985);',
    '',
    '        vec3 orbitTangent = normalize(vec3(-crossingPos.z, 0.0, crossingPos.x));',
    '        float vTan = clamp(dot(normalize(velocity), orbitTangent), -0.92, 0.92);',
    '        float dopplerShift = sqrt(max(0.0, (1.0 - vTan) / max(1.0e-4, 1.0 + vTan)));',
    '        float beaming = pow(max(dopplerShift, 1.0e-5), 0.30);',
    '',
    '        float camR = max(length(roInit), innerDiskRadius + 0.5);',
    '        float redshift = sqrt(max(0.0, (1.0 - 2.0 / safeDist) / max(1.0e-4, 1.0 - 2.0 / camR)));',
    '',
    '        float temp = clamp(beaming * (0.48 + 0.82 * innerRim + 0.52 * diskDensity), 0.0, 1.85);',
    '        vec3 diskHue = mix(vec3(0.68, 0.44, 0.21), vec3(0.97, 0.79, 0.51), smoothstep(0.18, 0.85, temp));',
    '        diskHue = mix(diskHue, vec3(1.0, 0.97, 0.91), smoothstep(0.85, 1.50, temp));',
    '',
    '        vec3 emission = diskHue * beaming * redshift * diskDensity * 2.25;',
    '',
    '        float dRing = (crossingDist - PHOTON_RING_R) / PHOTON_RING_W;',
    '        float rimCore = innerRim * exp(-dRing * dRing);',
    '        emission += vec3(1.0, 0.95, 0.85) * rimCore * beaming * redshift * 1.45;',
    '',
    '        if (diskAlpha > 0.001) {',
    '          firstDiskDist = min(firstDiskDist, length(crossingPos - roInit));',
    '        }',
    '',
    '        accumDisk += transmittance * emission;',
    '        transmittance *= (1.0 - diskAlpha);',
    '',
    '        if (transmittance < 0.015) {',
    '          diskCoverage  = 1.0 - transmittance;',
    '          diskOnly      = accumDisk;',
    '          ray.origin    = vec4(crossingPos, 1.0);',
    '          ray.direction = vec4(velocity, 0.0);',
    '          return vec4(accumDisk, 1.0);',
    '        }',
    '      }',
    '    }',
    '',
    '    position = nextPos;',
    '    velocity = nextVel;',
    '',
    '    float nextDist = length(position);',
    '    if (nextDist <= EVENT_HORIZON_RADIUS) {',
    '      diskCoverage  = 1.0 - transmittance;',
    '      diskOnly      = accumDisk;',
    '      ray.origin    = vec4(position, 1.0);',
    '      ray.direction = vec4(velocity, 0.0);',
    '      return vec4(accumDisk, 0.0);',
    '    }',
    '    if (nextDist >= BACKGROUND_DISTANCE) {',
    '      break;',
    '    }',
    '  }',
    '',
    '  diskCoverage  = 1.0 - transmittance;',
    '  diskOnly      = accumDisk;',
    '  ray.origin    = vec4(position, 1.0);',
    '  ray.direction = vec4(velocity, 0.0);',
    '',
    '  /* Rays still trapped near the photon sphere after max iterations are captured, eliminating 1px aliasing dots */',
    '  if (length(position) < 4.5) {',
    '    return vec4(accumDisk, 0.0);',
    '  }',
    '  vec4 skyCol = GetColor(ray);',
    '  return vec4(accumDisk + transmittance * skyCol.rgb, 1.0);',
    '}',
    '',
    'void main() {',
    '  Ray  ray = pixelToWorldRay();',
    '  vec3 ro  = vec3(ray.origin);',
    '  vec3 rd  = normalize(vec3(ray.direction));',
    '  float distToBH = length(ro);',
    '',
    '  /* 1. True 3D World-Space Intersections for Foreground Planet, Moon & Earth-like glory-vocabulary */',
    '  vec2 hitPlanet = raySphere(ro, rd, PLANET_POS, PLANET_R);',
    '  vec2 hitMoon   = raySphere(ro, rd, MOON_POS,   MOON_R);',
    '  vec2 hitEarth  = raySphere(ro, rd, EARTH_POS,  EARTH_R);',
    '',
    '  /* Find closest solid celestial body hit along ray (0=none, 1=planet, 2=moon, 3=earth) */',
    '  int   bodyId = 0;',
    '  float tBody  = 1.0e6;',
    '  if (hitPlanet.x > 0.0 && hitPlanet.x < tBody) { tBody = hitPlanet.x; bodyId = 1; }',
    '  if (hitMoon.x   > 0.0 && hitMoon.x   < tBody) { tBody = hitMoon.x;   bodyId = 2; }',
    '  if (hitEarth.x  > 0.0 && hitEarth.x  < tBody) { tBody = hitEarth.x;  bodyId = 3; }',
    '',
    '  /* Exact early-out only when winning body is strictly closer than the entire accretion disk sphere */',
    '  float safeFrontDist = max(distToBH - outerDiskRadius - diskOuterSoft - 0.5, 0.0);',
    '  bool strictlyFront = (bodyId > 0 && tBody < safeFrontDist);',
    '',
    '  vec3 hdrCol = vec3(0.0);',
    '',
    '  /* GPU Early-Out: Rays hitting a solid foreground 3D body skip RK4 raymarching! */',
    '  if (strictlyFront) {',
    '    if (bodyId == 1) {',
    '      hdrCol = shadePlanet3D(ro, rd, tBody, PLANET_POS, 0.0);',
    '    } else if (bodyId == 2) {',
    '      hdrCol = shadePlanet3D(ro, rd, tBody, MOON_POS, 1.0);',
    '      if (hitPlanet.x <= 0.0 && length(PLANET_POS - ro) < tBody) {',
    '        hdrCol += computeAtmHalo3D(ro, rd, PLANET_POS, PLANET_R, PLANET_ATM_R);',
    '      }',
    '    } else {',
    '      hdrCol = shadeEarth3D(ro, rd, tBody, EARTH_POS);',
    '      if (hitPlanet.x <= 0.0 && length(PLANET_POS - ro) < tBody) {',
    '        hdrCol += computeAtmHalo3D(ro, rd, PLANET_POS, PLANET_R, PLANET_ATM_R);',
    '      }',
    '    }',
    '  } else {',
    '    /* 2. Relativistic RK4 Geodesic Raymarch around Gargantua (Continuous Volumetric Disk) */',
    '    vec3 position = ro;',
    '    vec3 velocity = SPEED_OF_LIGHT * rd;',
    '    float minApproach = 1.0e6;',
    '    float diskCoverage = 0.0;',
    '    float firstDiskDist = 1.0e6;',
    '    vec3 diskOnly = vec3(0.0);',
    '',
    '    vec4 color = compute(position, velocity, ray, minApproach, diskCoverage, firstDiskDist, diskOnly);',
    '    float escaped = step(0.5, color.a);',
    '    float trans   = clamp(1.0 - diskCoverage, 0.0, 1.0);',
    '',
    '    /* Exact Per-Pixel 3D Depth Sorting between Planet, Moon, Earth, Event Horizon & Accretion Disk */',
    '    bool bodyOccludesAll = false;',
    '    if (bodyId > 0) {',
    '      vec3 bCol = (bodyId == 1)',
    '        ? shadePlanet3D(ro, rd, tBody, PLANET_POS, 0.0)',
    '        : ((bodyId == 2) ? shadePlanet3D(ro, rd, tBody, MOON_POS, 1.0) : shadeEarth3D(ro, rd, tBody, EARTH_POS));',
    '      if (tBody < firstDiskDist && (escaped > 0.5 || tBody < distToBH)) {',
    '        hdrCol = bCol;',
    '        bodyOccludesAll = true;',
    '      } else if (escaped > 0.5) {',
    '        color.rgb = diskOnly + trans * bCol;',
    '      }',
    '    }',
    '',
    '    if (!bodyOccludesAll) {',
    '      /* Continuous 360-deg relativistic photon ring (smooth around entire shadow, zero seam!) */',
    '      float mRing = (minApproach - PHOTON_RING_R) / PHOTON_RING_W;',
    '      float ringBand = exp(-mRing * mRing) * escaped * trans;',
    '      ringBand *= smoothstep(EVENT_HORIZON_RADIUS + 0.16, EVENT_HORIZON_RADIUS + 0.42, minApproach);',
    '      ringBand *= smoothstep(innerDiskRadius + 0.52, innerDiskRadius - 0.08, minApproach);',
    '      ringBand *= smoothstep(3.2, 8.5, length(position));',
    '      vec3 photonRing = vec3(1.0, 0.96, 0.88) * ringBand * 1.45;',
    '',
    '      /* Continuous shadow visibility blends seamlessly across translucent disk edge (zero horizontal shelf!) */',
    '      float visibleMask = clamp(max(escaped, diskCoverage), 0.0, 1.0);',
    '      vec3 dirToBH = normalize(-ro);',
    '      float bhAlign = max(dot(rd, dirToBH), 0.0);',
    '      float bhHalo = pow(bhAlign, 18.0);',
    '      float upperSpace = smoothstep(-0.12, 0.55, rd.y);',
    '      vec3 cobaltAtmos = vec3(0.030, 0.068, 0.168) * upperSpace * (0.40 + 1.12 * pow(bhAlign, 3.8)) * mix(0.28, 1.0, visibleMask);',
    '      float eqPlaneBloom = exp(-abs(rd.y - dirToBH.y) * 18.0) * pow(bhAlign, 5.0);',
    '      vec3 warmBloom = vec3(0.98, 0.78, 0.46) * eqPlaneBloom * 0.52 * mix(0.18, 1.0, visibleMask);',
    '      vec3 radialCorona = vec3(0.95, 0.93, 0.89) * bhHalo * 0.30 * mix(0.08, 1.0, visibleMask);',
    '',
    '      /* Suppress sky bloom over distant planet/moon/earth disc continuously with diskCoverage (zero limb seam!) */',
    '      float skyBloomMask = (bodyId > 0) ? diskCoverage : 1.0;',
    '      hdrCol = color.rgb + photonRing + (cobaltAtmos + warmBloom + radialCorona) * skyBloomMask;',
    '',
    '      /* 3. Volumetric 3D Atmospheric Rayleigh Halos — ONLY for rays grazing outside each solid core! */',
    '      if (hitPlanet.x <= 0.0) {',
    '        float pHaloMask = (length(PLANET_POS - ro) > distToBH) ? (escaped * trans) : 1.0;',
    '        hdrCol += computeAtmHalo3D(ro, rd, PLANET_POS, PLANET_R, PLANET_ATM_R) * pHaloMask;',
    '      }',
    '      if (hitMoon.x <= 0.0) {',
    '        float mHaloMask = (length(MOON_POS - ro) > distToBH) ? (escaped * trans) : 1.0;',
    '        hdrCol += computeAtmHalo3D(ro, rd, MOON_POS, MOON_R, MOON_ATM_R) * 0.38 * mHaloMask;',
    '      }',
    '      if (hitEarth.x <= 0.0) {',
    '        float eDist = length(EARTH_POS - ro);',
    '        float eHaloMask = (eDist > distToBH) ? (escaped * trans) : 1.0;',
    '        if (bodyId > 0 && tBody < eDist) eHaloMask = 0.0;',
    '        hdrCol += computeEarthAtmHalo3D(ro, rd, EARTH_POS, EARTH_R, EARTH_ATM_R) * eHaloMask;',
    '      }',
    '    }',
    '  }',
    '',
    '  hdrCol *= uExposure;',
    '  vec3 mapped = acesToneMap(hdrCol);',
    '  mapped = pow(mapped, vec3(0.96));',
    '',
    '  /* Triangular 8-bit micro-dither eliminates dark-space banding */',
    '  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(clamp(mapped + dither, 0.0, 1.0), 1.0);',
    '}'
  ].join('\n');

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[EclipseCosmos3D] Shader compile warning:', gl.getShaderInfoLog(shader));
      }
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initBlackHoleWebGL(container) {
    if (!container || glFailed) return null;
    if (glState) return glState;

    var canvas = null;
    if (container.tagName === 'CANVAS') {
      canvas = container;
    } else {
      canvas = container.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'bh-webgl-surface';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
        container.appendChild(canvas);
      }
    }

    var ctxOpts = {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    };

    var gl = null;
    try {
      gl = canvas.getContext('webgl', ctxOpts) || canvas.getContext('experimental-webgl', ctxOpts);
    } catch (err) {
      gl = null;
    }
    if (!gl) {
      glFailed = true;
      return null;
    }

    var vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      glFailed = true;
      return null;
    }

    var program = gl.createProgram();
    if (!program) {
      glFailed = true;
      return null;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[EclipseCosmos3D] Program link warning:', gl.getProgramInfoLog(program));
      }
      gl.deleteProgram(program);
      glFailed = true;
      return null;
    }

    var quadVerts = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]);
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    var aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    var skyCanvas = createProceduralSkyCanvas(2048, 1024);
    var skyTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, skyTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.useProgram(program);
    gl.clearColor(5 / 255, 7 / 255, 14 / 255, 1.0);

    var uniforms = {
      uAccretionDisk: gl.getUniformLocation(program, 'uAccretionDisk'),
      uStarTex: gl.getUniformLocation(program, 'uStarTex'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uCameraTranslate: gl.getUniformLocation(program, 'uCameraTranslate'),
      uPov: gl.getUniformLocation(program, 'uPov'),
      uOpticalZoom: gl.getUniformLocation(program, 'uOpticalZoom'),
      uFramingOffset: gl.getUniformLocation(program, 'uFramingOffset'),
      uMaxIterations: gl.getUniformLocation(program, 'uMaxIterations'),
      uStepSize: gl.getUniformLocation(program, 'uStepSize'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uDiskSpeed: gl.getUniformLocation(program, 'uDiskSpeed'),
      uExposure: gl.getUniformLocation(program, 'uExposure'),
      uPitchDeg: gl.getUniformLocation(program, 'uPitchDeg'),
      uRollDeg: gl.getUniformLocation(program, 'uRollDeg')
    };

    gl.uniform1f(uniforms.uAccretionDisk, 1.0);
    gl.uniform1i(uniforms.uStarTex, 0);
    gl.uniform1f(uniforms.uDiskSpeed, 0.86);
    gl.uniform1f(uniforms.uExposure, 1.14);
    gl.uniform1f(uniforms.uPitchDeg, 0.0);
    gl.uniform1f(uniforms.uRollDeg, 0.0);

    canvas.addEventListener('webglcontextlost', function (ev) {
      ev.preventDefault();
      glFailed = true;
      glState = null;
      applyCosmicMode('star', false);
    }, false);

    glState = {
      gl: gl,
      canvas: canvas,
      container: container,
      program: program,
      vbo: vbo,
      aPositionLoc: aPositionLoc,
      skyTex: skyTex,
      uniforms: uniforms,
      framing: computeFraming(window.innerWidth || 1280, window.innerHeight || 800),
      width: 0,
      height: 0
    };

    resizeBlackHoleWebGL();
    return glState;
  }

  function resizeBlackHoleWebGL() {
    if (!glState) return;
    var container = glState.container;
    var cssW = (container && container.clientWidth) || window.innerWidth || 1280;
    var cssH = (container && container.clientHeight) || window.innerHeight || 800;
    var isSmall = cssW <= 768;
    var dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.0 : 1.45);

    var bufW = Math.max(1, Math.floor(cssW * dpr));
    var bufH = Math.max(1, Math.floor(cssH * dpr));

    if (glState.canvas.width !== bufW || glState.canvas.height !== bufH) {
      glState.canvas.width = bufW;
      glState.canvas.height = bufH;
    }

    glState.width = bufW;
    glState.height = bufH;
    glState.framing = computeFraming(cssW, cssH);

    var gl = glState.gl;
    var u = glState.uniforms;
    var maxIter = isSmall ? 105 : 200;
    var stepSize = 2.2 / maxIter;

    gl.useProgram(glState.program);
    gl.viewport(0, 0, bufW, bufH);
    gl.uniform2f(u.uResolution, bufW, bufH);
    gl.uniform1f(u.uPov, glState.framing.pov);
    gl.uniform1f(u.uOpticalZoom, glState.framing.opticalZoom);
    gl.uniform2f(u.uFramingOffset, glState.framing.frameX, glState.framing.frameY);
    gl.uniform1i(u.uMaxIterations, maxIter);
    gl.uniform1f(u.uStepSize, stepSize);
    needsStaticRender = true;
  }

  function getActiveCameraOrientation(elapsedSec) {
    var idleYaw = (!isReducedMotion && isStargazingMode) ? Math.sin(elapsedSec * 0.14) * 0.022 : 0.0;
    var idlePitch = (!isReducedMotion && isStargazingMode) ? Math.cos(elapsedSec * 0.11) * 0.012 : 0.0;
    var totalYaw = orbitYaw + idleYaw + pointerCurrX * 0.055;
    var totalPitch = clamp(orbitPitch + idlePitch + pointerCurrY * 0.036, -0.62, 0.62);
    return {
      yaw: totalYaw,
      pitch: totalPitch,
      rollDeg: orbitRollDeg,
      camDist: 22.5 + cameraZ
    };
  }

  function computeDynamicFrameX(f, cssW, cssH) {
    var aspect = cssW / Math.max(cssH, 1);
    var orbitAway = clamp(Math.abs(orbitYaw) / 0.85, 0.0, 1.0);
    var stargazeFrameX = f.frameX * (1.0 - 0.72 * orbitAway);
    var heroFrameX = aspect >= 1.25 ? 0.165 : (aspect >= 0.98 ? 0.105 : 0.02);
    var diveFrac = clamp((D_STARGAZE - cameraDistance) / (D_STARGAZE - D_MIN), 0.0, 1.0);
    var smoothDive = diveFrac * diveFrac * (3.0 - 2.0 * diveFrac);
    return stargazeFrameX + (heroFrameX - stargazeFrameX) * smoothDive;
  }

  function renderBlackHoleFrame(elapsedSec) {
    if (!glState) return;
    var gl = glState.gl;
    var u = glState.uniforms;
    var f = glState.framing;
    var cam = getActiveCameraOrientation(elapsedSec);
    var cssW = (glState.container && glState.container.clientWidth) || window.innerWidth || 1280;
    var cssH = (glState.container && glState.container.clientHeight) || window.innerHeight || 800;
    var dynFrameX = computeDynamicFrameX(f, cssW, cssH);

    gl.useProgram(glState.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glState.skyTex);
    gl.bindBuffer(gl.ARRAY_BUFFER, glState.vbo);
    gl.enableVertexAttribArray(glState.aPositionLoc);
    gl.vertexAttribPointer(glState.aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(u.uFramingOffset, dynFrameX, f.frameY);
    gl.uniform3f(u.uCameraTranslate, cam.yaw, cam.pitch, cameraZ);
    gl.uniform1f(u.uRollDeg, cam.rollDeg);
    gl.uniform1f(u.uTime, isReducedMotion ? 14.0 : elapsedSec);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. SYNCHRONIZED 3D PERSPECTIVE STARFIELD, 12 BÁT TỰ ZODIAC CONSTELLATIONS
   *    & COSMIC DUST FIELD (#starCanvas)
   * ═════════════════════════════════════════════════════════════════════════ */
  var DEG2RAD = Math.PI / 180.0;

  var STAR_PALETTE = [
    { r: 250, g: 248, b: 243 }, /* 0: #faf8f3 warm alabaster starlight */
    { r: 214, g: 228, b: 252 }, /* 1: #d6e4fc crisp lunar white-blue */
    { r: 226, g: 190, b: 132 }, /* 2: #e2be84 solar champagne gold */
    { r: 155, g: 183, b: 224 }, /* 3: #9bb7e0 atmospheric twilight blue */
    { r: 240, g: 168, b: 117 }  /* 4: #f0a875 warm amber supergiant (Antares / Aldebaran) */
  ];

  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  function wrapAnglePi(rad) {
    var r = rad % (Math.PI * 2.0);
    if (r > Math.PI) r -= Math.PI * 2.0;
    if (r < -Math.PI) r += Math.PI * 2.0;
    return r;
  }

  /* Canonical Bát Tự (12 Địa Chi / Thập Nhị Thứ / Nguyệt Tướng) ↔ 12 Zodiac Constellations
   * Exact 360° compass azimuths (0°=Tý/North, 90°=Mão/East, 180°=Ngọ/South, 270°=Dậu/West)
   * with astronomically accurate ecliptic longitude λ = (315° - az) mod 360° & declination curve.
   * Initial camera (yaw=0) faces Chính Nam (180° Ngọ · Sư Tử) — "Tọa Tý hướng Ngọ".
   * Star offsets [duDeg, dvDeg, mag(1..4), colorIdx(0..4)] are in real-sky view (+du=Right/West, +dv=Up/North). */
  var ZODIAC_SPECS = [
    {
      id: 'aquarius',
      azimuthDeg: 0,
      dirVi: 'Bắc', dirEn: 'N',
      chiVi: 'Tý', chiEn: 'Zi',
      elementVi: 'Thủy', elementEn: 'Water',
      palaceVi: 'Huyền Hiêu',
      nameVi: 'Bảo Bình', nameEn: 'Aquarius',
      labelOffset: [0.5, 7.6],
      stars: [
        [1.2, 4.2, 2, 2],   /* 0: Sadalmelik */
        [6.2, 1.8, 2, 2],   /* 1: Sadalsuud */
        [9.5, -0.8, 3, 1],  /* 2: Albali */
        [-1.8, 3.6, 3, 0],  /* 3: Sadachbia */
        [-2.8, 4.8, 4, 0],  /* 4: Pi Aqr */
        [-3.2, 3.0, 3, 0],  /* 5: Zeta Aqr (Water Jar) */
        [-4.8, 2.6, 3, 1],  /* 6: Eta Aqr */
        [1.6, -0.4, 3, 2],  /* 7: Ancha */
        [-5.0, -1.6, 3, 4], /* 8: Lambda Aqr */
        [-7.0, -0.8, 4, 4], /* 9: Phi Aqr */
        [-5.2, -5.8, 2, 1], /* 10: Skat */
        [-3.2, -4.4, 4, 4], /* 11: Tau Aqr */
        [2.4, -4.6, 3, 1]   /* 12: Iota Aqr */
      ],
      edges: [[2,1],[1,0],[0,3],[3,5],[5,4],[5,6],[0,7],[7,12],[6,8],[8,9],[8,10],[10,11]]
    },
    {
      id: 'capricornus',
      azimuthDeg: 30,
      dirVi: 'Bắc Đông Bắc', dirEn: 'NNE',
      chiVi: 'Sửu', chiEn: 'Chou',
      elementVi: 'Thổ', elementEn: 'Earth',
      palaceVi: 'Tinh Kỷ',
      nameVi: 'Ma Kết', nameEn: 'Capricornus',
      labelOffset: [0.0, 6.4],
      stars: [
        [8.4, 4.2, 2, 2],   /* 0: Algedi */
        [7.6, 2.2, 2, 2],   /* 1: Dabih */
        [2.0, 0.4, 3, 0],   /* 2: Theta Cap */
        [-1.8, 1.2, 3, 2],  /* 3: Iota Cap */
        [-6.2, 2.2, 3, 0],  /* 4: Nashira */
        [-8.2, 2.8, 2, 0],  /* 5: Deneb Algedi */
        [-2.6, -3.4, 3, 2], /* 6: Zeta Cap */
        [2.4, -4.6, 3, 4],  /* 7: Omega Cap */
        [4.2, -3.2, 3, 0]   /* 8: Psi Cap */
      ],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1]]
    },
    {
      id: 'sagittarius',
      azimuthDeg: 60,
      dirVi: 'Đông Đông Bắc', dirEn: 'ENE',
      chiVi: 'Dần', chiEn: 'Yin',
      elementVi: 'Mộc', elementEn: 'Wood',
      palaceVi: 'Tích Mộc',
      nameVi: 'Nhân Mã', nameEn: 'Sagittarius',
      labelOffset: [-0.4, 8.2],
      stars: [
        [1.2, 5.2, 2, 2],   /* 0: Kaus Borealis */
        [3.4, 0.8, 2, 2],   /* 1: Kaus Media */
        [7.6, -0.4, 2, 2],  /* 2: Alnasl (Teapot spout) */
        [3.2, -4.6, 1, 1],  /* 3: Kaus Australis */
        [-2.8, -3.8, 2, 0], /* 4: Ascella */
        [-6.2, -1.6, 3, 2], /* 5: Tau Sgr */
        [-4.8, 1.4, 1, 1],  /* 6: Nunki */
        [-1.0, 0.6, 3, 1],  /* 7: Phi Sgr */
        [-6.6, 4.4, 3, 0]   /* 8: Pi Sgr */
      ],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,7],[7,4],[1,3],[6,8]]
    },
    {
      id: 'scorpius',
      azimuthDeg: 90,
      dirVi: 'Đông', dirEn: 'E',
      chiVi: 'Mão', chiEn: 'Mao',
      elementVi: 'Mộc', elementEn: 'Wood',
      palaceVi: 'Đại Hỏa',
      nameVi: 'Thiên Yết', nameEn: 'Scorpius',
      labelOffset: [-0.4, 7.2],
      stars: [
        [6.8, 4.8, 2, 1],   /* 0: Acrab */
        [7.2, 2.4, 2, 1],   /* 1: Dschubba */
        [6.6, 0.0, 3, 1],   /* 2: Fang */
        [4.0, 1.8, 3, 1],   /* 3: Alniyat */
        [2.6, 1.0, 1, 4],   /* 4: Antares (fiery heart) */
        [1.3, -0.5, 3, 1],  /* 5: Tau Sco */
        [-0.7, -2.6, 2, 2], /* 6: Larawag */
        [-1.4, -4.4, 3, 1], /* 7: Mu Sco */
        [-2.6, -5.6, 3, 4], /* 8: Zeta Sco */
        [-5.2, -5.4, 2, 2], /* 9: Sargas */
        [-6.8, -4.0, 3, 0], /* 10: Iota Sco */
        [-6.6, -2.2, 2, 1], /* 11: Kappa Sco */
        [-5.2, -1.0, 1, 1], /* 12: Shaula (stinger) */
        [-4.3, -1.4, 3, 1]  /* 13: Lesath */
      ],
      edges: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13]]
    },
    {
      id: 'libra',
      azimuthDeg: 120,
      dirVi: 'Đông Đông Nam', dirEn: 'ESE',
      chiVi: 'Thìn', chiEn: 'Chen',
      elementVi: 'Thổ', elementEn: 'Earth',
      palaceVi: 'Thọ Tinh',
      nameVi: 'Thiên Bình', nameEn: 'Libra',
      labelOffset: [0.0, 8.4],
      stars: [
        [-0.4, 5.6, 2, 1],  /* 0: Zubeneschamali */
        [5.2, 1.0, 2, 0],   /* 1: Zubenelgenubi */
        [-4.8, 0.8, 3, 2],  /* 2: Zubenelhakrabi */
        [2.4, -5.4, 3, 4],  /* 3: Brachium */
        [-5.6, -3.4, 3, 2], /* 4: Upsilon Lib */
        [-6.2, -5.6, 3, 1]  /* 5: Tau Lib */
      ],
      edges: [[0,1],[0,2],[1,2],[1,3],[2,4],[4,5]]
    },
    {
      id: 'virgo',
      azimuthDeg: 150,
      dirVi: 'Nam Đông Nam', dirEn: 'SSE',
      chiVi: 'Tỵ', chiEn: 'Si',
      elementVi: 'Hỏa', elementEn: 'Fire',
      palaceVi: 'Thuần Vĩ',
      nameVi: 'Xử Nữ', nameEn: 'Virgo',
      labelOffset: [2.4, 9.2],
      stars: [
        [-2.2, -5.8, 1, 1], /* 0: Spica */
        [-4.2, -0.4, 3, 0], /* 1: Heze */
        [2.4, 0.4, 2, 0],   /* 2: Porrima */
        [0.2, 3.6, 3, 4],   /* 3: Auva */
        [-0.8, 7.2, 2, 2],  /* 4: Vindemiatrix */
        [5.4, 1.0, 3, 0],   /* 5: Zaniah */
        [8.4, 2.4, 3, 2],   /* 6: Zavijava */
        [8.8, 5.0, 4, 4],   /* 7: Nu Vir */
        [-8.2, -2.6, 3, 0], /* 8: Syrma */
        [-9.8, -1.8, 3, 0], /* 9: Mu Vir */
        [-6.8, 2.6, 4, 0]   /* 10: Tau Vir */
      ],
      edges: [[7,6],[6,5],[5,2],[2,3],[3,4],[3,1],[1,2],[2,0],[1,0],[1,8],[8,9],[1,10]]
    },
    {
      id: 'leo',
      azimuthDeg: 180,
      dirVi: 'Nam', dirEn: 'S',
      chiVi: 'Ngọ', chiEn: 'Wu',
      elementVi: 'Hỏa', elementEn: 'Fire',
      palaceVi: 'Thuần Hỏa',
      nameVi: 'Sư Tử', nameEn: 'Leo',
      labelOffset: [-0.4, 8.6],
      stars: [
        [5.8, -3.2, 1, 1],  /* 0: Regulus */
        [5.4, 0.2, 3, 0],   /* 1: Eta Leo */
        [3.8, 2.6, 2, 2],   /* 2: Algieba */
        [4.6, 5.2, 3, 0],   /* 3: Adhafera */
        [7.4, 6.4, 3, 2],   /* 4: Rasalas */
        [9.4, 4.4, 2, 2],   /* 5: Algenubi */
        [-4.2, 3.2, 2, 0],  /* 6: Zosma */
        [-4.6, -0.4, 3, 0], /* 7: Chertan */
        [-9.6, 0.4, 2, 1]   /* 8: Denebola */
      ],
      edges: [[5,4],[4,3],[3,2],[2,1],[1,0],[2,6],[0,7],[6,7],[6,8],[7,8]]
    },
    {
      id: 'cancer',
      azimuthDeg: 210,
      dirVi: 'Nam Tây Nam', dirEn: 'SSW',
      chiVi: 'Mùi', chiEn: 'Wei',
      elementVi: 'Thổ', elementEn: 'Earth',
      palaceVi: 'Thuần Thủ',
      nameVi: 'Cự Giải', nameEn: 'Cancer',
      labelOffset: [0.2, -6.2],
      stars: [
        [-1.8, 6.6, 3, 2],  /* 0: Iota Cnc */
        [-0.4, 1.8, 3, 0],  /* 1: Asellus Borealis */
        [-0.8, -0.6, 3, 2], /* 2: Asellus Australis */
        [-4.6, -4.6, 3, 0], /* 3: Acubens */
        [5.2, -5.2, 2, 4]   /* 4: Al Tarf */
      ],
      edges: [[0,1],[1,2],[2,3],[2,4]]
    },
    {
      id: 'gemini',
      azimuthDeg: 240,
      dirVi: 'Tây Tây Nam', dirEn: 'WSW',
      chiVi: 'Thân', chiEn: 'Shen',
      elementVi: 'Kim', elementEn: 'Metal',
      palaceVi: 'Thực Trầm',
      nameVi: 'Song Tử', nameEn: 'Gemini',
      labelOffset: [0.2, -7.8],
      stars: [
        [-4.6, 6.8, 1, 1],  /* 0: Castor */
        [-6.8, 3.8, 1, 2],  /* 1: Pollux */
        [-1.2, 5.4, 3, 2],  /* 2: Tau Gem */
        [3.4, 2.4, 2, 2],   /* 3: Mebsuta */
        [6.6, 0.2, 2, 4],   /* 4: Tejat */
        [8.4, 0.4, 3, 4],   /* 5: Propus */
        [2.0, 7.6, 3, 0],   /* 6: Theta Gem */
        [-2.2, 0.8, 3, 0],  /* 7: Wasat */
        [0.2, -1.6, 3, 2],  /* 8: Mekbuda */
        [4.0, -4.8, 2, 0],  /* 9: Alhena */
        [-6.2, 0.8, 3, 2],  /* 10: Kappa Gem */
        [2.4, -6.2, 3, 0]   /* 11: Xi Gem */
      ],
      edges: [[0,1],[0,2],[2,6],[2,3],[3,4],[4,5],[1,7],[1,10],[7,8],[8,9],[8,11],[2,7]]
    },
    {
      id: 'taurus',
      azimuthDeg: 270,
      dirVi: 'Tây', dirEn: 'W',
      chiVi: 'Dậu', chiEn: 'You',
      elementVi: 'Kim', elementEn: 'Metal',
      palaceVi: 'Đại Lương',
      nameVi: 'Kim Ngưu', nameEn: 'Taurus',
      labelOffset: [0.2, 8.6],
      stars: [
        [0.2, -0.4, 1, 4],  /* 0: Aldebaran */
        [1.4, -1.2, 3, 0],  /* 1: Theta2 Tau */
        [3.2, -1.4, 3, 2],  /* 2: Hyadum I */
        [2.2, 0.6, 3, 2],   /* 3: Delta Tau */
        [0.6, 2.0, 3, 2],   /* 4: Ain */
        [-7.8, 6.6, 1, 1],  /* 5: Elnath */
        [-8.4, 1.2, 2, 1],  /* 6: Tianguan */
        [6.8, -3.2, 3, 1],  /* 7: Lambda Tau */
        [9.6, -5.6, 3, 1],  /* 8: Xi Tau */
        [7.8, 5.0, 2, 1],   /* 9: Alcyone (Pleiades) */
        [7.0, 4.8, 4, 1],   /* 10: Atlas (Pleiades) */
        [8.4, 5.4, 4, 1],   /* 11: Electra (Pleiades) */
        [8.2, 4.3, 4, 1]    /* 12: Merope (Pleiades) */
      ],
      edges: [[5,4],[4,3],[3,2],[2,1],[1,0],[0,6],[2,7],[7,8]]
    },
    {
      id: 'aries',
      azimuthDeg: 300,
      dirVi: 'Tây Tây Bắc', dirEn: 'WNW',
      chiVi: 'Tuất', chiEn: 'Xu',
      elementVi: 'Thổ', elementEn: 'Earth',
      palaceVi: 'Giáng Lâu',
      nameVi: 'Bạch Dương', nameEn: 'Aries',
      labelOffset: [0.5, 7.2],
      stars: [
        [3.6, 2.4, 1, 2],   /* 0: Hamal */
        [6.2, 0.2, 2, 0],   /* 1: Sheratan */
        [6.8, -1.6, 3, 1],  /* 2: Mesarthim */
        [-2.6, 4.2, 3, 1],  /* 3: 41 Ari */
        [-5.8, -0.4, 3, 2], /* 4: Botein */
        [-3.8, 1.0, 4, 0]   /* 5: Epsilon Ari */
      ],
      edges: [[2,1],[1,0],[0,3],[3,5],[5,4]]
    },
    {
      id: 'pisces',
      azimuthDeg: 330,
      dirVi: 'Bắc Tây Bắc', dirEn: 'NNW',
      chiVi: 'Hợi', chiEn: 'Hai',
      elementVi: 'Thủy', elementEn: 'Water',
      palaceVi: 'Tưu Ty',
      nameVi: 'Song Ngư', nameEn: 'Pisces',
      labelOffset: [1.2, 7.2],
      stars: [
        [-6.8, -3.4, 2, 1], /* 0: Alrescha */
        [-3.6, -1.6, 3, 2], /* 1: Nu Psc */
        [-1.2, -1.2, 4, 2], /* 2: Mu Psc */
        [1.4, -0.4, 3, 2],  /* 3: Epsilon Psc */
        [4.6, -0.8, 3, 0],  /* 4: Omega Psc */
        [6.6, -1.2, 3, 0],  /* 5: Iota Psc (Circlet) */
        [8.0, 0.2, 3, 2],   /* 6: Theta Psc */
        [9.4, -1.4, 3, 2],  /* 7: Gamma Psc */
        [8.4, -3.0, 4, 1],  /* 8: Kappa Psc */
        [6.6, -2.8, 4, 0],  /* 9: Lambda Psc */
        [-6.6, -1.4, 4, 2], /* 10: Xi Psc */
        [-6.2, 0.8, 3, 2],  /* 11: Omicron Psc */
        [-5.4, 3.4, 2, 2],  /* 12: Alpherg */
        [-4.8, 5.2, 4, 0],  /* 13: Rho Psc */
        [-3.2, 7.4, 3, 2],  /* 14: Tau Psc */
        [-4.4, 6.6, 4, 0],  /* 15: Upsilon Psc */
        [-3.6, 5.4, 4, 2]   /* 16: Phi Psc */
      ],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,5],[0,10],[10,11],[11,12],[12,13],[13,15],[15,14],[14,16],[16,13]]
    }
  ];

  var GAZE_ELEVATION_RAD = 15.2 * DEG2RAD;

  function eclipticElevationRad(azimuthDeg) {
    var lambdaRad = ((315.0 - azimuthDeg) % 360.0 + 360.0) % 360.0 * DEG2RAD;
    /* True astronomical Solstice/Equinox Ecliptic wave elevated into the upper celestial crown
     * (+12.6° Winter Solstice at Dần/Sửu -> +17.8° Summer Solstice at Mùi/Thân) so all 12 Bát Tự
     * constellations shine cleanly ABOVE Gargantua's luminous photon ring during 360° orbit. */
    return (15.2 + 2.6 * Math.sin(lambdaRad)) * DEG2RAD;
  }

  function compassToSkyDir(azimuthDeg, elRad) {
    /* Compass 180° (Chính Nam / Ngọ) maps to relAz=0 -> world (0, sin(el), -cos(el)) */
    var relAz = (azimuthDeg - 180.0) * DEG2RAD;
    var ce = Math.cos(elRad);
    return {
      x: -ce * Math.sin(relAz),
      y: Math.sin(elRad),
      z: -ce * Math.cos(relAz)
    };
  }

  function buildZodiacCelestialData() {
    var constellations = [];
    for (var i = 0; i < ZODIAC_SPECS.length; i++) {
      var spec = ZODIAC_SPECS[i];
      var azDeg = spec.azimuthDeg;
      var eclipticDeg = ((315.0 - azDeg) % 360.0 + 360.0) % 360.0;
      var relAz = (azDeg - 180.0) * DEG2RAD;
      var elRad = eclipticElevationRad(azDeg);
      var cDir = compassToSkyDir(azDeg, elRad);

      /* Orthonormal sky tangent basis: T_right (+du, West/screen-right) & T_up (+dv, North/screen-up) */
      var rX = -Math.cos(relAz);
      var rY = 0.0;
      var rZ = Math.sin(relAz);

      var uX = Math.sin(elRad) * Math.sin(relAz);
      var uY = Math.cos(elRad);
      var uZ = Math.sin(elRad) * Math.cos(relAz);

      var stars3D = [];
      for (var s = 0; s < spec.stars.length; s++) {
        var st = spec.stars[s];
        var tu = Math.tan(st[0] * DEG2RAD);
        var tv = Math.tan(st[1] * DEG2RAD);
        var sx = cDir.x + tu * rX + tv * uX;
        var sy = cDir.y + tu * rY + tv * uY;
        var sz = cDir.z + tu * rZ + tv * uZ;
        var len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1.0;
        stars3D.push({
          x: sx / len,
          y: sy / len,
          z: sz / len,
          mag: st[2],
          colIdx: st[3],
          col: STAR_PALETTE[st[3]] || STAR_PALETTE[0],
          phase: ((i * 1.9 + s * 2.37) % (Math.PI * 2.0))
        });
      }

      var lu = Math.tan(spec.labelOffset[0] * DEG2RAD);
      var lv = Math.tan(spec.labelOffset[1] * DEG2RAD);
      var lx = cDir.x + lu * rX + lv * uX;
      var ly = cDir.y + lu * rY + lv * uY;
      var lz = cDir.z + lu * rZ + lv * uZ;
      var lLen = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1.0;

      var targetYaw = wrapAnglePi(-relAz);
      var targetPitch = clamp(elRad - GAZE_ELEVATION_RAD, -0.54, 0.54);

      constellations.push({
        id: spec.id,
        index: i,
        azimuthDeg: azDeg,
        elevationDeg: Number((elRad / DEG2RAD).toFixed(1)),
        eclipticDeg: eclipticDeg,
        dirVi: spec.dirVi,
        dirEn: spec.dirEn,
        chiVi: spec.chiVi,
        chiEn: spec.chiEn,
        elementVi: spec.elementVi,
        elementEn: spec.elementEn,
        palaceVi: spec.palaceVi,
        nameVi: spec.nameVi,
        nameEn: spec.nameEn,
        targetYaw: targetYaw,
        targetPitch: targetPitch,
        cx: cDir.x,
        cy: cDir.y,
        cz: cDir.z,
        lx: lx / lLen,
        ly: ly / lLen,
        lz: lz / lLen,
        stars: stars3D,
        edges: spec.edges
      });
    }

    /* Precompute 120-segment 3D Ecliptic arc + 12 Bát Tự palace boundary ticks */
    var eclipticRing = [];
    var RING_STEPS = 120;
    for (var k = 0; k < RING_STEPS; k++) {
      var ringAz = (k / RING_STEPS) * 360.0;
      eclipticRing.push(compassToSkyDir(ringAz, eclipticElevationRad(ringAz)));
    }

    var palaceTicks = [];
    for (var p = 0; p < 12; p++) {
      /* Palace boundary halfway between centers (15°, 45°, 75°...) + cardinal diamond markers at 0°,90°,180°,270° */
      var bAz = p * 30.0 + 15.0;
      var bEl = eclipticElevationRad(bAz);
      var isSolsticeEquinox = (p % 3 === 1); /* 45° Đông Chí, 135° Thu Phân, 225° Hạ Chí, 315° Xuân Phân */
      var tickHalf = (isSolsticeEquinox ? 1.45 : 0.78) * DEG2RAD;
      palaceTicks.push({
        a: compassToSkyDir(bAz, bEl - tickHalf),
        b: compassToSkyDir(bAz, bEl + tickHalf),
        major: isSolsticeEquinox
      });
    }

    return {
      constellations: constellations,
      eclipticRing: eclipticRing,
      palaceTicks: palaceTicks
    };
  }

  var ZODIAC_DATA = buildZodiacCelestialData();
  var cachedFocusedInfo = {
    constellation: ZODIAC_DATA.constellations[6], /* Ngọ · 180° Nam · Sư Tử */
    focus: 1.0,
    compassAzDeg: 180.0
  };

  /* Crisp vector Zodiac emblems (zero color-emoji square fallback across Windows/iOS/Android) */
  function drawZodiacGlyph(ctx, id, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    switch (id) {
      case 'aries':
        ctx.moveTo(0, r * 0.85);
        ctx.lineTo(0, -r * 0.25);
        ctx.arc(-r * 0.45, -r * 0.25, r * 0.45, 0, Math.PI * 1.15, true);
        ctx.moveTo(0, -r * 0.25);
        ctx.arc(r * 0.45, -r * 0.25, r * 0.45, Math.PI, -Math.PI * 0.15, false);
        break;
      case 'taurus':
        ctx.arc(0, r * 0.22, r * 0.52, 0, Math.PI * 2.0);
        ctx.moveTo(-r * 0.62, -r * 0.82);
        ctx.quadraticCurveTo(0, -r * 0.12, r * 0.62, -r * 0.82);
        break;
      case 'gemini':
        ctx.moveTo(-r * 0.72, -r * 0.78);
        ctx.quadraticCurveTo(0, -r * 0.52, r * 0.72, -r * 0.78);
        ctx.moveTo(-r * 0.72, r * 0.78);
        ctx.quadraticCurveTo(0, r * 0.52, r * 0.72, r * 0.78);
        ctx.moveTo(-r * 0.30, -r * 0.64);
        ctx.lineTo(-r * 0.30, r * 0.64);
        ctx.moveTo(r * 0.30, -r * 0.64);
        ctx.lineTo(r * 0.30, r * 0.64);
        break;
      case 'cancer':
        ctx.arc(-r * 0.42, -r * 0.22, r * 0.26, 0, Math.PI * 2.0);
        ctx.moveTo(-r * 0.56, -r * 0.44);
        ctx.quadraticCurveTo(r * 0.10, -r * 0.88, r * 0.68, -r * 0.32);
        ctx.moveTo(r * 0.68, r * 0.22);
        ctx.arc(r * 0.42, r * 0.22, r * 0.26, 0, Math.PI * 2.0);
        ctx.moveTo(r * 0.56, r * 0.44);
        ctx.quadraticCurveTo(-r * 0.10, r * 0.88, -r * 0.68, r * 0.32);
        break;
      case 'leo':
        ctx.arc(-r * 0.46, r * 0.22, r * 0.28, 0, Math.PI * 2.0);
        ctx.moveTo(-r * 0.24, r * 0.04);
        ctx.bezierCurveTo(-r * 0.45, -r * 0.92, r * 0.62, -r * 0.92, r * 0.28, r * 0.26);
        ctx.quadraticCurveTo(r * 0.16, r * 0.74, r * 0.66, r * 0.62);
        break;
      case 'virgo':
        ctx.moveTo(-r * 0.76, -r * 0.62);
        ctx.lineTo(-r * 0.76, r * 0.56);
        ctx.moveTo(-r * 0.76, -r * 0.28);
        ctx.quadraticCurveTo(-r * 0.52, -r * 0.75, -r * 0.26, -r * 0.22);
        ctx.lineTo(-r * 0.26, r * 0.56);
        ctx.moveTo(-r * 0.26, -r * 0.28);
        ctx.quadraticCurveTo(0, -r * 0.75, r * 0.24, -r * 0.22);
        ctx.lineTo(r * 0.24, r * 0.48);
        ctx.quadraticCurveTo(r * 0.28, r * 0.84, r * 0.74, r * 0.40);
        ctx.moveTo(r * 0.24, -r * 0.22);
        ctx.quadraticCurveTo(r * 0.76, -r * 0.46, r * 0.52, r * 0.22);
        ctx.quadraticCurveTo(r * 0.36, r * 0.64, -r * 0.04, r * 0.86);
        break;
      case 'libra':
        ctx.moveTo(-r * 0.78, r * 0.58);
        ctx.lineTo(r * 0.78, r * 0.58);
        ctx.moveTo(-r * 0.78, r * 0.16);
        ctx.lineTo(-r * 0.36, r * 0.16);
        ctx.arc(0, r * 0.16, r * 0.38, Math.PI, 0, false);
        ctx.lineTo(r * 0.78, r * 0.16);
        break;
      case 'scorpius':
        ctx.moveTo(-r * 0.76, -r * 0.60);
        ctx.lineTo(-r * 0.76, r * 0.54);
        ctx.moveTo(-r * 0.76, -r * 0.26);
        ctx.quadraticCurveTo(-r * 0.52, -r * 0.74, -r * 0.26, -r * 0.22);
        ctx.lineTo(-r * 0.26, r * 0.54);
        ctx.moveTo(-r * 0.26, -r * 0.26);
        ctx.quadraticCurveTo(0, -r * 0.74, r * 0.24, -r * 0.22);
        ctx.lineTo(r * 0.24, r * 0.44);
        ctx.quadraticCurveTo(r * 0.26, r * 0.78, r * 0.72, r * 0.52);
        ctx.moveTo(r * 0.44, r * 0.42);
        ctx.lineTo(r * 0.76, r * 0.52);
        ctx.lineTo(r * 0.56, r * 0.80);
        break;
      case 'sagittarius':
        ctx.moveTo(-r * 0.68, r * 0.68);
        ctx.lineTo(r * 0.68, -r * 0.68);
        ctx.moveTo(r * 0.16, -r * 0.68);
        ctx.lineTo(r * 0.68, -r * 0.68);
        ctx.lineTo(r * 0.68, -r * 0.16);
        ctx.moveTo(-r * 0.44, r * 0.04);
        ctx.lineTo(r * 0.04, r * 0.52);
        break;
      case 'capricornus':
        ctx.moveTo(-r * 0.74, -r * 0.62);
        ctx.lineTo(-r * 0.34, r * 0.42);
        ctx.lineTo(r * 0.08, -r * 0.56);
        ctx.quadraticCurveTo(r * 0.30, -r * 0.10, r * 0.30, r * 0.40);
        ctx.arc(r * 0.52, r * 0.36, r * 0.24, Math.PI, Math.PI * 2.85, false);
        ctx.quadraticCurveTo(r * 0.48, r * 0.86, r * 0.06, r * 0.86);
        break;
      case 'aquarius':
        ctx.moveTo(-r * 0.78, -r * 0.18);
        ctx.lineTo(-r * 0.40, -r * 0.52);
        ctx.lineTo(0, -r * 0.14);
        ctx.lineTo(r * 0.40, -r * 0.52);
        ctx.lineTo(r * 0.78, -r * 0.18);
        ctx.moveTo(-r * 0.78, r * 0.42);
        ctx.lineTo(-r * 0.40, r * 0.08);
        ctx.lineTo(0, r * 0.46);
        ctx.lineTo(r * 0.40, r * 0.08);
        ctx.lineTo(r * 0.78, r * 0.42);
        break;
      case 'pisces':
        ctx.moveTo(-r * 0.56, -r * 0.76);
        ctx.quadraticCurveTo(-r * 0.10, 0, -r * 0.56, r * 0.76);
        ctx.moveTo(r * 0.56, -r * 0.76);
        ctx.quadraticCurveTo(r * 0.10, 0, r * 0.56, r * 0.76);
        ctx.moveTo(-r * 0.72, 0);
        ctx.lineTo(r * 0.72, 0);
        break;
    }
    ctx.stroke();
    ctx.restore();
  }

  function createGlowSprites() {
    var sprites = [];
    var size = 32;
    var half = size * 0.5;
    for (var i = 0; i < STAR_PALETTE.length; i++) {
      var col = STAR_PALETTE[i];
      var off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      var octx = off.getContext('2d');
      if (octx) {
        var g = octx.createRadialGradient(half, half, 0, half, half, half);
        g.addColorStop(0.0, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.48)');
        g.addColorStop(0.42, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.14)');
        g.addColorStop(1.0, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0)');
        octx.fillStyle = g;
        octx.fillRect(0, 0, size, size);
      }
      sprites.push(off);
    }
    return sprites;
  }

  /* True 3D dust motes distributed in spherical volume around Gargantua + camera orbit */
  function create3DDustParticles(count) {
    var list = [];
    for (var i = 0; i < count; i++) {
      var u = Math.random();
      var v = Math.random();
      var theta = u * Math.PI * 2.0;
      var phi = Math.acos(2.0 * v - 1.0);
      var r = 11.0 + Math.pow(Math.random(), 0.72) * 36.0;
      var colorRoll = Math.random();
      var colIdx = colorRoll < 0.45 ? 0 : (colorRoll < 0.72 ? 2 : (colorRoll < 0.90 ? 1 : 3));
      list.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) * 0.72,
        z: r * Math.sin(phi) * Math.sin(theta),
        driftSpeed: 0.015 + Math.random() * 0.032,
        size: 0.65 + Math.random() * 1.15,
        colIdx: colIdx,
        col: STAR_PALETTE[colIdx],
        baseAlpha: 0.22 + Math.random() * 0.48,
        phase: Math.random() * Math.PI * 2.0,
        prevX: null,
        prevY: null
      });
    }
    return list;
  }

  function createStarItem(w, h) {
    var depth = 0.28 + Math.random() * 0.72;
    var colorRoll = Math.random();
    var colorIdx = colorRoll < 0.52 ? 0 : (colorRoll < 0.78 ? 1 : (colorRoll < 0.90 ? 3 : 2));
    var col = STAR_PALETTE[colorIdx];
    var isBright = depth > 0.84 && Math.random() < 0.20;
    var radius = isBright
      ? (1.05 + Math.random() * 0.72)
      : (0.38 + depth * 0.70 * Math.random());

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z: depth,
      r: radius,
      colIdx: colorIdx,
      col: col,
      baseAlpha: isBright ? (0.68 + Math.random() * 0.24) : (0.18 + depth * 0.46),
      phase: Math.random() * Math.PI * 2.0,
      freq: 0.45 + Math.random() * 1.35,
      halo: isBright
    };
  }

  function initStarCanvas(canvas) {
    if (!canvas) return null;
    if (starState) return starState;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var w = window.innerWidth || 1280;
    var h = window.innerHeight || 800;
    var count = w <= 768 ? 150 : 220;
    var stars = [];
    for (var i = 0; i < count; i++) {
      stars.push(createStarItem(w, h));
    }

    starState = {
      canvas: canvas,
      ctx: ctx,
      cssW: w,
      cssH: h,
      dpr: 1,
      stars: stars,
      dust3D: create3DDustParticles(w <= 768 ? 85 : 145),
      glowSprites: createGlowSprites(),
      meteor: null,
      nextMeteorSec: 8.5 + Math.random() * 7.5,
      overlayAlpha: 1.0,
      constellationAlpha: isStargazingMode ? 1.0 : 0.0
    };

    resizeStarCanvas();
    return starState;
  }

  function resizeStarCanvas() {
    if (!starState) return;
    var prevW = starState.cssW || 1;
    var prevH = starState.cssH || 1;
    var cssW = window.innerWidth || 1280;
    var cssH = window.innerHeight || 800;
    var dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    starState.cssW = cssW;
    starState.cssH = cssH;
    starState.dpr = dpr;

    var bufW = Math.max(1, Math.floor(cssW * dpr));
    var bufH = Math.max(1, Math.floor(cssH * dpr));
    if (starState.canvas.width !== bufW || starState.canvas.height !== bufH) {
      starState.canvas.width = bufW;
      starState.canvas.height = bufH;
    }

    var targetCount = cssW <= 768 ? 150 : 220;
    var stars = starState.stars;
    var scaleX = cssW / prevW;
    var scaleY = cssH / prevH;

    for (var i = 0; i < stars.length; i++) {
      stars[i].x = ((stars[i].x * scaleX) % cssW + cssW) % cssW;
      stars[i].y = ((stars[i].y * scaleY) % cssH + cssH) % cssH;
    }
    while (stars.length < targetCount) {
      stars.push(createStarItem(cssW, cssH));
    }
    if (stars.length > targetCount) {
      stars.length = targetCount;
    }

    /* Reset previous screen positions on resize to prevent cross-screen streaks */
    if (starState.dust3D) {
      for (var d = 0; d < starState.dust3D.length; d++) {
        starState.dust3D[d].prevX = null;
        starState.dust3D[d].prevY = null;
      }
    }
    needsStaticRender = true;
  }

  function isOccludedBySphere(roX, roY, roZ, rdX, rdY, rdZ, distToPt, cx, cy, cz, radius) {
    var ocX = roX - cx;
    var ocY = roY - cy;
    var ocZ = roZ - cz;
    var b = ocX * rdX + ocY * rdY + ocZ * rdZ;
    var c = (ocX * ocX + ocY * ocY + ocZ * ocZ) - radius * radius;
    var h = b * b - c;
    if (h <= 0.0) return false;
    var tNear = -b - Math.sqrt(h);
    return tNear > 0.0 && tNear < distToPt;
  }

  /* Compute GLSL-exact 3D Eclipse camera basis & screen projection parameters */
  function computeEclipseCamera(elapsedSec, w, h) {
    var cam = getActiveCameraOrientation(elapsedSec);
    var cy = Math.cos(cam.yaw);
    var sy = Math.sin(cam.yaw);
    var cp = Math.cos(cam.pitch);
    var sp = Math.sin(cam.pitch);

    /* Match GLSL bit-for-bit: look_from = rotate_y(yaw) * rotate_x(-pitch) * (0, 0.72, camDist) */
    var y0 = 0.72;
    var z0 = cam.camDist;
    var py1 = y0 * cp - z0 * sp;
    var pz1 = y0 * sp + z0 * cp;
    var camX = -pz1 * sy;
    var camY = py1;
    var camZ = pz1 * cy;

    var camLen = Math.sqrt(camX * camX + camY * camY + camZ * camZ) || 1.0;
    var fwdX = -camX / camLen;
    var fwdY = -camY / camLen;
    var fwdZ = -camZ / camLen;

    var rollRad = cam.rollDeg * DEG2RAD;
    var upRefX = Math.sin(rollRad);
    var upRefY = Math.cos(rollRad);
    var upRefZ = 0.0;

    /* right = normalize(cross(upRef, fwd)) */
    var rx = upRefY * fwdZ - upRefZ * fwdY;
    var ry = upRefZ * fwdX - upRefX * fwdZ;
    var rz = upRefX * fwdY - upRefY * fwdX;
    var rLen = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1.0;
    rx /= rLen; ry /= rLen; rz /= rLen;

    /* trueUp = cross(fwd, right) */
    var ux = fwdY * rz - fwdZ * ry;
    var uy = fwdZ * rx - fwdX * rz;
    var uz = fwdX * ry - fwdY * rx;

    var f = glState ? glState.framing : computeFraming(w, h);
    var dynFrameX = computeDynamicFrameX(f, w, h);
    var focal = (h * 0.5 * f.opticalZoom) / Math.tan((f.pov * 0.5) * DEG2RAD);
    var centerX = w * (0.5 + dynFrameX);
    var centerY = h * (0.5 - f.frameY);

    return {
      yaw: cam.yaw,
      pitch: cam.pitch,
      camX: camX, camY: camY, camZ: camZ, camLen: camLen,
      fwdX: fwdX, fwdY: fwdY, fwdZ: fwdZ,
      rx: rx, ry: ry, rz: rz,
      ux: ux, uy: uy, uz: uz,
      focal: focal,
      centerX: centerX,
      centerY: centerY,
      w: w,
      h: h
    };
  }

  /* Analytical angular-cone occluders for sky sphere at infinity (Planet + Moon + Gargantua shadow) */
  function computeSkyOccluders(c) {
    var pvx = 10.6 - c.camX;
    var pvy = 0.28 - c.camY;
    var pvz = 13.6 - c.camZ;
    var pDist = Math.sqrt(pvx * pvx + pvy * pvy + pvz * pvz) || 1.0;

    var mvx = -12.2 - c.camX;
    var mvy = 4.2 - c.camY;
    var mvz = 6.2 - c.camZ;
    var mDist = Math.sqrt(mvx * mvx + mvy * mvy + mvz * mvz) || 1.0;

    var evx = EARTH_WORLD.x - c.camX;
    var evy = EARTH_WORLD.y - c.camY;
    var evz = EARTH_WORLD.z - c.camZ;
    var eDist = Math.sqrt(evx * evx + evy * evy + evz * evz) || 1.0;

    return {
      pDx: pvx / pDist, pDy: pvy / pDist, pDz: pvz / pDist,
      pSolid: Math.asin(Math.min(0.998, 7.62 / pDist)),
      pAtm: Math.asin(Math.min(0.999, 8.35 / pDist)),

      mDx: mvx / mDist, mDy: mvy / mDist, mDz: mvz / mDist,
      mSolid: Math.asin(Math.min(0.998, 0.88 / mDist)),
      mAtm: Math.asin(Math.min(0.999, 1.15 / mDist)),

      eDx: evx / eDist, eDy: evy / eDist, eDz: evz / eDist,
      eSolid: Math.asin(Math.min(0.998, EARTH_WORLD.r / eDist)),
      eAtm: Math.asin(Math.min(0.999, (EARTH_WORLD.atmR + 0.14) / eDist)),

      bhDx: c.fwdX, bhDy: c.fwdY, bhDz: c.fwdZ,
      bhSolid: Math.asin(Math.min(0.998, 2.75 / c.camLen)),
      bhAtm: Math.asin(Math.min(0.999, 5.20 / c.camLen))
    };
  }

  function getSkyDirectionVisibility(dx, dy, dz, occ) {
    var vis = 1.0;

    var pDot = clamp(dx * occ.pDx + dy * occ.pDy + dz * occ.pDz, -1.0, 1.0);
    var pAng = Math.acos(pDot);
    if (pAng <= occ.pSolid) return 0.0;
    if (pAng < occ.pAtm) vis *= smoothstep(occ.pSolid, occ.pAtm, pAng);

    var mDot = clamp(dx * occ.mDx + dy * occ.mDy + dz * occ.mDz, -1.0, 1.0);
    var mAng = Math.acos(mDot);
    if (mAng <= occ.mSolid) return 0.0;
    if (mAng < occ.mAtm) vis *= smoothstep(occ.mSolid, occ.mAtm, mAng);

    var eDot = clamp(dx * occ.eDx + dy * occ.eDy + dz * occ.eDz, -1.0, 1.0);
    var eAng = Math.acos(eDot);
    if (eAng <= occ.eSolid) return 0.0;
    if (eAng < occ.eAtm) vis *= smoothstep(occ.eSolid, occ.eAtm, eAng);

    var bhDot = clamp(dx * occ.bhDx + dy * occ.bhDy + dz * occ.bhDz, -1.0, 1.0);
    var bhAng = Math.acos(bhDot);
    if (bhAng <= occ.bhSolid) return 0.0;
    if (bhAng < occ.bhAtm) vis *= smoothstep(occ.bhSolid, occ.bhAtm, bhAng);

    /* Subtle dim across Gargantua's luminous horizontal equatorial accretion disk */
    if (bhAng < occ.bhAtm * 1.95) {
      var eqOff = Math.abs(dy - occ.bhDy);
      if (eqOff < 0.11) {
        var diskDim = 1.0 - 0.62 * (1.0 - smoothstep(0.0, 0.11, eqOff)) * (1.0 - smoothstep(occ.bhSolid, occ.bhAtm * 1.95, bhAng));
        vis *= diskDim;
      }
    }

    return vis;
  }

  /* Padded angular visibility for text labels so typography never overlaps Planet/Moon/Earth/Gargantua glow */
  function getLabelVisibility(dx, dy, dz, occ) {
    var vis = 1.0;

    var pDot = clamp(dx * occ.pDx + dy * occ.pDy + dz * occ.pDz, -1.0, 1.0);
    var pAng = Math.acos(pDot);
    if (pAng <= occ.pSolid + 0.08) return 0.0;
    if (pAng < occ.pAtm + 0.15) vis *= smoothstep(occ.pSolid + 0.08, occ.pAtm + 0.15, pAng);

    var mDot = clamp(dx * occ.mDx + dy * occ.mDy + dz * occ.mDz, -1.0, 1.0);
    var mAng = Math.acos(mDot);
    if (mAng <= occ.mSolid + 0.04) return 0.0;
    if (mAng < occ.mAtm + 0.08) vis *= smoothstep(occ.mSolid + 0.04, occ.mAtm + 0.08, mAng);

    var eDot = clamp(dx * occ.eDx + dy * occ.eDy + dz * occ.eDz, -1.0, 1.0);
    var eAng = Math.acos(eDot);
    if (eAng <= occ.eSolid + 0.06) return 0.0;
    if (eAng < occ.eAtm + 0.11) vis *= smoothstep(occ.eSolid + 0.06, occ.eAtm + 0.11, eAng);

    var bhDot = clamp(dx * occ.bhDx + dy * occ.bhDy + dz * occ.bhDz, -1.0, 1.0);
    var bhAng = Math.acos(bhDot);
    if (bhAng <= occ.bhSolid + 0.095) return 0.0;
    if (bhAng < occ.bhAtm + 0.15) vis *= smoothstep(occ.bhSolid + 0.095, occ.bhAtm + 0.15, bhAng);

    return vis;
  }

  function projectSkyDir(dx, dy, dz, c) {
    var vz = dx * c.fwdX + dy * c.fwdY + dz * c.fwdZ;
    if (vz <= 0.06) return null;
    var vx = dx * c.rx + dy * c.ry + dz * c.rz;
    var vy = dx * c.ux + dy * c.uy + dz * c.uz;
    return {
      x: c.centerX + (vx / vz) * c.focal,
      y: c.centerY - (vy / vz) * c.focal,
      vz: vz
    };
  }

  function measureTrackedText(ctx, text, tracking) {
    if (!text) return 0;
    var w = ctx.measureText(text).width;
    return w + Math.max(0, text.length - 1) * tracking;
  }

  function fillTrackedTextLeft(ctx, text, startX, y, tracking) {
    var x = startX;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + tracking;
    }
  }

  function updateFocusedConstellation(camYaw, camPitch) {
    var cy = Math.cos(camYaw);
    var sy = Math.sin(camYaw);
    var cp = Math.cos(camPitch);
    var sp = Math.sin(camPitch);
    var y0 = 0.72;
    var z0 = 22.5 + cameraZ;
    var py1 = y0 * cp - z0 * sp;
    var pz1 = y0 * sp + z0 * cp;
    var camX = -pz1 * sy;
    var camY = py1;
    var camZ = pz1 * cy;
    var len = Math.sqrt(camX * camX + camY * camY + camZ * camZ) || 1.0;
    var fx = -camX / len;
    var fy = -camY / len;
    var fz = -camZ / len;

    /* Upper-sky celestial crown gaze vector (+GAZE_ELEVATION_RAD above Gargantua center) */
    var rx = fz;
    var ry = 0.0;
    var rz = -fx;
    var rLen = Math.sqrt(rx * rx + rz * rz) || 1.0;
    rx /= rLen; rz /= rLen;
    var ux = fy * rz - fz * ry;
    var uy = fz * rx - fx * rz;
    var uz = fx * ry - fy * rx;
    var cg = Math.cos(GAZE_ELEVATION_RAD);
    var sg = Math.sin(GAZE_ELEVATION_RAD);
    var gx = fx * cg + ux * sg;
    var gy = fy * cg + uy * sg;
    var gz = fz * cg + uz * sg;

    var list = ZODIAC_DATA.constellations;
    var best = list[6];
    var bestDot = -2.0;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var d = gx * item.cx + gy * item.cy + gz * item.cz;
      if (d > bestDot) {
        bestDot = d;
        best = item;
      }
    }

    var compassAz = ((180.0 - (camYaw / DEG2RAD)) % 360.0 + 360.0) % 360.0;
    cachedFocusedInfo = {
      constellation: best,
      focus: smoothstep(0.66, 0.96, bestDot),
      compassAzDeg: compassAz
    };
    return cachedFocusedInfo;
  }

  /* Render 12 Bát Tự Zodiac Constellations & Tilted Astronomical Ecliptic in True 3D */
  function renderZodiacConstellations(ctx, c, occ, elapsedSec, masterAlpha) {
    if (masterAlpha <= 0.015) return;

    var w = c.w;
    var h = c.h;
    var isCompact = w <= 640;
    var isEn = /^en/i.test(document.documentElement ? (document.documentElement.lang || '') : '');
    var sprites = starState ? starState.glowSprites : null;

    /* 1. Whisper-fine 3D Tilted Ecliptic Great Circle + 12 Bát Tự Palace Ticks */
    var ring = ZODIAC_DATA.eclipticRing;
    var ringLen = ring.length;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2.5, 6.5]);

    var prevP = null;
    var prevVis = 0.0;
    for (var r = 0; r <= ringLen; r++) {
      var pt = ring[r % ringLen];
      var proj = projectSkyDir(pt.x, pt.y, pt.z, c);
      var vis = proj ? getSkyDirectionVisibility(pt.x, pt.y, pt.z, occ) : 0.0;
      if (proj && prevP) {
        var segVis = Math.min(prevVis, vis);
        var ddx = proj.x - prevP.x;
        var ddy = proj.y - prevP.y;
        if (segVis > 0.04 && (ddx * ddx + ddy * ddy) < (w * w * 0.16) &&
            !((proj.x < -80 && prevP.x < -80) || (proj.x > w + 80 && prevP.x > w + 80) ||
              (proj.y < -80 && prevP.y < -80) || (proj.y > h + 80 && prevP.y > h + 80))) {
          ctx.strokeStyle = 'rgba(155, 183, 224, ' + (0.115 * segVis * masterAlpha).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(prevP.x, prevP.y);
          ctx.lineTo(proj.x, proj.y);
          ctx.stroke();
        }
      }
      prevP = proj;
      prevVis = vis;
    }

    ctx.setLineDash([]);
    var ticks = ZODIAC_DATA.palaceTicks;
    for (var t = 0; t < ticks.length; t++) {
      var tk = ticks[t];
      var pa = projectSkyDir(tk.a.x, tk.a.y, tk.a.z, c);
      var pb = projectSkyDir(tk.b.x, tk.b.y, tk.b.z, c);
      if (!pa || !pb) continue;
      if (pa.x < -40 || pa.x > w + 40 || pa.y < -40 || pa.y > h + 40) continue;
      var tVis = getSkyDirectionVisibility((tk.a.x + tk.b.x) * 0.5, (tk.a.y + tk.b.y) * 0.5, (tk.a.z + tk.b.z) * 0.5, occ);
      if (tVis <= 0.04) continue;
      ctx.strokeStyle = tk.major
        ? ('rgba(226, 190, 132, ' + (0.28 * tVis * masterAlpha).toFixed(3) + ')')
        : ('rgba(155, 183, 224, ' + (0.18 * tVis * masterAlpha).toFixed(3) + ')');
      ctx.lineWidth = tk.major ? 1.0 : 0.75;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    ctx.restore();

    /* 2. Render All 12 Zodiac Constellations (Curved Occluded Edges, Spectral Stars, Diegetic Labels) */
    var constellations = ZODIAC_DATA.constellations;
    var cgGaze = Math.cos(GAZE_ELEVATION_RAD);
    var sgGaze = Math.sin(GAZE_ELEVATION_RAD);
    var gazeX = c.fwdX * cgGaze + c.ux * sgGaze;
    var gazeY = c.fwdY * cgGaze + c.uy * sgGaze;
    var gazeZ = c.fwdZ * cgGaze + c.uz * sgGaze;
    var bestItem = constellations[6];
    var bestDot = -2.0;

    for (var i = 0; i < constellations.length; i++) {
      var con = constellations[i];
      var centerDot = gazeX * con.cx + gazeY * con.cy + gazeZ * con.cz;
      if (centerDot > bestDot) {
        bestDot = centerDot;
        bestItem = con;
      }

      /* Broad-phase hemisphere cull */
      if (centerDot < -0.18) continue;

      var focus = smoothstep(0.66, 0.96, centerDot);
      var stars = con.stars;
      var projStars = new Array(stars.length);
      var anyVisible = false;

      for (var s = 0; s < stars.length; s++) {
        var st = stars[s];
        var ps = projectSkyDir(st.x, st.y, st.z, c);
        if (!ps || ps.x < -120 || ps.x > w + 120 || ps.y < -120 || ps.y > h + 120) {
          projStars[s] = null;
          continue;
        }
        var sVis = getSkyDirectionVisibility(st.x, st.y, st.z, occ);
        projStars[s] = { x: ps.x, y: ps.y, vis: sVis };
        if (sVis > 0.02) anyVisible = true;
      }

      if (!anyVisible) continue;

      /* Interpolated Eclipse palette: Lunar Silver-Blue (ambient) -> Champagne Gold (focused) */
      var lineR = Math.round(155 + (226 - 155) * focus);
      var lineG = Math.round(183 + (190 - 183) * focus);
      var lineB = Math.round(224 + (132 - 224) * focus);
      var baseLineAlpha = (0.19 + 0.29 * focus) * masterAlpha;

      /* 2a. Curved 6-step spherical constellation lines with exact Planet/Moon/BH occlusion */
      var edges = con.edges;
      var SUBDIV = 6;
      ctx.save();
      ctx.lineCap = 'round';
      for (var e = 0; e < edges.length; e++) {
        var aIdx = edges[e][0];
        var bIdx = edges[e][1];
        var sa = stars[aIdx];
        var sb = stars[bIdx];
        var paS = projStars[aIdx];
        var pbS = projStars[bIdx];
        if (!paS && !pbS) continue;

        var prevPt = null;
        for (var k = 0; k <= SUBDIV; k++) {
          var frac = k / SUBDIV;
          var mx = sa.x + (sb.x - sa.x) * frac;
          var my = sa.y + (sb.y - sa.y) * frac;
          var mz = sa.z + (sb.z - sa.z) * frac;
          var mLen = Math.sqrt(mx * mx + my * my + mz * mz) || 1.0;
          mx /= mLen; my /= mLen; mz /= mLen;

          var curPt = projectSkyDir(mx, my, mz, c);
          if (curPt && prevPt) {
            var midX = (prevPt.dx + mx) * 0.5;
            var midY = (prevPt.dy + my) * 0.5;
            var midZ = (prevPt.dz + mz) * 0.5;
            var midL = Math.sqrt(midX * midX + midY * midY + midZ * midZ) || 1.0;
            var segVis = getSkyDirectionVisibility(midX / midL, midY / midL, midZ / midL, occ);
            if (segVis > 0.025) {
              var sAlpha = baseLineAlpha * segVis;
              /* Soft golden outer shimmer on focused constellation */
              if (focus > 0.25) {
                ctx.strokeStyle = 'rgba(' + lineR + ', ' + lineG + ', ' + lineB + ', ' + (sAlpha * 0.26).toFixed(3) + ')';
                ctx.lineWidth = 3.0;
                ctx.beginPath();
                ctx.moveTo(prevPt.x, prevPt.y);
                ctx.lineTo(curPt.x, curPt.y);
                ctx.stroke();
              }
              ctx.strokeStyle = 'rgba(' + lineR + ', ' + lineG + ', ' + lineB + ', ' + sAlpha.toFixed(3) + ')';
              ctx.lineWidth = 0.8 + 0.35 * focus;
              ctx.beginPath();
              ctx.moveTo(prevPt.x, prevPt.y);
              ctx.lineTo(curPt.x, curPt.y);
              ctx.stroke();
            }
          }
          prevPt = curPt ? { x: curPt.x, y: curPt.y, dx: mx, dy: my, dz: mz } : null;
        }
      }
      ctx.restore();

      /* 2b. Spectral Constellation Stars + Radial Halos + Astrophotography Diffraction Cross-Flares */
      for (var j = 0; j < stars.length; j++) {
        var pj = projStars[j];
        if (!pj || pj.vis <= 0.02) continue;
        var star = stars[j];
        var twinkle = isReducedMotion ? 0.90 : (0.78 + 0.22 * Math.sin(elapsedSec * (1.25 + (j % 4) * 0.32) + star.phase));
        var magSize = star.mag === 1 ? 2.15 : (star.mag === 2 ? 1.55 : (star.mag === 3 ? 1.12 : 0.82));
        var rad = magSize * (0.90 + 0.24 * focus) * (isCompact ? 0.88 : 1.0);
        var sAlpha = clamp((0.58 + 0.36 * focus) * (star.mag === 1 ? 1.0 : (star.mag === 2 ? 0.90 : 0.78)) * twinkle * pj.vis * masterAlpha, 0.0, 0.98);
        var colStr = star.col.r + ', ' + star.col.g + ', ' + star.col.b;

        if (sprites && sprites[star.colIdx] && star.mag <= 3) {
          var haloMul = star.mag === 1 ? (5.2 + 1.8 * focus) : (star.mag === 2 ? 4.2 : 3.0);
          var hr = rad * haloMul;
          ctx.globalAlpha = clamp(sAlpha * (star.mag === 1 ? 0.95 : 0.72), 0.0, 0.95);
          ctx.drawImage(sprites[star.colIdx], pj.x - hr, pj.y - hr, hr * 2.0, hr * 2.0);
          ctx.globalAlpha = 1.0;
        }

        /* Crisp 4-point diffraction cross-sparkle for primary beacon stars */
        if (star.mag === 1 || (star.mag === 2 && focus > 0.35)) {
          var flareLen = (star.mag === 1 ? (6.8 + 5.8 * focus) : (3.6 + 3.2 * focus)) * (isCompact ? 0.82 : 1.0);
          var flareA = sAlpha * (star.mag === 1 ? 0.62 : 0.36);
          ctx.strokeStyle = 'rgba(' + colStr + ', ' + flareA.toFixed(3) + ')';
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(pj.x - flareLen, pj.y);
          ctx.lineTo(pj.x + flareLen, pj.y);
          ctx.moveTo(pj.x, pj.y - flareLen);
          ctx.lineTo(pj.x, pj.y + flareLen);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(' + colStr + ', ' + sAlpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(pj.x, pj.y, rad, 0, Math.PI * 2.0);
        ctx.fill();

        /* Hot alabaster pinprick center for mag 1–2 stars */
        if (star.mag <= 2) {
          ctx.fillStyle = 'rgba(255, 253, 248, ' + (sAlpha * 0.92).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(pj.x, pj.y, rad * 0.48, 0, Math.PI * 2.0);
          ctx.fill();
        }
      }

      /* 2c. Diegetic Bilingual Constellation Label + Crisp Vector Zodiac Emblem */
      var lp = projectSkyDir(con.lx, con.ly, con.lz, c);
      if (!lp) continue;

      var edgeFade = smoothstep(32, 92, lp.x) * smoothstep(w - 32, w - 92, lp.x)
                   * smoothstep(34, 64, lp.y) * smoothstep(h - 92, h - 144, lp.y);
      /* Avoid overlapping top-left telemetry & top-right controls without clipping open top-center sky */
      if (lp.x < 440 && lp.y < 104) {
        edgeFade *= smoothstep(74, 104, lp.y);
      } else if (lp.x > w - 260 && lp.y < 94) {
        edgeFade *= smoothstep(66, 94, lp.y);
      }
      if (edgeFade <= 0.02) continue;

      var labelVis = getLabelVisibility(con.lx, con.ly, con.lz, occ);
      if (labelVis <= 0.06) continue;

      var labelAlpha = (0.34 + 0.58 * focus) * edgeFade * labelVis * masterAlpha;
      if (labelAlpha <= 0.03) continue;

      var titleText = isEn ? con.nameEn.toUpperCase() : con.nameVi.toUpperCase();
      var subText = isEn
        ? (con.chiEn + ' (' + con.chiVi + ') · ' + con.azimuthDeg + '° ' + con.dirEn)
        : ('Cung ' + con.chiVi + ' · ' + con.elementVi + ' · ' + con.azimuthDeg + '° ' + con.dirVi);

      var titleSize = isCompact ? 9.5 : 10.5;
      var subSize = isCompact ? 11.0 : 12.0;
      var tracking = isCompact ? 1.5 : 2.1;
      var glyphR = isCompact ? 4.8 : 5.4;
      var glyphGap = isCompact ? 6.5 : 7.5;

      ctx.save();
      ctx.shadowColor = 'rgba(3, 5, 10, 0.92)';
      ctx.shadowBlur = 9;
      ctx.textBaseline = 'middle';

      ctx.font = '600 ' + titleSize + 'px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
      var titleW = measureTrackedText(ctx, titleText, tracking);
      var rowW = glyphR * 2.0 + glyphGap + titleW;
      var rowLeft = lp.x - rowW * 0.5;

      var titleR = Math.round(201 + (244 - 201) * focus);
      var titleG = Math.round(219 + (223 - 219) * focus);
      var titleB = Math.round(244 + (185 - 244) * focus);
      var titleStroke = 'rgba(' + titleR + ', ' + titleG + ', ' + titleB + ', ' + labelAlpha.toFixed(3) + ')';

      ctx.strokeStyle = titleStroke;
      ctx.lineWidth = 1.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawZodiacGlyph(ctx, con.id, rowLeft + glyphR, lp.y - 0.5, glyphR);

      ctx.fillStyle = titleStroke;
      ctx.textAlign = 'left';
      fillTrackedTextLeft(ctx, titleText, rowLeft + glyphR * 2.0 + glyphGap, lp.y, tracking);

      ctx.font = 'italic 400 ' + subSize + 'px "Cormorant Garamond", "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(155, 183, 224, ' + (labelAlpha * (0.72 + 0.16 * focus)).toFixed(3) + ')';
      ctx.textAlign = 'center';
      ctx.fillText(subText, lp.x, lp.y + (isCompact ? 13.5 : 15.0));

      ctx.restore();
    }

    var compassAz = ((180.0 - (c.yaw / DEG2RAD)) % 360.0 + 360.0) % 360.0;
    cachedFocusedInfo = {
      constellation: bestItem,
      focus: smoothstep(0.66, 0.96, bestDot),
      compassAzDeg: compassAz
    };
  }

  function hideEarthHotspot() {
    earthScreenState = { visible: false, x: 0, y: 0, radiusPx: 0, opacity: 0 };
    if (!earthHotspotEl) return;
    earthHotspotEl.classList.remove('is-visible');
    earthHotspotEl.style.opacity = '0';
    earthHotspotEl.setAttribute('aria-hidden', 'true');
    earthHotspotEl.setAttribute('tabindex', '-1');
  }

  /* Sync accessible interactive link hotspot (#earth-planet-link) to 3D Earth-like glory-vocabulary */
  function updateEarthHotspot(c, masterAlpha) {
    if (!isStargazingMode || cosmicMode !== 'blackhole' || !isHome || masterAlpha <= 0.04) {
      hideEarthHotspot();
      return;
    }

    var dx = EARTH_WORLD.x - c.camX;
    var dy = EARTH_WORLD.y - c.camY;
    var dz = EARTH_WORLD.z - c.camZ;
    var vz = dx * c.fwdX + dy * c.fwdY + dz * c.fwdZ;
    if (vz <= EARTH_WORLD.r + 0.8) {
      hideEarthHotspot();
      return;
    }

    var distE = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
    var rdX = dx / distE;
    var rdY = dy / distE;
    var rdZ = dz / distE;

    /* Occlusion check against Foreground Planet, Moon, and Black Hole Event Horizon shadow */
    if (isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distE, 10.6, 0.28, 13.6, 7.55) ||
        isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distE, -12.2, 4.2, 6.2, 0.85) ||
        (distE > c.camLen && isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distE, 0.0, 0.0, 0.0, 2.72))) {
      hideEarthHotspot();
      return;
    }

    var vx = dx * c.rx + dy * c.ry + dz * c.rz;
    var vy = dx * c.ux + dy * c.uy + dz * c.uz;
    var sx = c.centerX + (vx / vz) * c.focal;
    var sy = c.centerY - (vy / vz) * c.focal;
    var radPx = (EARTH_WORLD.r / Math.sqrt(Math.max(distE * distE - EARTH_WORLD.r * EARTH_WORLD.r, 1.0))) * c.focal;

    var pad = radPx + 24;
    if (sx < -pad || sx > c.w + pad || sy < -pad || sy > c.h + pad) {
      hideEarthHotspot();
      return;
    }

    var edgeFade = smoothstep(-radPx * 0.4, radPx + 22, sx)
                 * smoothstep(c.w + radPx * 0.4, c.w - radPx - 22, sx)
                 * smoothstep(42, 92, sy)
                 * smoothstep(c.h - 48, c.h - 108, sy);
    var vis = clamp(masterAlpha * edgeFade, 0.0, 1.0);
    if (vis <= 0.05) {
      hideEarthHotspot();
      return;
    }

    var diaPx = clamp(radPx * 2.0, 44.0, 240.0);
    earthScreenState = {
      visible: true,
      x: Number(sx.toFixed(1)),
      y: Number(sy.toFixed(1)),
      radiusPx: Number(radPx.toFixed(1)),
      opacity: Number(vis.toFixed(3))
    };

    if (!earthHotspotEl) return;
    earthHotspotEl.style.transform = 'translate3d(' + sx.toFixed(1) + 'px, ' + sy.toFixed(1) + 'px, 0)';
    earthHotspotEl.style.setProperty('--earth-dia', diaPx.toFixed(1) + 'px');
    earthHotspotEl.style.opacity = vis.toFixed(3);
    earthHotspotEl.classList.add('is-visible');
    earthHotspotEl.removeAttribute('aria-hidden');
    earthHotspotEl.removeAttribute('tabindex');
  }

  /* Project 12 Bát Tự Zodiac Constellations + 3D Foreground Cosmic Dust + Earth Hotspot */
  function render3DDustOverlay(elapsedSec, dtSec) {
    if (!starState || !starState.dust3D) return;
    var ctx = starState.ctx;
    var w = starState.cssW;
    var h = starState.cssH;
    var dpr = starState.dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var c = computeEclipseCamera(elapsedSec, w, h);
    var occ = computeSkyOccluders(c);

    /* 1. 12 Bát Tự Zodiac Constellations (visible in 3D rotation/stargazing mode, fades cleanly on dive) */
    var diveFade = smoothstep(5.5, 19.5, cameraDistance);
    var targetConstAlpha = isStargazingMode ? diveFade : 0.0;
    if (isReducedMotion) {
      starState.constellationAlpha = targetConstAlpha;
    } else {
      var constStep = 1.0 - Math.exp(-5.0 * dtSec);
      starState.constellationAlpha += (targetConstAlpha - starState.constellationAlpha) * constStep;
      if (Math.abs(targetConstAlpha - starState.constellationAlpha) < 0.005) {
        starState.constellationAlpha = targetConstAlpha;
      }
    }

    if (starState.constellationAlpha > 0.015) {
      renderZodiacConstellations(ctx, c, occ, elapsedSec, starState.constellationAlpha);
    }

    /* 1b. Sync Interactive glory-vocabulary Earth Planet Link Hotspot */
    updateEarthHotspot(c, starState.constellationAlpha);

    /* 2. Synchronized 3D Foreground Cosmic Dust */
    var dust = starState.dust3D;
    var sprites = starState.glowSprites;
    var warpFactor = clamp((currentStarSpeed - 1.0) / 4.2, 0.0, 1.0);
    var dustMaster = isStargazingMode ? 0.74 : 1.0;

    for (var i = 0; i < dust.length; i++) {
      var pt = dust[i];
      var ang = isReducedMotion ? 0.0 : (elapsedSec * pt.driftSpeed);
      var ca = Math.cos(ang);
      var sa = Math.sin(ang);
      var wx = pt.x * ca - pt.z * sa;
      var wy = pt.y;
      var wz = pt.x * sa + pt.z * ca;

      var dx = wx - c.camX;
      var dy = wy - c.camY;
      var dz = wz - c.camZ;

      var vz = dx * c.fwdX + dy * c.fwdY + dz * c.fwdZ;
      if (vz < 1.8 || vz > 85.0) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      /* 3D Ray-Sphere Occlusion: prevent background dust from bleeding through solid Planet, Moon or Earth */
      var distToPt = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
      var rdX = dx / distToPt;
      var rdY = dy / distToPt;
      var rdZ = dz / distToPt;
      var dpx = wx - 10.6;
      var dpy = wy - 0.28;
      var dpz = wz - 13.6;
      var dex = wx - EARTH_WORLD.x;
      var dey = wy - EARTH_WORLD.y;
      var dez = wz - EARTH_WORLD.z;
      if (dpx * dpx + dpy * dpy + dpz * dpz < 60.84 ||
          dex * dex + dey * dey + dez * dez < (EARTH_WORLD.atmR * EARTH_WORLD.atmR) ||
          isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distToPt, 10.6, 0.28, 13.6, 7.65) ||
          isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distToPt, -12.2, 4.2, 6.2, 0.88) ||
          isOccludedBySphere(c.camX, c.camY, c.camZ, rdX, rdY, rdZ, distToPt, EARTH_WORLD.x, EARTH_WORLD.y, EARTH_WORLD.z, EARTH_WORLD.r + 0.06)) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      var vx = dx * c.rx + dy * c.ry + dz * c.rz;
      var vy = dx * c.ux + dy * c.uy + dz * c.uz;

      var sx = c.centerX + (vx / vz) * c.focal;
      var sy = c.centerY - (vy / vz) * c.focal;

      if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      var depthScale = clamp(18.0 / vz, 0.32, 2.35);
      var nearFade = clamp((vz - 1.8) / 4.5, 0.0, 1.0) * clamp((75.0 - vz) / 28.0, 0.0, 1.0);
      var twinkle = isReducedMotion ? 0.85 : (0.68 + 0.32 * Math.sin(elapsedSec * 1.1 + pt.phase));
      var alpha = clamp(pt.baseAlpha * nearFade * twinkle * (0.85 + 0.35 * warpFactor) * dustMaster, 0.02, 0.88);
      var rad = pt.size * depthScale;
      var colStr = pt.col.r + ', ' + pt.col.g + ', ' + pt.col.b;

      /* Subtle 3D motion-parallax streak during fast orbital drag or dive */
      if (!isReducedMotion && pt.prevX !== null) {
        var mvx = sx - pt.prevX;
        var mvy = sy - pt.prevY;
        var distSq = mvx * mvx + mvy * mvy;
        if (distSq > 2.5 && distSq < 6400.0) {
          var tailMul = 1.65 + warpFactor * 3.5;
          var tx = sx - mvx * tailMul;
          var ty = sy - mvy * tailMul;
          var g = ctx.createLinearGradient(sx, sy, tx, ty);
          g.addColorStop(0.0, 'rgba(' + colStr + ', ' + (alpha * 0.72).toFixed(3) + ')');
          g.addColorStop(1.0, 'rgba(' + colStr + ', 0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = Math.max(0.65, rad * 0.85);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }

      if (rad > 1.25 && sprites && sprites[pt.colIdx]) {
        var hr = rad * 3.8;
        ctx.globalAlpha = alpha * 0.75;
        ctx.drawImage(sprites[pt.colIdx], sx - hr, sy - hr, hr * 2.0, hr * 2.0);
        ctx.globalAlpha = 1.0;
      }

      ctx.fillStyle = 'rgba(' + colStr + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2.0);
      ctx.fill();

      pt.prevX = sx;
      pt.prevY = sy;
    }

    ctx.restore();
  }

  function spawnMeteor(w, h) {
    var angle = (Math.PI * 0.70) + (Math.random() * 0.18);
    var speed = 540 + Math.random() * 240;
    return {
      x: w * (0.28 + Math.random() * 0.62),
      y: h * (0.05 + Math.random() * 0.30),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.52,
      len: 70 + Math.random() * 60,
      life: 0.0,
      maxLife: 0.62 + Math.random() * 0.28
    };
  }

  function renderStarfieldFrame(elapsedSec, dtSec) {
    if (!starState) return;
    var ctx = starState.ctx;
    var w = starState.cssW;
    var h = starState.cssH;
    var dpr = starState.dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, w, h);

    var driftT = isReducedMotion ? 0.0 : elapsedSec * 0.038;
    var maxDim = Math.max(w, h);

    var neb1X = w * (0.78 + 0.03 * Math.sin(driftT));
    var neb1Y = h * (0.20 + 0.03 * Math.cos(driftT * 0.8));
    var g1 = ctx.createRadialGradient(neb1X, neb1Y, 0, neb1X, neb1Y, maxDim * 0.56);
    g1.addColorStop(0.0, 'rgba(24, 48, 92, 0.17)');
    g1.addColorStop(0.55, 'rgba(13, 25, 52, 0.06)');
    g1.addColorStop(1.0, 'rgba(5, 7, 14, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    var neb2X = w * (0.20 + 0.025 * Math.cos(driftT * 0.6));
    var neb2Y = h * (0.76 + 0.025 * Math.sin(driftT * 0.7));
    var g2 = ctx.createRadialGradient(neb2X, neb2Y, 0, neb2X, neb2Y, maxDim * 0.48);
    g2.addColorStop(0.0, 'rgba(226, 190, 132, 0.055)');
    g2.addColorStop(0.55, 'rgba(168, 132, 82, 0.02)');
    g2.addColorStop(1.0, 'rgba(5, 7, 14, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    var speed = isReducedMotion ? 0.0 : currentStarSpeed;
    var warpFactor = clamp((speed - 1.0) / 4.5, 0.0, 1.0);
    var stars = starState.stars;
    var sprites = starState.glowSprites;
    var cx = w * 0.5;
    var cy = h * 0.5;

    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];

      if (!isReducedMotion && dtSec > 0) {
        var baseVy = -8.5 * st.z;
        var baseVx = 1.8 * st.z;
        var rx = (st.x - cx) / Math.max(w * 0.5, 1);
        var ry = (st.y - cy) / Math.max(h * 0.5, 1);
        var warpVx = rx * 140.0 * st.z * warpFactor;
        var warpVy = (-180.0 + ry * 90.0) * st.z * warpFactor;

        st.x += (baseVx + warpVx) * dtSec;
        st.y += (baseVy + warpVy) * dtSec;

        if (st.x < -12) st.x += w + 24;
        else if (st.x > w + 12) st.x -= w + 24;
        if (st.y < -24) {
          st.y += h + 48;
          st.x = Math.random() * w;
        } else if (st.y > h + 24) {
          st.y -= h + 48;
        }
      }

      var twinkle = isReducedMotion
        ? 0.88
        : (0.68 + 0.32 * Math.sin(elapsedSec * st.freq + st.phase));
      var alpha = clamp(st.baseAlpha * twinkle + warpFactor * 0.16, 0.05, 0.96);
      var colStr = st.col.r + ', ' + st.col.g + ', ' + st.col.b;

      if (warpFactor > 0.04 && !isReducedMotion) {
        var dirX = ((st.x - cx) / Math.max(w * 0.5, 1)) * 0.40;
        var dirY = -1.0 + ((st.y - cy) / Math.max(h * 0.5, 1)) * 0.30;
        var trailLen = (4.0 + 32.0 * warpFactor) * st.z;
        var tailX = st.x - dirX * trailLen;
        var tailY = st.y - dirY * trailLen;

        var trailGrad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        trailGrad.addColorStop(0.0, 'rgba(' + colStr + ', ' + alpha.toFixed(3) + ')');
        trailGrad.addColorStop(1.0, 'rgba(' + colStr + ', 0)');
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = Math.max(0.75, st.r * 1.1);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      if (st.halo && warpFactor < 0.35 && sprites && sprites[st.colIdx]) {
        var hr = st.r * 4.4;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[st.colIdx], st.x - hr, st.y - hr, hr * 2.0, hr * 2.0);
        ctx.globalAlpha = 1.0;
      }

      ctx.fillStyle = 'rgba(' + colStr + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2.0);
      ctx.fill();
    }

    if (!isReducedMotion) {
      if (!starState.meteor && elapsedSec >= starState.nextMeteorSec) {
        starState.meteor = spawnMeteor(w, h);
      }
      if (starState.meteor) {
        var m = starState.meteor;
        m.life += dtSec;
        m.x += m.vx * dtSec;
        m.y += m.vy * dtSec;
        var prog = m.life / m.maxLife;
        if (prog >= 1.0) {
          starState.meteor = null;
          starState.nextMeteorSec = elapsedSec + 9.5 + Math.random() * 7.0;
        } else {
          var mAlpha = Math.sin(prog * Math.PI) * 0.60;
          var norm = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1.0;
          var mxTail = m.x - (m.vx / norm) * m.len;
          var myTail = m.y - (m.vy / norm) * m.len;
          var mGrad = ctx.createLinearGradient(m.x, m.y, mxTail, myTail);
          mGrad.addColorStop(0.0, 'rgba(250, 248, 243, ' + mAlpha.toFixed(3) + ')');
          mGrad.addColorStop(0.42, 'rgba(226, 190, 132, ' + (mAlpha * 0.45).toFixed(3) + ')');
          mGrad.addColorStop(1.0, 'rgba(155, 183, 224, 0)');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 1.15;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(mxTail, myTail);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 4. COSMIC MODE MANAGEMENT & TOGGLE CONTROLS
   * ═════════════════════════════════════════════════════════════════════════ */
  function syncToggleButtons() {
    var btns = document.querySelectorAll('[data-cosmic-toggle]');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isBH = cosmicMode === 'blackhole';
      var label = btn.querySelector('.cosmic-pill-label');
      if (label) {
        label.textContent = isBH ? 'ECLIPSE' : 'STARFIELD';
      } else {
        btn.textContent = isBH ? 'ECLIPSE' : 'STARFIELD';
      }
      btn.setAttribute('data-mode', cosmicMode);
      btn.classList.toggle('is-starfield', !isBH);
      btn.setAttribute('aria-pressed', isBH ? 'true' : 'false');
    }
  }

  function applyCosmicMode(requestedMode, persistPreference) {
    var mode = requestedMode === 'blackhole' ? 'blackhole' : 'star';

    if (!domReady) {
      cosmicMode = mode;
      if (persistPreference) saveMode(mode);
      return;
    }

    if (!isHome || !bhContainer) {
      mode = 'star';
    } else if (mode === 'blackhole') {
      var ok = initBlackHoleWebGL(bhContainer);
      if (!ok) {
        mode = 'star';
      }
    }

    cosmicMode = mode;
    if (persistPreference) {
      saveMode(mode);
    }

    if (bhContainer) {
      if (cosmicMode === 'blackhole') {
        bhContainer.style.display = 'block';
        bhContainer.style.opacity = '1';
      } else {
        bhContainer.style.opacity = '0';
        bhContainer.style.display = 'none';
      }
    }

    if (starCanvas) {
      initStarCanvas(starCanvas);
      starCanvas.style.display = 'block';
      var isEclipse3D = cosmicMode === 'blackhole' && isHome;
      starCanvas.classList.toggle('is-eclipse-3d', isEclipse3D);
      if (!isEclipse3D) {
        starCanvas.style.opacity = '1';
        if (starState) starState.overlayAlpha = 1.0;
        hideEarthHotspot();
      } else {
        var desired = isStargazingMode ? 1.0 : (currentStarSpeed > 2.0 ? 0.85 : 0.34);
        starCanvas.style.opacity = String(desired);
        if (starState) starState.overlayAlpha = desired;
      }
    }

    syncToggleButtons();
    needsStaticRender = true;
    ensureLoopRunning();

    try {
      window.dispatchEvent(new CustomEvent('nm:cosmic-mode-change', {
        detail: { mode: cosmicMode }
      }));
    } catch (err) {}
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 5. MASTER 3D ANIMATION LOOP (DT-NORMALIZED)
   * ═════════════════════════════════════════════════════════════════════════ */
  function tick() {
    rafId = 0;
    if (isPaused) return;

    var now = nowMs();
    var dtSec = clamp((now - lastTickMs) / 1000.0, 0.0, 0.065);
    lastTickMs = now;
    var elapsedSec = (now - startTimeMs) / 1000.0;

    var pointerAlpha = 1.0 - Math.exp(-4.4 * dtSec);
    var speedAlpha = 1.0 - Math.exp(-5.0 * dtSec);

    pointerCurrX += (pointerTargetX - pointerCurrX) * pointerAlpha;
    pointerCurrY += (pointerTargetY - pointerCurrY) * pointerAlpha;
    currentStarSpeed += (targetStarSpeed - currentStarSpeed) * speedAlpha;

    var speedSettled = Math.abs(targetStarSpeed - currentStarSpeed) < 0.01;
    if (speedSettled) currentStarSpeed = targetStarSpeed;

    if (cosmicMode === 'blackhole' && isHome) {
      if (!isReducedMotion || needsStaticRender) {
        renderBlackHoleFrame(elapsedSec);
      }

      if (starState && starCanvas) {
        var desiredOverlay = isStargazingMode ? 1.0 : (targetStarSpeed > 2.0 ? 0.85 : 0.32);
        var overlayStep = 1.0 - Math.exp(-4.5 * dtSec);
        starState.overlayAlpha += (desiredOverlay - starState.overlayAlpha) * overlayStep;
        starCanvas.style.opacity = starState.overlayAlpha.toFixed(3);
        if (starState.overlayAlpha > 0.02 && (!isReducedMotion || needsStaticRender)) {
          render3DDustOverlay(elapsedSec, dtSec);
        }
      }
    } else if (starState) {
      if (!isReducedMotion || needsStaticRender) {
        renderStarfieldFrame(elapsedSec, dtSec);
      }
    }

    needsStaticRender = false;

    if (!isReducedMotion || !speedSettled) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function ensureLoopRunning() {
    if (isPaused) return;
    if (!rafId) {
      lastTickMs = nowMs();
      rafId = window.requestAnimationFrame(tick);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 6. PUBLIC WINDOW API (Backward-Compatible + New 3D Orbit & Zodiac API)
   * ═════════════════════════════════════════════════════════════════════════ */
  window.setCameraDistance = function (d) {
    explicitDistanceSet = true;
    cameraDistance = clamp(Number(d), D_MIN, D_MAX);
    cameraZ = mapDistToZ(cameraDistance);
    needsStaticRender = true;
    ensureLoopRunning();
  };

  window.getCameraDistance = function () {
    return cameraDistance;
  };

  window.getCameraBounds = function () {
    return {
      dMin: D_MIN,
      dMax: D_MAX,
      dStargaze: D_STARGAZE
    };
  };

  window.setOrbitAngles = function (yaw, pitch, rollDeg) {
    if (typeof yaw === 'number' && isFinite(yaw)) {
      orbitYaw = yaw;
    }
    if (typeof pitch === 'number' && isFinite(pitch)) {
      orbitPitch = clamp(pitch, -0.58, 0.58);
    }
    if (typeof rollDeg === 'number' && isFinite(rollDeg)) {
      orbitRollDeg = clamp(rollDeg, -6.0, 6.0);
    }
    updateFocusedConstellation(orbitYaw, orbitPitch);
    if (typeof window.__nmSyncOrbitHud === 'function') {
      window.__nmSyncOrbitHud(orbitYaw, orbitPitch, orbitRollDeg);
    }
    needsStaticRender = true;
    ensureLoopRunning();
  };

  window.getOrbitAngles = function () {
    return {
      yaw: orbitYaw,
      pitch: orbitPitch,
      rollDeg: orbitRollDeg
    };
  };

  window.getZodiacConstellations = function () {
    var list = ZODIAC_DATA.constellations;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      out.push({
        id: c.id,
        index: c.index,
        azimuthDeg: c.azimuthDeg,
        elevationDeg: c.elevationDeg,
        eclipticDeg: c.eclipticDeg,
        dirVi: c.dirVi,
        dirEn: c.dirEn,
        chiVi: c.chiVi,
        chiEn: c.chiEn,
        elementVi: c.elementVi,
        elementEn: c.elementEn,
        palaceVi: c.palaceVi,
        nameVi: c.nameVi,
        nameEn: c.nameEn,
        targetYaw: c.targetYaw,
        targetPitch: c.targetPitch
      });
    }
    return out;
  };

  window.getFocusedConstellation = function () {
    var info = cachedFocusedInfo || updateFocusedConstellation(orbitYaw, orbitPitch);
    var c = info.constellation;
    return {
      id: c.id,
      index: c.index,
      azimuthDeg: c.azimuthDeg,
      elevationDeg: c.elevationDeg,
      eclipticDeg: c.eclipticDeg,
      dirVi: c.dirVi,
      dirEn: c.dirEn,
      chiVi: c.chiVi,
      chiEn: c.chiEn,
      elementVi: c.elementVi,
      elementEn: c.elementEn,
      palaceVi: c.palaceVi,
      nameVi: c.nameVi,
      nameEn: c.nameEn,
      targetYaw: c.targetYaw,
      targetPitch: c.targetPitch,
      focus: info.focus,
      compassAzDeg: info.compassAzDeg
    };
  };

  window.getEarthPlanetScreenState = function () {
    return {
      name: 'glory-vocabulary',
      url: 'https://gloryvocab.com',
      visible: earthScreenState.visible,
      x: earthScreenState.x,
      y: earthScreenState.y,
      radiusPx: earthScreenState.radiusPx,
      opacity: earthScreenState.opacity
    };
  };

  window.setStargazingState = function (active) {
    isStargazingMode = !!active;
    if (!isStargazingMode) hideEarthHotspot();
    needsStaticRender = true;
    ensureLoopRunning();
  };

  window.setStarSpeed = function (mult) {
    var m = Number(mult);
    if (!isFinite(m) || m < 0.1) m = 1.0;
    targetStarSpeed = clamp(m, 0.2, 8.0);
    needsStaticRender = true;
    ensureLoopRunning();
  };

  window.setCosmicMode = function (mode) {
    applyCosmicMode(mode, true);
  };

  window.getCosmicMode = function () {
    return cosmicMode;
  };

  /* ═══════════════════════════════════════════════════════════════════════════
   * 7. DOM BOOTSTRAP & EVENT LISTENERS
   * ═════════════════════════════════════════════════════════════════════════ */
  function handleResize() {
    if (glState) resizeBlackHoleWebGL();
    if (starState) resizeStarCanvas();
    needsStaticRender = true;
    ensureLoopRunning();
  }

  function initCosmos() {
    if (domReady) return;
    domReady = true;

    isHome = !!(document.body && document.body.classList.contains('is-home'));
    bhContainer = document.getElementById('bh-canvas');
    starCanvas = document.getElementById('starCanvas');
    earthHotspotEl = document.getElementById('earth-planet-link');

    if (!explicitDistanceSet) {
      cameraDistance = D_STARGAZE;
      cameraZ = mapDistToZ(D_STARGAZE);
    }

    if (starCanvas) {
      initStarCanvas(starCanvas);
    }

    var saved = getSavedMode();
    /* Enable True-3D WebGL Eclipse across Desktop, Tablet & Mobile (with graceful Starfield fallback) */
    var canUseBlackHole = isHome && !!bhContainer && saved !== 'star';
    applyCosmicMode(canUseBlackHole ? 'blackhole' : 'star', false);

    document.addEventListener('click', function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('[data-cosmic-toggle]') : null;
      if (!target) return;
      ev.preventDefault();
      var nextMode = cosmicMode === 'blackhole' ? 'star' : 'blackhole';
      applyCosmicMode(nextMode, true);
    });

    window.addEventListener('mousemove', function (ev) {
      if (isReducedMotion) return;
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      pointerTargetX = clamp((ev.clientX / w) - 0.5, -0.5, 0.5);
      pointerTargetY = clamp((ev.clientY / h) - 0.5, -0.5, 0.5);
    }, { passive: true });

    window.addEventListener('resize', handleResize, { passive: true });

    document.addEventListener('visibilitychange', function () {
      isPaused = !!document.hidden;
      if (isPaused && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!isPaused) {
        needsStaticRender = true;
        ensureLoopRunning();
      }
    });

    if (reducedMotionQuery) {
      var onMotionPrefChange = function (e) {
        isReducedMotion = !!e.matches;
        needsStaticRender = true;
        ensureLoopRunning();
      };
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', onMotionPrefChange);
      } else if (reducedMotionQuery.addListener) {
        reducedMotionQuery.addListener(onMotionPrefChange);
      }
    }

    needsStaticRender = true;
    ensureLoopRunning();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCosmos);
  } else {
    initCosmos();
  }
})();
