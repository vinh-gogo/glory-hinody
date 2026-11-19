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
    'const float diskInnerSoft   = 0.22;',
    'const float diskOuterSoft   = 0.34;',
    '',
    'const float disk_flow       = 9.5;',
    'const float ORBIT_OMEGA_K   = 0.92;',
    'const float INFALL_K        = 0.064;',
    'const float SPIRAL_TIGHT_K  = 1.25;',
    '',
    '/* True 3D World-Space Celestial Bodies (Left Foreground Planet + Upper-Right Crescent Moon) */',
    'const vec3  PLANET_POS      = vec3(10.6, 0.28, 13.6);',
    'const float PLANET_R        = 7.60;',
    'const float PLANET_ATM_R    = 8.05;',
    '',
    'const vec3  MOON_POS        = vec3(-12.2, 4.2, 6.2);',
    'const float MOON_R          = 0.85;',
    'const float MOON_ATM_R      = 0.92;',
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
    'vec4 compute(inout vec3 position, inout vec3 velocity, inout Ray ray, inout float minApproach) {',
    '  vec3  perpendicular = cross(position, velocity);',
    '  float h2            = dot(perpendicular, perpendicular);',
    '  float diskTime      = uTime * uDiskSpeed;',
    '',
    '  for (int i = 0; i < MAX_RAY_STEPS; i++) {',
    '    if (i >= uMaxIterations) {',
    '      break;',
    '    }',
    '    float dist      = length(position);',
    '    minApproach     = min(minApproach, dist);',
    '    float step_size = dist * dist * uStepSize;',
    '    vec3  rk_delta  = velocity * step_size;',
    '',
    '    vec3 k1 = step_size * geodesic_equation(position, h2);',
    '    vec3 k2 = step_size * geodesic_equation(position + rk_delta + 0.5 * k1, h2);',
    '    vec3 k3 = step_size * geodesic_equation(position + rk_delta + 0.5 * k2, h2);',
    '    vec3 k4 = step_size * geodesic_equation(position + rk_delta + k3,      h2);',
    '    vec3 d  = (k1 + 2.0 * (k2 + k3) + k4) / 6.0;',
    '',
    '    vec3 ray_step = position + rk_delta + d * uStepSize;',
    '',
    '    if (uAccretionDisk == 1.0 &&',
    '        position.y * ray_step.y < 0.0 &&',
    '        dist > innerDiskRadius - 0.5 &&',
    '        dist < outerDiskRadius + 0.5) {',
    '',
    '      float t_cross      = clamp(position.y / (position.y - ray_step.y + 1.0e-7), 0.0, 1.0);',
    '      vec3  crossingPos  = mix(position, ray_step, t_cross);',
    '      float crossingDist = length(crossingPos);',
    '',
    '      if (crossingDist > innerDiskRadius - 0.35 && crossingDist < outerDiskRadius) {',
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
    '        float radialNorm  = disk_dist / deltaR;',
    '        float infallPhase = radialNorm - diskTime * infallV;',
    '        float spiralTilt  = theta * SPIRAL_TIGHT_K + infallPhase * 2.8 + (disk_flow * 0.06) / safeDist;',
    '',
    '        vec3 noiseCoord = vec3(',
    '          rotX * 0.62 + infallPhase * 3.5 + spiralTilt * 0.45,',
    '          rotZ * 0.62 + infallPhase * 1.2,',
    '          safeDist * 0.16 + sin(spiralTilt + diskTime * infallV) * 0.11',
    '        );',
    '',
    '        float radialMask = smoothstep(innerDiskRadius - diskInnerSoft, innerDiskRadius + diskInnerSoft, crossingDist)',
    '                         * smoothstep(outerDiskRadius + diskOuterSoft, outerDiskRadius - diskOuterSoft, crossingDist);',
    '',
    '        float disk_intensity = (1.0 - length(crossingPos / vec3(outerDiskRadius, 1.0, outerDiskRadius))) * radialMask;',
    '',
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
    '        float innerRim = smoothstep(innerDiskRadius + 0.72, innerDiskRadius - 0.05, crossingDist);',
    '        float density_variation = mix(0.32, 1.18, turbulence);',
    '        density_variation = mix(density_variation, max(density_variation, 0.90), innerRim * 0.28);',
    '',
    '        disk_intensity *= inversesqrt(safeDist) * density_variation;',
    '        float dpth = step_size * (float(uMaxIterations) / 9.5) * disk_intensity;',
    '',
    '        vec3 orbitTangent = normalize(vec3(-crossingPos.z, 0.0, crossingPos.x));',
    '        float vTan = clamp(dot(velocity / SPEED_OF_LIGHT, orbitTangent), -0.92, 0.92);',
    '        float dopplerShift = sqrt(max(0.0, (1.0 - vTan) / max(1.0e-4, 1.0 + vTan)));',
    '        float beaming = pow(max(dopplerShift, 1.0e-5), 0.30);',
    '',
    '        float belowPlane = smoothstep(0.07, -0.28, crossingPos.y);',
    '        float faceMul = mix(1.0, 0.28, belowPlane);',
    '',
    '        float camR = max(length(camera_pos), innerDiskRadius + 0.5);',
    '        float redshift = sqrt(max(0.0, (1.0 - 2.0 / safeDist) / max(1.0e-4, 1.0 - 2.0 / camR)));',
    '',
    '        float temp = clamp(beaming * (0.45 + 0.85 * innerRim + 0.45 * disk_intensity), 0.0, 1.8);',
    '        vec3 diskHue = mix(vec3(0.68, 0.44, 0.21), vec3(0.97, 0.79, 0.51), smoothstep(0.18, 0.85, temp));',
    '        diskHue = mix(diskHue, vec3(1.0, 0.97, 0.91), smoothstep(0.85, 1.50, temp));',
    '',
    '        vec3 color_rgb = diskHue * beaming * redshift * dpth * faceMul * 1.24;',
    '',
    '        float dRing = (crossingDist - PHOTON_RING_R) / PHOTON_RING_W;',
    '        float rimCore = innerRim * exp(-dRing * dRing);',
    '        color_rgb += vec3(1.0, 0.95, 0.85) * rimCore * beaming * redshift * faceMul * 2.4;',
    '',
    '        ray.origin    = vec4(position, 1.0);',
    '        ray.direction = vec4(velocity, 0.0);',
    '',
    '        return GetColor(ray) + vec4(color_rgb, 1.0);',
    '      }',
    '    }',
    '',
    '    if (dist >= BACKGROUND_DISTANCE) {',
    '      break;',
    '    }',
    '    if (dist <= EVENT_HORIZON_RADIUS) {',
    '      return vec4(0.0, 0.0, 0.0, 0.0);',
    '    }',
    '',
    '    position += rk_delta;',
    '    velocity += d;',
    '  }',
    '',
    '  /* Rays still trapped near the photon sphere after max iterations are captured, eliminating 1px aliasing dots */',
    '  if (length(position) < 4.5) {',
    '    return vec4(0.0, 0.0, 0.0, 0.0);',
    '  }',
    '  ray.origin    = vec4(position, 1.0);',
    '  ray.direction = vec4(velocity, 0.0);',
    '  return GetColor(ray);',
    '}',
    '',
    'void main() {',
    '  Ray  ray = pixelToWorldRay();',
    '  vec3 ro  = vec3(ray.origin);',
    '  vec3 rd  = normalize(vec3(ray.direction));',
    '  float distToBH = length(ro);',
    '',
    '  /* 1. True 3D World-Space Intersections for Foreground Planet & Distant Moon */',
    '  vec2 hitPlanet = raySphere(ro, rd, PLANET_POS, PLANET_R);',
    '  vec2 hitMoon   = raySphere(ro, rd, MOON_POS,   MOON_R);',
    '',
    '  /* Exact early-out only when body is strictly closer than the entire accretion disk sphere */',
    '  float safeFrontDist = max(distToBH - outerDiskRadius - 0.5, 0.0);',
    '  bool planetStrictlyFront = (hitPlanet.x > 0.0 && hitPlanet.x < safeFrontDist);',
    '  bool moonStrictlyFront   = (hitMoon.x > 0.0 && hitMoon.x < safeFrontDist);',
    '  if (planetStrictlyFront && moonStrictlyFront) {',
    '    if (hitPlanet.x < hitMoon.x) moonStrictlyFront = false;',
    '    else planetStrictlyFront = false;',
    '  }',
    '',
    '  vec3 hdrCol = vec3(0.0);',
    '',
    '  /* GPU Early-Out: Rays hitting the solid foreground 3D planet skip RK4 raymarching! */',
    '  if (planetStrictlyFront) {',
    '    hdrCol = shadePlanet3D(ro, rd, hitPlanet.x, PLANET_POS, 0.0);',
    '  } else if (moonStrictlyFront) {',
    '    hdrCol = shadePlanet3D(ro, rd, hitMoon.x, MOON_POS, 1.0);',
    '    if (hitPlanet.x <= 0.0) {',
    '      hdrCol += computeAtmHalo3D(ro, rd, PLANET_POS, PLANET_R, PLANET_ATM_R);',
    '    }',
    '  } else {',
    '    /* 2. Relativistic RK4 Geodesic Raymarch around Gargantua */',
    '    vec3 position = ro;',
    '    vec3 velocity = SPEED_OF_LIGHT * rd;',
    '    float minApproach = 1.0e6;',
    '',
    '    vec4 color = compute(position, velocity, ray, minApproach);',
    '    float escaped = step(0.5, color.a);',
    '    float hitDisk = step(1.5, color.a);',
    '    float tDisk   = length(vec3(ray.origin) - ro);',
    '',
    '    /* Exact Per-Pixel 3D Depth Sorting between Planet, Moon, Event Horizon & Accretion Disk */',
    '    bool bodyOccludesAll = false;',
    '    if (hitPlanet.x > 0.0 && (hitMoon.x <= 0.0 || hitPlanet.x < hitMoon.x)) {',
    '      vec3 pCol = shadePlanet3D(ro, rd, hitPlanet.x, PLANET_POS, 0.0);',
    '      if (hitDisk > 0.5) {',
    '        if (hitPlanet.x < tDisk) { hdrCol = pCol; bodyOccludesAll = true; }',
    '        else { color.rgb = pCol * 0.28 + color.rgb; }',
    '      } else if (escaped < 0.5) {',
    '        if (hitPlanet.x < distToBH) { hdrCol = pCol; bodyOccludesAll = true; }',
    '      } else {',
    '        color.rgb = pCol;',
    '      }',
    '    } else if (hitMoon.x > 0.0) {',
    '      vec3 mCol = shadePlanet3D(ro, rd, hitMoon.x, MOON_POS, 1.0);',
    '      if (hitDisk > 0.5) {',
    '        if (hitMoon.x < tDisk) { hdrCol = mCol; bodyOccludesAll = true; }',
    '        else { color.rgb = mCol * 0.25 + color.rgb; }',
    '      } else if (escaped < 0.5) {',
    '        if (hitMoon.x < distToBH) { hdrCol = mCol; bodyOccludesAll = true; }',
    '      } else {',
    '        color.rgb = mCol;',
    '      }',
    '    }',
    '',
    '    if (!bodyOccludesAll) {',
    '      float eqY = ray.origin.y / max(length(ray.origin), 0.01);',
    '',
    '      float mRing = (minApproach - PHOTON_RING_R) / PHOTON_RING_W;',
    '      float ringBand = exp(-mRing * mRing) * escaped;',
    '      ringBand *= smoothstep(EVENT_HORIZON_RADIUS + 0.18, EVENT_HORIZON_RADIUS + 0.44, minApproach);',
    '      ringBand *= smoothstep(innerDiskRadius + 0.48, innerDiskRadius - 0.10, minApproach);',
    '      ringBand *= smoothstep(3.2, 8.5, length(position));',
    '      float ringTopOnly = smoothstep(-0.22, 0.22, eqY);',
    '      float ringBottomDim = mix(1.0, 0.26, smoothstep(0.08, -0.32, eqY));',
    '      vec3 photonRing = vec3(1.0, 0.96, 0.88) * ringBand * ringTopOnly * ringBottomDim * 2.15;',
    '',
    '      float dCut = smoothstep(0.20, -0.22, eqY) * smoothstep(2.8, 1.15, length(ray.origin));',
    '      color.rgb *= mix(1.0, 0.38, dCut * 0.68);',
    '      photonRing *= (1.0 - dCut * 0.78);',
    '',
    '      /* True 3D Angular Atmospheric Scatter & Anamorphic Equatorial Bloom (keeps shadow core deep obsidian!) */',
    '      vec3 dirToBH = normalize(-ro);',
    '      float bhAlign = max(dot(rd, dirToBH), 0.0);',
    '      float bhHalo = pow(bhAlign, 18.0);',
    '      float upperSpace = smoothstep(-0.12, 0.55, rd.y);',
    '      vec3 cobaltAtmos = vec3(0.030, 0.068, 0.168) * upperSpace * (0.40 + 1.12 * pow(bhAlign, 3.8)) * mix(0.32, 1.0, escaped);',
    '      float eqPlaneBloom = exp(-abs(rd.y - dirToBH.y) * 18.0) * pow(bhAlign, 5.0);',
    '      vec3 warmBloom = vec3(0.98, 0.78, 0.46) * eqPlaneBloom * 0.56 * mix(0.20, 1.0, escaped);',
    '      vec3 radialCorona = vec3(0.95, 0.93, 0.89) * bhHalo * 0.32 * mix(0.10, 1.0, escaped);',
    '',
    '      /* Suppress sky bloom over distant planet/moon disc so they keep clean crisp shading */',
    '      float skyBloomMask = (hitPlanet.x > 0.0 || hitMoon.x > 0.0) ? (0.28 + 0.72 * hitDisk) : 1.0;',
    '      hdrCol = color.rgb + photonRing + (cobaltAtmos + warmBloom + radialCorona) * skyBloomMask;',
    '',
    '      /* 3. Volumetric 3D Atmospheric Rayleigh Halos — ONLY for rays grazing outside the solid core! */',
    '      if (hitPlanet.x <= 0.0) {',
    '        float pHaloMask = (length(PLANET_POS - ro) > distToBH) ? escaped : 1.0;',
    '        hdrCol += computeAtmHalo3D(ro, rd, PLANET_POS, PLANET_R, PLANET_ATM_R) * pHaloMask;',
    '      }',
    '      if (hitMoon.x <= 0.0) {',
    '        float mHaloMask = (length(MOON_POS - ro) > distToBH) ? escaped : 1.0;',
    '        hdrCol += computeAtmHalo3D(ro, rd, MOON_POS, MOON_R, MOON_ATM_R) * 0.38 * mHaloMask;',
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
   * 3. SYNCHRONIZED 3D PERSPECTIVE STARFIELD & COSMIC DUST FIELD (#starCanvas)
   * ═════════════════════════════════════════════════════════════════════════ */
  var STAR_PALETTE = [
    { r: 250, g: 248, b: 243 }, /* #faf8f3 warm alabaster starlight */
    { r: 214, g: 228, b: 252 }, /* #d6e4fc crisp lunar white-blue */
    { r: 226, g: 190, b: 132 }, /* #e2be84 solar champagne gold */
    { r: 155, g: 183, b: 224 }  /* #9bb7e0 atmospheric twilight blue */
  ];

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
        g.addColorStop(0.0, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.44)');
        g.addColorStop(0.42, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.12)');
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
      overlayAlpha: 0.65
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

  /* Project 3D Foreground Cosmic Dust using the EXACT same 3D Orbital Camera as WebGL */
  function render3DDustOverlay(elapsedSec, dtSec) {
    if (!starState || !starState.dust3D) return;
    var ctx = starState.ctx;
    var w = starState.cssW;
    var h = starState.cssH;
    var dpr = starState.dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var cam = getActiveCameraOrientation(elapsedSec);
    var cy = Math.cos(cam.yaw);
    var sy = Math.sin(cam.yaw);
    var cp = Math.cos(cam.pitch);
    var sp = Math.sin(cam.pitch);

    /* Match GLSL bit-for-bit: look_from = rotate_y(yaw) * rotate_x(-pitch) * (0, 0.72, camDist) */
    var y0 = 0.72;
    var z0 = cam.camDist;
    var py1 = y0 * cp + z0 * sp;
    var pz1 = -y0 * sp + z0 * cp;
    var camX = -pz1 * sy;
    var camY = py1;
    var camZ = pz1 * cy;

    var camLen = Math.sqrt(camX * camX + camY * camY + camZ * camZ) || 1.0;
    var fwdX = -camX / camLen;
    var fwdY = -camY / camLen;
    var fwdZ = -camZ / camLen;

    var rollRad = cam.rollDeg * Math.PI / 180.0;
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
    var focal = (h * 0.5 * f.opticalZoom) / Math.tan((f.pov * 0.5) * Math.PI / 180.0);
    var centerX = w * (0.5 + dynFrameX);
    var centerY = h * (0.5 - f.frameY);

    var dust = starState.dust3D;
    var sprites = starState.glowSprites;
    var warpFactor = clamp((currentStarSpeed - 1.0) / 4.2, 0.0, 1.0);

    for (var i = 0; i < dust.length; i++) {
      var pt = dust[i];
      var ang = isReducedMotion ? 0.0 : (elapsedSec * pt.driftSpeed);
      var ca = Math.cos(ang);
      var sa = Math.sin(ang);
      var wx = pt.x * ca - pt.z * sa;
      var wy = pt.y;
      var wz = pt.x * sa + pt.z * ca;

      var dx = wx - camX;
      var dy = wy - camY;
      var dz = wz - camZ;

      var vz = dx * fwdX + dy * fwdY + dz * fwdZ;
      if (vz < 1.8 || vz > 85.0) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      /* 3D Ray-Sphere Occlusion: prevent background dust from bleeding through solid Planet or Moon */
      var distToPt = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
      var rdX = dx / distToPt;
      var rdY = dy / distToPt;
      var rdZ = dz / distToPt;
      var dpx = wx - 10.6;
      var dpy = wy - 0.28;
      var dpz = wz - 13.6;
      if (dpx * dpx + dpy * dpy + dpz * dpz < 60.84 ||
          isOccludedBySphere(camX, camY, camZ, rdX, rdY, rdZ, distToPt, 10.6, 0.28, 13.6, 7.65) ||
          isOccludedBySphere(camX, camY, camZ, rdX, rdY, rdZ, distToPt, -12.2, 4.2, 6.2, 0.88)) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      var vx = dx * rx + dy * ry + dz * rz;
      var vy = dx * ux + dy * uy + dz * uz;

      var sx = centerX + (vx / vz) * focal;
      var sy = centerY - (vy / vz) * focal;

      if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) {
        pt.prevX = null;
        pt.prevY = null;
        continue;
      }

      var depthScale = clamp(18.0 / vz, 0.32, 2.35);
      var nearFade = clamp((vz - 1.8) / 4.5, 0.0, 1.0) * clamp((75.0 - vz) / 28.0, 0.0, 1.0);
      var twinkle = isReducedMotion ? 0.85 : (0.68 + 0.32 * Math.sin(elapsedSec * 1.1 + pt.phase));
      var alpha = clamp(pt.baseAlpha * nearFade * twinkle * (0.85 + 0.35 * warpFactor), 0.02, 0.88);
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
      if (cosmicMode === 'star' || !isHome) {
        starCanvas.style.opacity = '1';
        if (starState) starState.overlayAlpha = 1.0;
      } else {
        var desired = isStargazingMode ? 0.72 : (currentStarSpeed > 2.0 ? 0.82 : 0.34);
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
        var desiredOverlay = isStargazingMode ? 0.74 : (targetStarSpeed > 2.0 ? 0.85 : 0.32);
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
   * 6. PUBLIC WINDOW API (Backward-Compatible + New 3D Orbit Controls)
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

  window.setStargazingState = function (active) {
    isStargazingMode = !!active;
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
