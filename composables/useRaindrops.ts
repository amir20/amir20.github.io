interface Drop {
  x: number;
  y: number;
  r: number;
  momentum: number;
  momentumX: number;
  spreadX: number;
  spreadY: number;
  lastSpawn: number;
  nextSpawn: number;
  killed: boolean;
  shrink: number;
  isNew: boolean;
}

const MIN_R = 8;
const MAX_R = 35;
const DELTA_R = MAX_R - MIN_R;
const MAX_DROPS = 60;
const RAIN_CHANCE = 0.3;
const RAIN_LIMIT = 3;
const TRAIL_RATE = 1;
const TRAIL_SCALE_MIN = 0.2;
const TRAIL_SCALE_MAX = 0.5;
const COLLISION_RADIUS = 0.65;
const COLLISION_RADIUS_INCREASE = 0.01;
const DROP_FALL_MULTIPLIER = 1;
const DRIZZLE = 40;
const DRIZZLE_SIZE_MIN = 1.5;
const DRIZZLE_SIZE_MAX = 3;
const SPAWN_AREA_MIN = -0.1;
const SPAWN_AREA_MAX = 0.95;
const GLOBAL_TIME_SCALE = 1;

function random(min?: number | null, max?: number | null, transform?: (v: number) => number): number {
  if (min == null) {
    min = 0;
    max = 1;
  } else if (max == null) {
    max = min;
    min = 0;
  }
  const range = max - min;
  const t = transform ?? ((v: number) => v);
  return min + t(Math.random()) * range;
}

function chance(c: number): boolean {
  return random() <= c;
}

function createDrop(width: number, height: number, opts?: Partial<Drop>): Drop {
  return {
    x: random(width),
    y: random(height * SPAWN_AREA_MIN, height * SPAWN_AREA_MAX),
    r: random(MIN_R, MAX_R, (t) => t * t * t),
    momentum: 0,
    momentumX: 0,
    spreadX: 0,
    spreadY: 0,
    lastSpawn: 0,
    nextSpawn: 0,
    killed: false,
    shrink: 0,
    isNew: true,
    ...opts,
  };
}

export function useRaindrops() {
  let canvas = document.getElementById("raindrop-overlay") as HTMLCanvasElement | null;
  if (canvas) return;

  canvas = document.createElement("canvas");
  canvas.id = "raindrop-overlay";
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9998;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  // Drizzle texture canvas — accumulates tiny background droplets
  const texCanvas = document.createElement("canvas");
  const texCtx = texCanvas.getContext("2d")!;

  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas!.width = width;
    canvas!.height = height;
    texCanvas.width = width;
    texCanvas.height = height;
  }

  resize();
  window.addEventListener("resize", resize);

  let drops: Drop[] = [];
  let lastRender: number | null = null;
  const areaMultiplier = () => (width * height) / 786432;

  // Pre-render drop sprite for performance
  const dropSprite = document.createElement("canvas");
  const spriteSize = 64;
  dropSprite.width = spriteSize;
  dropSprite.height = spriteSize;
  const spriteCtx = dropSprite.getContext("2d")!;

  function renderDropSprite(alpha: number) {
    spriteCtx.clearRect(0, 0, spriteSize, spriteSize);
    const cx = spriteSize / 2;
    const cy = spriteSize / 2;
    const r = spriteSize / 2;

    // Outer glow/body
    const grad = spriteCtx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(255, 255, 255, ${0.7 * alpha})`);
    grad.addColorStop(0.3, `rgba(255, 255, 255, ${0.3 * alpha})`);
    grad.addColorStop(0.65, `rgba(255, 255, 255, ${0.08 * alpha})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    spriteCtx.fillStyle = grad;
    spriteCtx.beginPath();
    spriteCtx.arc(cx, cy, r, 0, Math.PI * 2);
    spriteCtx.fill();

    // Rim highlight
    spriteCtx.beginPath();
    spriteCtx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    spriteCtx.strokeStyle = `rgba(255, 255, 255, ${0.15 * alpha})`;
    spriteCtx.lineWidth = 1;
    spriteCtx.stroke();

    // Specular highlight
    spriteCtx.beginPath();
    spriteCtx.ellipse(cx - r * 0.25, cy - r * 0.3, r * 0.18, r * 0.1, -0.5, 0, Math.PI * 2);
    spriteCtx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
    spriteCtx.fill();
  }

  renderDropSprite(1);

  function drawDrop(drop: Drop) {
    const { x, y, r, spreadX, spreadY } = drop;
    // Alpha varies with size — larger drops are more visible
    const alpha = Math.max(0, Math.min(1, ((r - MIN_R) / DELTA_R) * 0.9));
    const adjustedAlpha = alpha * (1 / (0.5 * (spreadX + spreadY) + 1));
    if (adjustedAlpha < 0.01) return;

    ctx.globalAlpha = adjustedAlpha;
    ctx.globalCompositeOperation = "source-over";

    const drawW = 2 * r * (spreadX + 1);
    const drawH = 2 * r * 1.5 * (spreadY + 1);

    ctx.drawImage(dropSprite, x - drawW / 2, y - drawH * 0.55, drawW, drawH);

    ctx.globalAlpha = 1;
  }

  function drawTextureDrop(x: number, y: number, r: number) {
    // Small drizzle dot on the texture layer
    const grad = texCtx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    texCtx.fillStyle = grad;
    texCtx.beginPath();
    texCtx.arc(x, y, r, 0, Math.PI * 2);
    texCtx.fill();
  }

  function paintClear(x: number, y: number, r: number) {
    // Clear area around moving drop on drizzle texture (like wiping the glass)
    const clearR = r * 0.45;
    texCtx.globalCompositeOperation = "destination-out";
    texCtx.beginPath();
    texCtx.arc(x, y, clearR, 0, Math.PI * 2);
    texCtx.fillStyle = "rgba(0,0,0,1)";
    texCtx.fill();
    texCtx.globalCompositeOperation = "source-over";
  }

  let drizzleCounter = 0;

  function updateDrops(t: number) {
    let newDrops: Drop[] = [];

    // Add drizzle — tiny background drops on the glass
    drizzleCounter += DRIZZLE * t * areaMultiplier();
    while (drizzleCounter >= 1) {
      drizzleCounter--;
      drawTextureDrop(random(width), random(height), random(DRIZZLE_SIZE_MIN, DRIZZLE_SIZE_MAX, (v) => v * v));
    }

    // Slowly fade the drizzle texture
    texCtx.globalCompositeOperation = "destination-out";
    texCtx.fillStyle = `rgba(0,0,0,${0.002 * t})`;
    texCtx.fillRect(0, 0, width, height);
    texCtx.globalCompositeOperation = "source-over";

    // Draw drizzle texture to main canvas
    ctx.drawImage(texCanvas, 0, 0, width, height);

    // Spawn new rain drops
    const limit = RAIN_LIMIT * t * areaMultiplier();
    let spawned = 0;
    while (chance(RAIN_CHANCE * t * areaMultiplier()) && spawned < limit && drops.length + newDrops.length < MAX_DROPS) {
      spawned++;
      const r = random(MIN_R, MAX_R, (v) => v * v * v);
      newDrops.push(
        createDrop(width, height, {
          r,
          momentum: 1 + 0.3 * (r - MIN_R) + random(0.5),
          spreadX: 1.5,
          spreadY: 1.5,
        }),
      );
    }

    // Sort drops for collision detection
    drops.sort((a, b) => {
      const ka = a.y * width + a.x;
      const kb = b.y * width + b.x;
      return ka - kb;
    });

    // Update each drop
    drops.forEach((drop, idx) => {
      if (drop.killed) return;

      // Random momentum boost (bigger drops fall faster)
      if (chance((drop.r - MIN_R * DROP_FALL_MULTIPLIER) * (0.1 / DELTA_R) * t)) {
        drop.momentum += random((drop.r / MAX_R) * 4);
      }

      // Auto-shrink small drops
      if (drop.r <= MIN_R && chance(0.05 * t)) {
        drop.shrink += 0.01;
      }
      drop.r -= drop.shrink * t;
      if (drop.r <= 0) {
        drop.killed = true;
        return;
      }

      // Trail spawning — leave smaller drops behind
      if (drop.momentum > 0) {
        drop.lastSpawn += drop.momentum * t * TRAIL_RATE;
        if (drop.lastSpawn > drop.nextSpawn && drops.length + newDrops.length < MAX_DROPS) {
          const trailDrop = createDrop(width, height, {
            x: drop.x + 0.1 * random(-drop.r, drop.r),
            y: drop.y - 0.01 * drop.r,
            r: drop.r * random(TRAIL_SCALE_MIN, TRAIL_SCALE_MAX),
            spreadY: 0.14 * drop.momentum,
            momentum: 0,
          });
          newDrops.push(trailDrop);
          drop.r *= Math.pow(0.97, t);
          drop.lastSpawn = 0;
          drop.nextSpawn = random(MIN_R, MAX_R) - 2 * drop.momentum * TRAIL_RATE + (MAX_R - drop.r);
        }
      }

      // Decay spread
      drop.spreadX *= Math.pow(0.4, t);
      drop.spreadY *= Math.pow(0.7, t);

      const moving = drop.momentum > 0;

      // Move
      if (moving && !drop.killed) {
        drop.y += drop.momentum;
        drop.x += drop.momentumX;
        if (drop.y > height + drop.r) {
          drop.killed = true;
          return;
        }
      }

      // Collision detection — merge with nearby smaller drops
      const shouldCheck = (moving || drop.isNew) && !drop.killed;
      drop.isNew = false;
      if (shouldCheck) {
        const nearby = drops.slice(idx + 1, idx + 70);
        for (const other of nearby) {
          if (other === drop || other.killed || drop.r <= other.r) continue;
          const dx = other.x - drop.x;
          const dy = other.y - drop.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const threshold = (drop.r + other.r) * (COLLISION_RADIUS + drop.momentum * COLLISION_RADIUS_INCREASE * t);
          if (dist < threshold) {
            // Merge: absorb other drop
            const newR = Math.min(MAX_R, Math.sqrt((Math.PI * drop.r * drop.r + 0.8 * Math.PI * other.r * other.r) / Math.PI));
            drop.r = newR;
            drop.momentumX += 0.1 * dx;
            drop.spreadX = 0;
            drop.spreadY = 0;
            other.killed = true;
            drop.momentum = Math.max(other.momentum, Math.min(40, drop.momentum + 0.04 * newR + 1));
          }
        }
      }

      // Momentum decay
      drop.momentum -= 0.1 * Math.max(1, 0.5 * MIN_R - drop.momentum) * t;
      if (drop.momentum < 0) drop.momentum = 0;
      drop.momentumX *= Math.pow(0.7, t);

      if (!drop.killed) {
        newDrops.push(drop);
        if (moving && DRIZZLE > 0) {
          paintClear(drop.x, drop.y, drop.r);
        }
        drawDrop(drop);
      }
    });

    drops = newDrops;
  }

  function frame() {
    const now = Date.now();
    if (lastRender == null) lastRender = now;
    let deltaTime = (now - lastRender) / (1000 / 30); // normalize to 30fps
    if (deltaTime > 2) deltaTime = 2;
    deltaTime *= GLOBAL_TIME_SCALE;
    lastRender = now;

    ctx.clearRect(0, 0, width, height);
    updateDrops(deltaTime);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
