<template>
  <canvas ref="canvasRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref<HTMLCanvasElement>();

let gl: WebGLRenderingContext | null = null;
let animId = 0;
let W = 0;
let H = 0;
let dropTex: WebGLTexture;
let uRes: WebGLUniformLocation;
let frame = 0;
let spawnAcc = 0;

// Offscreen canvas for drop heightmap
let dropCanvas: HTMLCanvasElement;
let dCtx: CanvasRenderingContext2D;

// ---- Drop Simulation ----
type DropType = "static" | "slow" | "medium";

const CONFIGS: Record<DropType, { r: [number, number]; g: number | [number, number]; ms: number | [number, number]; stick: number; life: [number, number] }> = {
  static: { r: [0.8, 2.5], g: 0, ms: 0, stick: 1, life: [4000, 10000] },
  slow: { r: [1.5, 4], g: [0.002, 0.006], ms: [0.2, 0.5], stick: 0.025, life: [2000, 6000] },
  medium: { r: [3, 6], g: [0.008, 0.02], ms: [0.8, 2], stick: 0.01, life: [1000, 4000] },
};

function rr(range: [number, number]) {
  return range[0] + Math.random() * (range[1] - range[0]);
}

class Drop {
  type!: DropType;
  alive = true;
  age = 0;
  radius = 0;
  x = 0;
  y = 0;
  gravity = 0;
  maxSpeed = 0;
  stickChance = 0;
  maxLife = 0;
  vy = 0;
  vx = 0;
  stuck = false;
  stuckTimer = 0;
  wobble = Math.random() * Math.PI * 2;
  trail: { x: number; y: number; r: number }[] = [];
  lastTrailY = 0;

  constructor(type?: DropType, onScreen = false) {
    this.init(type || Drop.pickType(), onScreen);
  }

  static pickType(): DropType {
    const r = Math.random();
    if (r < 0.4) return "static";
    if (r < 0.8) return "slow";
    return "medium";
  }

  init(type: DropType, onScreen: boolean) {
    this.type = type;
    this.alive = true;
    this.age = 0;
    this.trail = [];

    const cfg = CONFIGS[type];
    this.radius = rr(cfg.r);
    this.x = Math.random() * W;
    this.y = onScreen ? Math.random() * H : -10 - Math.random() * 60;

    if (typeof cfg.g === "number") {
      this.gravity = 0;
      this.maxSpeed = 0;
    } else {
      this.gravity = rr(cfg.g);
      this.maxSpeed = rr(cfg.ms as [number, number]);
    }

    this.stickChance = cfg.stick;
    this.maxLife = rr(cfg.life);
    this.vy = 0;
    this.vx = 0;
    this.stuck = type === "static" || Math.random() < 0.5;
    this.stuckTimer = type === "static" ? 999999 : 60 + Math.random() * 300;
    this.lastTrailY = this.y;
  }

  update(allDrops: Drop[]) {
    this.age++;
    this.wobble += 0.015 + Math.abs(this.vy) * 0.05;

    if (this.age > this.maxLife || this.y > H + 30) {
      this.alive = false;
      return;
    }

    if (this.stuck) {
      this.stuckTimer--;
      this.vy *= 0.7;
      this.vx *= 0.8;
      if (this.stuckTimer <= 0 && this.type !== "static") this.stuck = false;
      this.mergeCheck(allDrops);
      return;
    }

    this.vy += this.gravity;
    const tension = Math.max(0, 0.005 / this.radius);
    this.vy = Math.max(0, this.vy - tension);
    this.vy = Math.min(this.vy, this.maxSpeed);

    this.vx += Math.sin(this.wobble) * (0.003 + this.radius * 0.001);
    this.vx *= 0.93;

    if (this.vy > 0.02 && this.vy < this.maxSpeed * 0.6 && Math.random() < this.stickChance) {
      this.stuck = true;
      this.stuckTimer = 30 + Math.random() * 200;
      this.vy = 0;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.y - this.lastTrailY > 2) {
      this.trail.push({ x: this.x, y: this.y, r: this.radius * 0.25 });
      this.lastTrailY = this.y;
      if (this.trail.length > 100) this.trail.shift();
    }

    this.mergeCheck(allDrops);
  }

  mergeCheck(allDrops: Drop[]) {
    for (const o of allDrops) {
      if (o === this || !o.alive) continue;
      const dx = this.x - o.x;
      const dy = this.y - o.y;
      const dist = dx * dx + dy * dy;
      const touch = (this.radius + o.radius) * 0.7;
      if (dist < touch * touch && this.radius >= o.radius) {
        const area = this.radius * this.radius + o.radius * o.radius;
        this.radius = Math.min(Math.sqrt(area), 12);
        this.gravity = Math.min(0.03, 0.003 + this.radius * 0.003);
        this.maxSpeed = Math.min(3, 0.2 + this.radius * 0.25);
        this.vy = Math.max(this.vy, o.vy * 0.5) + 0.02;
        this.stuck = false;
        this.stuckTimer = 0;
        this.trail.push(...o.trail);
        o.alive = false;
        if (this.radius > 5) {
          this.type = "medium";
          this.stickChance = 0.008;
        } else if (this.radius > 3) {
          this.type = "slow";
          this.stickChance = 0.02;
        }
      }
    }
  }
}

let drops: Drop[] = [];

// ---- WebGL Shaders ----
const vsSource = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = vec2(aPos.x * 0.5 + 0.5, 1.0 - (aPos.y * 0.5 + 0.5));
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uDrops;
  uniform vec2 uRes;

  void main() {
    vec2 uv = vUv;
    float h = texture2D(uDrops, uv).r;

    if (h < 0.005) {
      discard;
    }

    // Normals from heightmap via finite differences
    float texel = 1.0 / uRes.x;
    float hL = texture2D(uDrops, uv - vec2(texel, 0.0)).r;
    float hR = texture2D(uDrops, uv + vec2(texel, 0.0)).r;
    float hU = texture2D(uDrops, uv - vec2(0.0, texel)).r;
    float hD = texture2D(uDrops, uv + vec2(0.0, texel)).r;
    vec2 normal = vec2(hL - hR, hU - hD);

    vec3 n3 = normalize(vec3(normal * 4.0, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 lightDir = normalize(vec3(-0.4, -0.6, 1.0));
    vec3 halfVec = normalize(lightDir + viewDir);

    // Specular highlight
    float spec = pow(max(dot(n3, halfVec), 0.0), 64.0);

    // Fresnel rim
    float fresnel = pow(1.0 - max(dot(n3, viewDir), 0.0), 3.0);

    // Environment reflection
    float envReflect = pow(max(dot(reflect(-viewDir, n3), lightDir), 0.0), 16.0);

    // Body: subtle darkening where drop is
    float bodyAlpha = smoothstep(0.005, 0.1, h) * 0.06;

    // Premultiplied alpha output
    vec3 color = vec3(0.0);
    float alpha = bodyAlpha;

    // Specular (bright white)
    color += spec * 0.65 * vec3(1.0);
    alpha += spec * 0.65;

    // Fresnel rim (bluish tint)
    float fresnelAmt = fresnel * h * 0.25;
    color += fresnelAmt * vec3(0.8, 0.9, 1.0);
    alpha += fresnelAmt;

    // Env reflection
    float envAmt = envReflect * h * 0.12;
    color += envAmt;
    alpha += envAmt;

    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

// ---- WebGL Setup ----
function compileShader(src: string, type: number): WebGLShader | null {
  if (!gl) return null;
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function initWebGL(canvas: HTMLCanvasElement) {
  gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const vs = compileShader(vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Fullscreen quad
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  uRes = gl.getUniformLocation(prog, "uRes")!;

  // Drop heightmap texture
  dropTex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, dropTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(prog, "uDrops"), 0);
}

// ---- Draw drops as heightmap on 2D canvas ----
function drawDropHeightmap() {
  dCtx.clearRect(0, 0, W, H);

  for (const d of drops) {
    if (!d.alive) continue;

    // Trail
    for (let i = 0; i < d.trail.length; i++) {
      const t = d.trail[i];
      const fade = i / d.trail.length;
      const brightness = Math.floor(15 + fade * 25);
      dCtx.beginPath();
      dCtx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      dCtx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
      dCtx.fill();
    }

    // Main drop with dome-shaped radial gradient
    const r = d.radius;
    const speed = Math.abs(d.vy);
    const stretch = 1 + Math.min(speed * 0.06, 0.3);
    const squash = 1 / Math.sqrt(stretch);

    dCtx.save();
    dCtx.translate(d.x, d.y);
    dCtx.scale(squash, stretch);

    const grad = dCtx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, "rgb(200,200,200)");
    grad.addColorStop(0.5, "rgb(140,140,140)");
    grad.addColorStop(0.75, "rgb(70,70,70)");
    grad.addColorStop(1, "rgb(0,0,0)");
    dCtx.beginPath();
    dCtx.arc(0, 0, r, 0, Math.PI * 2);
    dCtx.fillStyle = grad;
    dCtx.fill();

    dCtx.restore();
  }

  // Blur heightmap for smoother normals
  dCtx.filter = "blur(1.5px)";
  dCtx.drawImage(dropCanvas, 0, 0);
  dCtx.filter = "none";
}

// ---- Resize ----
function resize() {
  const canvas = canvasRef.value;
  if (!canvas || !gl) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  dropCanvas.width = W;
  dropCanvas.height = H;

  gl.viewport(0, 0, canvas.width, canvas.height);
}

// ---- Animation Loop ----
function animate() {
  if (!gl) return;
  frame++;

  // Spawn ~1 drop every 2-3 seconds at 60fps
  spawnAcc += 0.006;
  while (spawnAcc >= 1 && drops.length < 15) {
    spawnAcc -= 1;
    drops.push(new Drop());
  }

  for (const d of drops) d.update(drops);
  drops = drops.filter((d) => d.alive);

  drawDropHeightmap();

  // Upload heightmap to GPU
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, dropTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dropCanvas);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(uRes, W, H);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  animId = requestAnimationFrame(animate);
}

// ---- Lifecycle ----
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  dropCanvas = document.createElement("canvas");
  dCtx = dropCanvas.getContext("2d")!;

  initWebGL(canvas);
  resize();

  // Pre-populate with a few static drops
  for (let i = 0; i < 5; i++) {
    drops.push(new Drop("static", true));
  }

  window.addEventListener("resize", resize);
  animId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", resize);
  gl = null;
  drops = [];
});
</script>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}
</style>
