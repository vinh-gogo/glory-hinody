/**
 * Glory Hinody — Nausmind Cosmic Engine (nausmind-cosmos.js)
 * Zero-dependency WebGL1 Relativistic Gargantua Black Hole + DPR 2D Starfield & Nebula
 */
(function () {
  'use strict';

  var D_MIN = 1.6;
  var D_MAX = 28.0;
  var D_STARGAZE = 28.0;
  var STORAGE_KEY = 'nm_cosmic_mode';

  var cameraDistance = D_STARGAZE;
  var cameraZ = mapDistToZ(D_STARGAZE);
  var targetStarSpeed = 1.0;
  var currentStarSpeed = 1.0;
  var cosmicMode = 'star';
  var isHome = false;
  var domReady = false;
  var explicitDistanceSet = false;

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
    return 6.0 + ((D_MAX - clamped) / (D_MAX - D_MIN)) * -14.0;
  }

  function computeFraming(cssW, cssH) {
    var safeH = Math.max(cssH, 1);
    var aspect = cssW / safeH;
    var zoom = 1.0;
    if (aspect < 0.75) {
      zoom = 1.08;
    } else if (aspect < 0.95) {
      zoom = 1.05;
    } else if (aspect > 1.85) {
      zoom = 0.94;
    } else if (aspect > 1.45) {
      zoom = 0.97;
    }
    if (cssW < 640) {
      zoom *= 1.03;
    }
    zoom = clamp(zoom, 0.9, 1.12);
    return {
      pov: 64.0,
      opticalZoom: zoom,
      frameX: 0.0,
      frameY: (aspect < 1.0 ? 0.05 : 0.03) + (40.0 / safeH) * 0.06,
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
   * 1. PROCEDURAL 2048x1024 EQUIRECTANGULAR SKY TEXTURE FOR GARGANTUA LENSING
   * ═════════════════════════════════════════════════════════════════════════ */
  function createProceduralSkyCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#02030c';
    ctx.fillRect(0, 0, width, height);

    /* Subtle galactic plane dust band */
    var bandGrad = ctx.createLinearGradient(0, height * 0.28, 0, height * 0.72);
    bandGrad.addColorStop(0.0, 'rgba(18, 14, 38, 0)');
    bandGrad.addColorStop(0.5, 'rgba(54, 42, 92, 0.065)');
    bandGrad.addColorStop(1.0, 'rgba(18, 14, 38, 0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, width, height);

    /* 5 soft multi-spectral radial nebula clouds (violet, deep blue, warm gold) */
    var nebulae = [
      { x: 0.25, y: 0.70, r: 0.30, c0: 'rgba(80, 40, 130, 0.12)', c1: 'rgba(20, 10, 40, 0)' },
      { x: 0.75, y: 0.30, r: 0.28, c0: 'rgba(120, 60, 40, 0.10)', c1: 'rgba(60, 30, 20, 0)' },
      { x: 0.52, y: 0.46, r: 0.24, c0: 'rgba(42, 58, 132, 0.085)', c1: 'rgba(12, 18, 46, 0)' },
      { x: 0.14, y: 0.34, r: 0.20, c0: 'rgba(105, 82, 165, 0.075)', c1: 'rgba(18, 12, 34, 0)' },
      { x: 0.86, y: 0.66, r: 0.22, c0: 'rgba(200, 169, 110, 0.065)', c1: 'rgba(40, 28, 14, 0)' }
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

    /* ~1600 multi-temperature stars + bright star cross/glow halos */
    for (var s = 0; s < 1600; s++) {
      var sx = Math.random() * width;
      var sy = Math.random() * height;
      var tempRoll = Math.random();
      var rgb = tempRoll < 0.60
        ? '255, 255, 255'
        : (tempRoll < 0.80 ? '200, 210, 255' : '255, 230, 200');

      var isDustStreak = Math.random() < 0.12;
      var alpha = 0.12 + 0.38 * Math.pow(Math.random(), 2.2);

      ctx.fillStyle = 'rgba(' + rgb + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      if (isDustStreak) {
        var rot = Math.random() * Math.PI * 2.0;
        var rx = 1.5 + 5.5 * Math.random();
        var ry = 0.2 + 0.45 * Math.random();
        if (ctx.ellipse) {
          ctx.ellipse(sx, sy, rx, ry, rot, 0, Math.PI * 2.0);
        } else {
          ctx.arc(sx, sy, 0.6, 0, Math.PI * 2.0);
        }
        ctx.fill();
      } else {
        var sr = 0.9 * Math.pow(Math.random(), 5.0) + 0.15;
        ctx.arc(sx, sy, sr, 0, Math.PI * 2.0);
        ctx.fill();

        if (sr > 0.78 && alpha > 0.32) {
          var haloR = sr * 4.2;
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
   * 2. PURE WEBGL1 GARGANTUA RELATIVISTIC RAYMARCHING SHADER
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
    '#define MAX_RAY_STEPS        240',
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
    'const vec3  camera_pos      = vec3(0.0, 0.68, 20.0);',
    'const float PHOTON_RING_R   = 1.48;',
    'const float PHOTON_RING_W   = 0.12;',
    '',
    'const float innerDiskRadius = 2.0;',
    'const float outerDiskRadius = 8.0;',
    'const float diskInnerSoft   = 0.22;',
    'const float diskOuterSoft   = 0.28;',
    '',
    'const float disk_flow       = 10.0;',
    'const float ORBIT_OMEGA_K   = 1.05;',
    'const float INFALL_K        = 0.072;',
    'const float SPIRAL_TIGHT_K  = 1.2;',
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
    '                   rotate_x(pitchAngle) *',
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
    '    ySample *= 1.18;',
    '  }',
    '',
    '  vec2 new_coord = vec2(theta / (2.0 * PI) + 0.5, clamp(ySample * 0.5 + 0.5, 0.001, 0.999));',
    '  vec4 bg = texture2D(uStarTex, new_coord);',
    '',
    '  float bgDim = mix(1.0, 0.14, smoothstep(0.06, -0.32, normY));',
    '  return bg * bgDim;',
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
    '          rotX * 0.62 + infallPhase * 3.6 + spiralTilt * 0.45,',
    '          rotZ * 0.62 + infallPhase * 1.2,',
    '          safeDist * 0.16 + sin(spiralTilt + diskTime * infallV) * 0.11',
    '        );',
    '',
    '        float radialMask = smoothstep(innerDiskRadius - diskInnerSoft, innerDiskRadius + diskInnerSoft, crossingDist)',
    '                         * smoothstep(outerDiskRadius + diskOuterSoft, outerDiskRadius - diskOuterSoft, crossingDist);',
    '',
    '        float disk_intensity = (1.0 - length(crossingPos / vec3(outerDiskRadius, 1.0, outerDiskRadius))) * radialMask;',
    '',
    '        float turbA = fbm3(noiseCoord, 2.6, 1.0, 0.82);',
    '        float c2 = cos(spinAngle * 2.2);',
    '        float s2 = sin(spinAngle * 2.2);',
    '        vec3 noiseCoordFast = vec3(',
    '          diskX * c2 - diskZ * s2,',
    '          diskX * s2 + diskZ * c2,',
    '          safeDist * 0.2 - diskTime * infallV * 1.4',
    '        );',
    '        float turbB = fbm2(noiseCoordFast * 1.75 + vec3(infallPhase * 2.0, 0.0, spinAngle), 2.4, 1.0, 0.75);',
    '        float turbulence = clamp(turbA * 0.58 + turbB * 0.52, 0.0, 1.4);',
    '        float innerRim = smoothstep(innerDiskRadius + 0.65, innerDiskRadius - 0.05, crossingDist);',
    '        float density_variation = mix(0.3, 1.2, turbulence);',
    '        density_variation = mix(density_variation, max(density_variation, 0.88), innerRim * 0.25);',
    '',
    '        disk_intensity *= inversesqrt(safeDist) * density_variation;',
    '        float dpth = step_size * (float(uMaxIterations) / 10.0) * disk_intensity;',
    '',
    '        vec3 orbitTangent = normalize(vec3(-crossingPos.z, 0.0, crossingPos.x));',
    '        float vTan = clamp(dot(velocity / SPEED_OF_LIGHT, orbitTangent), -0.92, 0.92);',
    '        float dopplerShift = sqrt(max(0.0, (1.0 - vTan) / max(1.0e-4, 1.0 + vTan)));',
    '        float beaming = pow(max(dopplerShift, 1.0e-5), 0.28);',
    '',
    '        float belowPlane = smoothstep(0.07, -0.28, crossingPos.y);',
    '        float faceMul = mix(1.0, 0.2, belowPlane);',
    '',
    '        float camR = max(length(camera_pos), innerDiskRadius + 0.5);',
    '        float redshift = sqrt(max(0.0, (1.0 - 2.0 / safeDist) / max(1.0e-4, 1.0 - 2.0 / camR)));',
    '',
    '        vec3 color_rgb = vec3(1.0, 0.65, 0.50) * beaming * redshift * dpth * faceMul;',
    '',
    '        float dRing = (crossingDist - PHOTON_RING_R) / PHOTON_RING_W;',
    '        float rimCore = innerRim * exp(-dRing * dRing);',
    '        color_rgb += vec3(1.0, 0.82, 0.62) * rimCore * beaming * redshift * faceMul * 2.0;',
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
    '      return vec4(0.0, 0.0, 0.0, 1.0);',
    '    }',
    '',
    '    position += rk_delta;',
    '    velocity += d;',
    '  }',
    '',
    '  ray.origin    = vec4(position, 1.0);',
    '  ray.direction = vec4(velocity, 0.0);',
    '  return GetColor(ray);',
    '}',
    '',
    'void main() {',
    '  Ray  ray      = pixelToWorldRay();',
    '  vec3 position = vec3(ray.origin);',
    '  vec3 velocity = SPEED_OF_LIGHT * normalize(vec3(ray.direction));',
    '  float minApproach = 1.0e6;',
    '',
    '  vec4 color = compute(position, velocity, ray, minApproach);',
    '',
    '  float eqY = ray.origin.y / max(length(ray.origin), 0.01);',
    '',
    '  float mRing = (minApproach - PHOTON_RING_R) / PHOTON_RING_W;',
    '  float ringBand = exp(-mRing * mRing);',
    '  ringBand *= smoothstep(EVENT_HORIZON_RADIUS + 0.03, EVENT_HORIZON_RADIUS + 0.22, minApproach);',
    '  ringBand *= smoothstep(innerDiskRadius + 0.4, innerDiskRadius - 0.12, minApproach);',
    '  float ringTopOnly = smoothstep(-0.18, 0.22, eqY);',
    '  float ringBottomDim = mix(1.0, 0.12, smoothstep(0.08, -0.3, eqY));',
    '  vec3 photonRing = vec3(1.0, 0.84, 0.65) * ringBand * ringTopOnly * ringBottomDim * 4.8;',
    '',
    '  float dCut = smoothstep(0.2, -0.22, eqY) * smoothstep(2.8, 1.15, length(ray.origin));',
    '  color.rgb *= mix(1.0, 0.35, dCut * 0.75);',
    '  photonRing *= (1.0 - dCut * 0.9);',
    '',
    '  float glow = 0.01 / max(length(ray.origin), 0.5);',
    '  glow       = clamp(glow, 0.0, 1.0) * 6.0;',
    '',
    '  vec4 finalCol = color + vec4(photonRing + glow, 0.0);',
    '  finalCol.rgb *= uExposure;',
    '  gl_FragColor = clamp(finalCol, 0.0, 1.0);',
    '}'
  ].join('\n');

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[NausmindCosmos] Shader compile warning:', gl.getShaderInfoLog(shader));
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
        console.warn('[NausmindCosmos] Program link warning:', gl.getProgramInfoLog(program));
      }
      gl.deleteProgram(program);
      glFailed = true;
      return null;
    }

    /* Fullscreen clip-space quad */
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

    /* Upload 2048x1024 power-of-two procedural sky texture */
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
    gl.clearColor(2 / 255, 3 / 255, 12 / 255, 1.0);

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
    gl.uniform1f(uniforms.uDiskSpeed, 0.95);
    gl.uniform1f(uniforms.uExposure, 1.08);
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
    var dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.65);

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
    var maxIter = isSmall ? 120 : 220;
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

  function renderBlackHoleFrame(elapsedSec) {
    if (!glState) return;
    var gl = glState.gl;
    var u = glState.uniforms;
    var f = glState.framing;

    var subtleYaw = f.yaw + pointerCurrX * 0.032;
    var subtlePitch = f.pitch + pointerCurrY * 0.020;

    gl.useProgram(glState.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glState.skyTex);
    gl.bindBuffer(gl.ARRAY_BUFFER, glState.vbo);
    gl.enableVertexAttribArray(glState.aPositionLoc);
    gl.vertexAttribPointer(glState.aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(u.uCameraTranslate, subtleYaw, subtlePitch, cameraZ);
    gl.uniform1f(u.uTime, isReducedMotion ? 12.0 : elapsedSec);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * 3. DEEP-SPACE NEBULA & TWINKLING STARFIELD (#starCanvas)
   * ═════════════════════════════════════════════════════════════════════════ */
  var STAR_PALETTE = [
    { r: 255, g: 255, b: 255 }, /* #ffffff pure stellar white */
    { r: 232, g: 228, b: 255 }, /* #e8e4ff soft cosmic lavender-white */
    { r: 200, g: 169, b: 110 }, /* #c8a96e signature Nausmind warm gold */
    { r: 182, g: 204, b: 255 }  /* #b6ccff hot B-type blue-white */
  ];

  function createStarItem(w, h) {
    var depth = 0.3 + Math.random() * 0.7;
    var colorRoll = Math.random();
    var colorIdx = colorRoll < 0.50 ? 0 : (colorRoll < 0.74 ? 1 : (colorRoll < 0.88 ? 3 : 2));
    var col = STAR_PALETTE[colorIdx];
    var isBright = depth > 0.82 && Math.random() < 0.24;
    var radius = isBright
      ? (1.15 + Math.random() * 0.85)
      : (0.42 + depth * 0.78 * Math.random());

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z: depth,
      r: radius,
      col: col,
      baseAlpha: isBright ? (0.72 + Math.random() * 0.26) : (0.22 + depth * 0.52),
      phase: Math.random() * Math.PI * 2.0,
      freq: 0.55 + Math.random() * 1.65,
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
    var count = w <= 768 ? 190 : 260;
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
      meteor: null,
      nextMeteorSec: 7.5 + Math.random() * 6.5,
      overlayAlpha: 0.0
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

    var targetCount = cssW <= 768 ? 190 : 260;
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
    needsStaticRender = true;
  }

  function spawnMeteor(w, h) {
    var angle = (Math.PI * 0.68) + (Math.random() * 0.20);
    var speed = 560 + Math.random() * 280;
    return {
      x: w * (0.25 + Math.random() * 0.65),
      y: h * (0.04 + Math.random() * 0.34),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.55,
      len: 75 + Math.random() * 65,
      life: 0.0,
      maxLife: 0.65 + Math.random() * 0.30
    };
  }

  function renderStarfieldFrame(elapsedSec, dtSec, isOverlayOnBlackHole) {
    if (!starState) return;
    var ctx = starState.ctx;
    var w = starState.cssW;
    var h = starState.cssH;
    var dpr = starState.dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (isOverlayOnBlackHole) {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#02030c';
      ctx.fillRect(0, 0, w, h);

      /* Slowly drifting multi-layered cosmic nebula washes */
      var driftT = isReducedMotion ? 0.0 : elapsedSec * 0.055;
      var neb1X = w * (0.24 + 0.04 * Math.sin(driftT));
      var neb1Y = h * (0.30 + 0.04 * Math.cos(driftT * 0.8));
      var g1 = ctx.createRadialGradient(neb1X, neb1Y, 0, neb1X, neb1Y, Math.max(w, h) * 0.52);
      g1.addColorStop(0.0, 'rgba(91, 61, 158, 0.11)');
      g1.addColorStop(0.55, 'rgba(54, 34, 102, 0.045)');
      g1.addColorStop(1.0, 'rgba(2, 3, 12, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      var neb2X = w * (0.76 + 0.04 * Math.cos(driftT * 0.7));
      var neb2Y = h * (0.68 + 0.04 * Math.sin(driftT * 0.9));
      var g2 = ctx.createRadialGradient(neb2X, neb2Y, 0, neb2X, neb2Y, Math.max(w, h) * 0.50);
      g2.addColorStop(0.0, 'rgba(38, 52, 120, 0.10)');
      g2.addColorStop(0.55, 'rgba(20, 30, 78, 0.04)');
      g2.addColorStop(1.0, 'rgba(2, 3, 12, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      var neb3X = w * (0.52 + 0.03 * Math.sin(driftT * 0.5 + 1.2));
      var neb3Y = h * (0.48 + 0.03 * Math.cos(driftT * 0.6 + 0.6));
      var g3 = ctx.createRadialGradient(neb3X, neb3Y, 0, neb3X, neb3Y, Math.max(w, h) * 0.42);
      g3.addColorStop(0.0, 'rgba(200, 169, 110, 0.05)');
      g3.addColorStop(1.0, 'rgba(2, 3, 12, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);
    }

    var speed = isReducedMotion ? 0.0 : currentStarSpeed;
    var warpFactor = clamp((speed - 1.0) / 4.5, 0.0, 1.0);
    var stars = starState.stars;
    var cx = w * 0.5;
    var cy = h * 0.5;

    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];

      if (!isReducedMotion && dtSec > 0) {
        var baseVy = -11.0 * st.z;
        var baseVx = 2.4 * st.z;
        var rx = (st.x - cx) / Math.max(w * 0.5, 1);
        var ry = (st.y - cy) / Math.max(h * 0.5, 1);
        var warpVx = rx * 145.0 * st.z * warpFactor;
        var warpVy = (-185.0 + ry * 95.0) * st.z * warpFactor;

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
        : (0.62 + 0.38 * Math.sin(elapsedSec * st.freq + st.phase));
      var alpha = clamp(st.baseAlpha * twinkle + warpFactor * 0.18, 0.05, 1.0);
      var colStr = st.col.r + ', ' + st.col.g + ', ' + st.col.b;

      if (warpFactor > 0.04 && !isReducedMotion) {
        var dirX = ((st.x - cx) / Math.max(w * 0.5, 1)) * 0.42;
        var dirY = -1.0 + ((st.y - cy) / Math.max(h * 0.5, 1)) * 0.32;
        var trailLen = (4.0 + 34.0 * warpFactor) * st.z;
        var tailX = st.x - dirX * trailLen;
        var tailY = st.y - dirY * trailLen;

        var trailGrad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        trailGrad.addColorStop(0.0, 'rgba(' + colStr + ', ' + alpha.toFixed(3) + ')');
        trailGrad.addColorStop(1.0, 'rgba(' + colStr + ', 0)');
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = Math.max(0.8, st.r * 1.15);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      if (st.halo && warpFactor < 0.35) {
        var hr = st.r * 4.5;
        var hGrad = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, hr);
        hGrad.addColorStop(0.0, 'rgba(' + colStr + ', ' + (alpha * 0.34).toFixed(3) + ')');
        hGrad.addColorStop(1.0, 'rgba(' + colStr + ', 0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(st.x, st.y, hr, 0, Math.PI * 2.0);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(' + colStr + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2.0);
      ctx.fill();
    }

    /* Subtle shooting star every ~9-15 seconds */
    if (!isReducedMotion && !isOverlayOnBlackHole) {
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
          starState.nextMeteorSec = elapsedSec + 9.0 + Math.random() * 6.5;
        } else {
          var mAlpha = Math.sin(prog * Math.PI) * 0.68;
          var norm = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1.0;
          var mxTail = m.x - (m.vx / norm) * m.len;
          var myTail = m.y - (m.vy / norm) * m.len;
          var mGrad = ctx.createLinearGradient(m.x, m.y, mxTail, myTail);
          mGrad.addColorStop(0.0, 'rgba(255, 250, 240, ' + mAlpha.toFixed(3) + ')');
          mGrad.addColorStop(0.4, 'rgba(200, 169, 110, ' + (mAlpha * 0.45).toFixed(3) + ')');
          mGrad.addColorStop(1.0, 'rgba(139, 124, 246, 0)');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 1.25;
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
        label.textContent = isBH ? 'GARGANTUA' : 'STARFIELD';
      } else {
        btn.textContent = isBH ? 'GARGANTUA' : 'STARFIELD';
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

    if (!isHome || (window.innerWidth || 1280) <= 768 || !bhContainer) {
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
      if (cosmicMode === 'star' || !isHome) {
        starCanvas.style.display = 'block';
        starCanvas.style.opacity = '1';
        if (starState) starState.overlayAlpha = 1.0;
      } else {
        starCanvas.style.display = 'block';
        var warpOpacity = currentStarSpeed > 2.0 ? 0.55 : 0.0;
        starCanvas.style.opacity = String(warpOpacity);
        if (starState) starState.overlayAlpha = warpOpacity;
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
   * 5. MASTER ANIMATION LOOP
   * ═════════════════════════════════════════════════════════════════════════ */
  function tick() {
    rafId = 0;
    if (isPaused) return;

    var now = nowMs();
    var dtSec = clamp((now - lastTickMs) / 1000.0, 0.0, 0.065);
    lastTickMs = now;
    var elapsedSec = (now - startTimeMs) / 1000.0;

    pointerCurrX += (pointerTargetX - pointerCurrX) * 0.06;
    pointerCurrY += (pointerTargetY - pointerCurrY) * 0.06;
    currentStarSpeed += (targetStarSpeed - currentStarSpeed) * 0.075;

    var speedSettled = Math.abs(targetStarSpeed - currentStarSpeed) < 0.01;
    if (speedSettled) currentStarSpeed = targetStarSpeed;

    if (cosmicMode === 'blackhole' && isHome) {
      if (!isReducedMotion || needsStaticRender) {
        renderBlackHoleFrame(elapsedSec);
      }

      if (starState && starCanvas) {
        var desiredOverlay = targetStarSpeed > 2.0 ? 0.55 : 0.0;
        starState.overlayAlpha += (desiredOverlay - starState.overlayAlpha) * 0.08;
        if (Math.abs(desiredOverlay - starState.overlayAlpha) < 0.008) {
          starState.overlayAlpha = desiredOverlay;
        }
        starCanvas.style.opacity = starState.overlayAlpha.toFixed(3);
        if (starState.overlayAlpha > 0.012 && (!isReducedMotion || needsStaticRender)) {
          renderStarfieldFrame(elapsedSec, dtSec, true);
        }
      }
    } else if (starState) {
      if (!isReducedMotion || needsStaticRender) {
        renderStarfieldFrame(elapsedSec, dtSec, false);
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
   * 6. PUBLIC WINDOW API
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

    if (isHome) {
      var w = window.innerWidth || 1280;
      if (w <= 768 && cosmicMode === 'blackhole') {
        applyCosmicMode('star', false);
      } else if (w > 768 && cosmicMode === 'star' && getSavedMode() !== 'star' && !glFailed) {
        applyCosmicMode('blackhole', false);
      }
    }
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
    var canUseBlackHole = isHome && !!bhContainer && (window.innerWidth || 1280) > 768 && saved !== 'star';
    applyCosmicMode(canUseBlackHole ? 'blackhole' : 'star', false);

    /* Wire cosmic mode toggle button(s) */
    document.addEventListener('click', function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('[data-cosmic-toggle]') : null;
      if (!target) return;
      ev.preventDefault();
      var nextMode = cosmicMode === 'blackhole' ? 'star' : 'blackhole';
      applyCosmicMode(nextMode, true);
    });

    /* Subtle desktop pointer tracking for Gargantua camera parallax */
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
