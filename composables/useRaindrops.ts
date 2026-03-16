interface Drop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
  trail: { x: number; y: number; opacity: number }[];
}

function createDrop(width: number, startY?: number): Drop {
  return {
    x: Math.random() * width,
    y: startY ?? -(Math.random() * 200),
    radius: 4 + Math.random() * 6,
    speed: 0.5 + Math.random() * 1.5,
    drift: (Math.random() - 0.5) * 0.3,
    opacity: 0.4 + Math.random() * 0.4,
    trail: [],
  };
}

const MAX_TRAIL = 18;
const DROP_COUNT = 8;

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
    mix-blend-mode: screen;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas!.width = width;
    canvas!.height = height;
  }

  resize();
  window.addEventListener("resize", resize);

  const drops: Drop[] = [];
  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push(createDrop(width, Math.random() * height));
  }

  function drawDrop(drop: Drop) {
    // Draw trail
    for (let i = 0; i < drop.trail.length; i++) {
      const t = drop.trail[i];
      const progress = i / drop.trail.length;
      const trailRadius = drop.radius * 0.3 * (1 - progress);
      if (trailRadius < 0.5) continue;

      ctx.beginPath();
      ctx.arc(t.x, t.y, trailRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${t.opacity * 0.3})`;
      ctx.fill();
    }

    // Draw main drop with radial gradient for refraction look
    const grad = ctx.createRadialGradient(
      drop.x - drop.radius * 0.3,
      drop.y - drop.radius * 0.3,
      drop.radius * 0.1,
      drop.x,
      drop.y,
      drop.radius,
    );
    grad.addColorStop(0, `rgba(200, 220, 255, ${drop.opacity * 0.9})`);
    grad.addColorStop(0.5, `rgba(180, 200, 240, ${drop.opacity * 0.4})`);
    grad.addColorStop(1, `rgba(180, 200, 240, 0)`);

    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Small bright highlight
    ctx.beginPath();
    ctx.arc(drop.x - drop.radius * 0.25, drop.y - drop.radius * 0.25, drop.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 235, 255, ${drop.opacity})`;
    ctx.fill();
  }

  function update() {
    for (const drop of drops) {
      // Store trail position
      drop.trail.unshift({ x: drop.x, y: drop.y, opacity: drop.opacity });
      if (drop.trail.length > MAX_TRAIL) {
        drop.trail.pop();
      }

      // Fade trail entries
      for (let i = 0; i < drop.trail.length; i++) {
        drop.trail[i].opacity *= 0.92;
      }

      // Move drop with wobble for natural look
      drop.y += drop.speed + (Math.random() - 0.5) * 0.4;
      drop.drift += (Math.random() - 0.5) * 0.15;
      drop.drift *= 0.95; // dampen drift so it doesn't run away
      drop.x += drop.drift;

      // Respawn if off screen
      if (drop.y > height + 20) {
        Object.assign(drop, createDrop(width));
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    update();
    for (const drop of drops) {
      drawDrop(drop);
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
