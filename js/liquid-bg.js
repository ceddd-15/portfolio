/**
 * Procedural Liquid Obsidian & Violet-Chrome Silk Fold Renderer
 * Hardware-accelerated WebGL fragment shader modeled after flowing metallic
 * purple-chrome silk folds, with an automatic HTML5 Canvas 2D fluid fallback.
 */

const VERTEX_SHADER_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;

  // Smooth value noise for organic silk fabric undulations
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Flowing diagonal silk-fold heightfield modeled after liquid chrome drapery
  float silkHeight(vec2 p, float t) {
    // Rotate coordinate space for dramatic sweeping diagonal drapery
    float cs = 0.82;
    float sn = 0.57;
    vec2 q = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);

    // Subtle cursor ripple warp
    vec2 m = (uMouse * 2.0 - 1.0) * vec2(1.2, -1.0);
    float mDist = length(p - m * 0.65);
    q += normalize(p - m * 0.65 + 0.001) * 0.075 * exp(-mDist * 2.4);

    // Multi-stage domain warp creating folded satin S-curves & pinched creases
    vec2 w = vec2(
      sin(q.y * 1.85 + t * 0.22) * 0.55 + cos(q.x * 1.15 - t * 0.17) * 0.32,
      cos(q.x * 1.65 - t * 0.19) * 0.48 + sin((q.x + q.y) * 1.35 + t * 0.14) * 0.26
    );
    vec2 w2 = vec2(
      noise(q * 1.35 + w * 0.65 + vec2(t * 0.06, -t * 0.05)),
      noise(q * 1.35 - w * 0.55 + vec2(-t * 0.05, t * 0.07))
    );
    vec2 warped = q + w * 0.58 + (w2 - 0.5) * 0.52;

    // Deep curved silk valleys + sharp nested metallic pleats
    float foldA = sin(warped.y * 2.95 + sin(warped.x * 1.75 - t * 0.21) * 1.45 + t * 0.12);
    float foldB = sin(warped.y * 5.6 - warped.x * 1.55 + cos(warped.y * 2.4 + t * 0.16) * 1.2);
    float crease = 1.0 - abs(sin(warped.y * 2.35 + warped.x * 0.75 + foldA * 0.65));
    crease = pow(crease, 2.2) * 2.0 - 1.0;

    return foldA * 0.48 + foldB * 0.22 + crease * 0.36;
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (vUv * 2.0 - 1.0) * aspect;
    float t = uTime;

    // High-precision finite-difference normal for crisp liquid-chrome specular bands
    float eps = 0.0065;
    float hC = silkHeight(p, t);
    float hX = silkHeight(p + vec2(eps, 0.0), t);
    float hY = silkHeight(p + vec2(0.0, eps), t);

    vec3 N = normalize(vec3((hC - hX) / eps * 0.46, (hC - hY) / eps * 0.46, 1.0));
    vec3 V = normalize(vec3(0.0, 0.0, 1.0));
    vec3 R = reflect(-V, N);

    // Cursor-reactive studio key light + opposing chrome rim reflections
    vec2 mouseOffset = (uMouse - 0.5) * 1.1;
    vec3 L1 = normalize(vec3(-0.36 + mouseOffset.x * 0.7, 0.68 - mouseOffset.y * 0.65, 0.72));
    vec3 L2 = normalize(vec3(0.72 - mouseOffset.x * 0.35, -0.52 + mouseOffset.y * 0.35, 0.56));
    vec3 L3 = normalize(vec3(-0.82, -0.28, 0.48));

    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    vec3 H3 = normalize(L3 + V);

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.35);

    // Studio softbox environment band reflection (creates glossy liquid-metal streaks)
    float envRibbon1 = exp(-pow((R.y * 1.35 + R.x * 0.55 - 0.32 + mouseOffset.y * 0.25) * 4.8, 2.0));
    float envRibbon2 = exp(-pow((R.y * 1.1 - R.x * 0.82 + 0.58 - mouseOffset.x * 0.22) * 5.6, 2.0));
    float envCore    = pow(envRibbon1, 3.2) + pow(envRibbon2, 3.6) * 0.78;

    // Tight Blinn-Phong chrome highlights
    float specMid1   = pow(max(dot(N, H1), 0.0), 18.0);
    float specSharp1 = pow(max(dot(N, H1), 0.0), 110.0);
    float specMid2   = pow(max(dot(N, H2), 0.0), 22.0);
    float specSharp2 = pow(max(dot(N, H2), 0.0), 96.0);
    float specRim3   = pow(max(dot(N, H3), 0.0), 34.0);

    // Exact reference color ramp: void black -> deep velvet -> #5b21b6 -> #9333ea -> #e9d5ff -> #ffffff
    vec3 voidBlack    = vec3(0.019, 0.018, 0.028); // #050507
    vec3 velvetAbyss  = vec3(0.082, 0.024, 0.165);
    vec3 midViolet    = vec3(0.357, 0.129, 0.714); // #5b21b6
    vec3 electricPurp = vec3(0.576, 0.200, 0.918); // #9333ea
    vec3 lavenderSpec = vec3(0.914, 0.835, 1.000); // #e9d5ff
    vec3 chromeWhite  = vec3(1.000, 0.996, 1.000); // #ffffff

    float valleyMask = smoothstep(-0.78, 0.32, hC);
    vec3 col = mix(voidBlack, velvetAbyss, valleyMask * 0.58);

    // Rich electric purple satin sheen along fold walls
    col += midViolet * (envRibbon1 * 0.62 + envRibbon2 * 0.48 + specMid1 * 0.65 + fresnel * 0.52);
    col += electricPurp * (specMid1 * 0.55 + specMid2 * 0.45 + specRim3 * 0.48 + envRibbon1 * fresnel * 0.55);

    // Crisp lavender-white & pure white metallic chrome highlights along silk crests
    col += lavenderSpec * (envCore * 0.72 + specSharp1 * 0.9 + specSharp2 * 0.68);
    col += chromeWhite * (pow(envCore, 1.8) * 0.62 + pow(specSharp1, 1.8) * 0.85 + pow(specSharp2, 2.0) * 0.5);

    // Deep velvet-black troughs between folds for high-contrast metallic sheen
    col *= mix(0.22, 1.0, smoothstep(-0.92, 0.08, hC));

    // Gentle framing vignette
    float vig = 1.0 - smoothstep(0.7, 1.85, length(p * vec2(0.72, 0.88)));
    col *= mix(0.58, 1.0, vig);

    // Filmic highlight roll-off keeping crisp specular whites
    col = col / (col + vec3(0.54)) * 1.28;
    col = clamp(col, voidBlack, chromeWhite);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function startWebGLRenderer(canvas, prefersReducedMotion) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'uResolution');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uMouse = gl.getUniformLocation(program, 'uMouse');

  const mouse = { x: 0.35, y: 0.32, targetX: 0.35, targetY: 0.32 };
  let rafId = null;
  let running = true;
  const startTime = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uResolution, width, height);
  }

  function onPointerMove(e) {
    mouse.targetX = e.clientX / Math.max(window.innerWidth, 1);
    mouse.targetY = e.clientY / Math.max(window.innerHeight, 1);
  }

  function renderFrame(now) {
    if (!running) return;
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const elapsed = prefersReducedMotion ? 1.8 : (now - startTime) * 0.001;
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    startCanvas2DFallback(canvas, prefersReducedMotion);
  });

  renderFrame(performance.now());
  return { mode: 'webgl' };
}

/**
 * HTML5 Canvas 2D Fluid Silk Fold Fallback
 * Renders diagonal metallic purple-chrome silk ribbons if WebGL is unavailable.
 */
function startCanvas2DFallback(canvas, prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let width = 0;
  let height = 0;
  const mouse = { x: 0.4, y: 0.35, targetX: 0.4, targetY: 0.35 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.targetX = e.clientX / Math.max(window.innerWidth, 1);
      mouse.targetY = e.clientY / Math.max(window.innerHeight, 1);
    },
    { passive: true }
  );

  resize();

  let t = 0;
  function draw() {
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    if (!prefersReducedMotion) t += 0.008;

    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, width, height);

    const bands = 7;
    for (let i = 0; i < bands; i++) {
      const ratio = i / (bands - 1);
      const baseY = height * (ratio * 1.15 - 0.08);
      const waveAmp = height * (0.09 + 0.03 * Math.sin(t + i));

      ctx.beginPath();
      ctx.moveTo(-40, baseY - 60);
      for (let x = -40; x <= width + 60; x += 48) {
        const nx = x / Math.max(width, 1);
        const y =
          baseY +
          nx * height * 0.24 +
          Math.sin(nx * 4.2 + t * 0.9 + i * 1.1) * waveAmp +
          Math.cos(nx * 2.5 - t * 0.7 + mouse.x * 2.0) * (waveAmp * 0.45);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width + 60, height + 80);
      ctx.lineTo(-40, height + 80);
      ctx.closePath();

      const specX = width * (0.2 + mouse.x * 0.55);
      const grad = ctx.createLinearGradient(specX - 240, baseY - 120, specX + 260, baseY + 240);
      grad.addColorStop(0, '#050507');
      grad.addColorStop(0.28, '#2e1065');
      grad.addColorStop(0.45, '#5b21b6');
      grad.addColorStop(0.54, '#9333ea');
      grad.addColorStop(0.61, '#e9d5ff');
      grad.addColorStop(0.67, '#ffffff');
      grad.addColorStop(0.75, '#5b21b6');
      grad.addColorStop(1, '#050507');

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  draw();
  return { mode: 'canvas2d' };
}

export function initLiquidBackground(canvasId = 'liquid-bg-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    startWebGLRenderer(canvas, prefersReducedMotion) ||
    startCanvas2DFallback(canvas, prefersReducedMotion)
  );
}
