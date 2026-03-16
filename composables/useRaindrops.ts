interface Drop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  drift: number;
  opacity: number;
  stutterTimer: number;
  stutterPause: boolean;
}

function createDrop(width: number, startY?: number): Drop {
  const radius = 3 + Math.random() * 3;
  const baseSpeed = 0.3 + Math.random() * 0.5;
  return {
    x: Math.random() * width,
    y: startY ?? -(Math.random() * 200),
    radius,
    speed: baseSpeed,
    baseSpeed,
    drift: (Math.random() - 0.5) * 0.1,
    opacity: 0.15 + Math.random() * 0.15,
    stutterTimer: 80 + Math.random() * 150,
    stutterPause: false,
  };
}

const DROP_COUNT = 3;

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
    const stretch = 1 + drop.speed * 0.3;
    const rx = drop.radius;
    const ry = drop.radius * stretch;

    ctx.save();
    ctx.translate(drop.x, drop.y);

    // Soft body
    const grad = ctx.createRadialGradient(0, -ry * 0.15, 0, 0, 0, Math.max(rx, ry));
    grad.addColorStop(0, `rgba(255, 255, 255, ${drop.opacity * 0.8})`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, ${drop.opacity * 0.4})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny specular dot
    ctx.beginPath();
    ctx.arc(-rx * 0.2, -ry * 0.25, rx * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 0.6})`;
    ctx.fill();

    ctx.restore();
  }

  function update() {
    for (const drop of drops) {
      drop.stutterTimer--;
      if (drop.stutterTimer <= 0) {
        drop.stutterPause = !drop.stutterPause;
        drop.stutterTimer = drop.stutterPause ? 30 + Math.random() * 60 : 100 + Math.random() * 200;
      }

      const currentSpeed = drop.stutterPause ? drop.baseSpeed * 0.02 : drop.speed;

      drop.y += currentSpeed;
      drop.drift += (Math.random() - 0.5) * 0.05;
      drop.drift *= 0.97;
      drop.x += drop.drift;

      if (!drop.stutterPause) {
        drop.speed = Math.min(drop.speed + 0.002, drop.baseSpeed * 2);
      } else {
        drop.speed = drop.baseSpeed;
      }

      if (drop.y > height + 20 || drop.x < -20 || drop.x > width + 20) {
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
