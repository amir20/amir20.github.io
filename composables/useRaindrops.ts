interface Drop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  drift: number;
  opacity: number;
  // Stutter: drops pause briefly then accelerate, like real water on glass
  stutterTimer: number;
  stutterPause: boolean;
  trail: { x: number; y: number; radius: number }[];
}

function createDrop(width: number, startY?: number): Drop {
  const radius = 3 + Math.random() * 4;
  const baseSpeed = 0.3 + Math.random() * 0.8;
  return {
    x: Math.random() * width,
    y: startY ?? -(Math.random() * 300),
    radius,
    speed: baseSpeed,
    baseSpeed,
    drift: (Math.random() - 0.5) * 0.2,
    opacity: 0.15 + Math.random() * 0.15,
    stutterTimer: 60 + Math.random() * 120,
    stutterPause: false,
    trail: [],
  };
}

const MAX_TRAIL = 60;
const DROP_COUNT = 7;

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
    // Draw wet trail — a continuous thin streak left on the glass
    if (drop.trail.length > 1) {
      for (let i = 1; i < drop.trail.length; i++) {
        const prev = drop.trail[i - 1];
        const curr = drop.trail[i];
        const age = i / drop.trail.length;
        const trailOpacity = drop.opacity * 0.4 * (1 - age);
        if (trailOpacity < 0.01) continue;

        const trailWidth = curr.radius * 0.4 * (1 - age * 0.7);

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${trailOpacity})`;
        ctx.lineWidth = trailWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    // Draw main drop — elongated vertically based on speed for motion feel
    const stretch = 1 + drop.speed * 0.4;
    const rx = drop.radius;
    const ry = drop.radius * stretch;

    ctx.save();
    ctx.translate(drop.x, drop.y);

    // Drop shadow/body — semi-transparent with soft edge
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

    const bodyGrad = ctx.createRadialGradient(0, -ry * 0.2, 0, 0, 0, Math.max(rx, ry));
    bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${drop.opacity * 0.6})`);
    bodyGrad.addColorStop(0.4, `rgba(255, 255, 255, ${drop.opacity * 0.3})`);
    bodyGrad.addColorStop(0.7, `rgba(255, 255, 255, ${drop.opacity * 0.1})`);
    bodyGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Rim — subtle edge highlight like light refracting at the drop boundary
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.95, ry * 0.95, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Bright specular highlight — off-center like real light refraction
    ctx.beginPath();
    ctx.ellipse(-rx * 0.3, -ry * 0.35, rx * 0.25, ry * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 1.2})`;
    ctx.fill();

    ctx.restore();
  }

  function update() {
    for (const drop of drops) {
      // Stutter mechanic — drops pause then release, like surface tension
      drop.stutterTimer--;
      if (drop.stutterTimer <= 0) {
        drop.stutterPause = !drop.stutterPause;
        drop.stutterTimer = drop.stutterPause ? 20 + Math.random() * 40 : 80 + Math.random() * 160;
      }

      const currentSpeed = drop.stutterPause ? drop.baseSpeed * 0.05 : drop.speed;

      // Store trail position
      drop.trail.unshift({ x: drop.x, y: drop.y, radius: drop.radius });
      if (drop.trail.length > MAX_TRAIL) {
        drop.trail.pop();
      }

      // Move drop
      drop.y += currentSpeed;
      drop.drift += (Math.random() - 0.5) * 0.08;
      drop.drift *= 0.96;
      drop.x += drop.drift;

      // Gradually accelerate when not paused (gravity)
      if (!drop.stutterPause) {
        drop.speed = Math.min(drop.speed + 0.003, drop.baseSpeed * 2.5);
      } else {
        drop.speed = drop.baseSpeed;
      }

      // Respawn if off screen
      if (drop.y > height + 30 || drop.x < -20 || drop.x > width + 20) {
        const newDrop = createDrop(width);
        Object.assign(drop, newDrop);
        drop.trail = [];
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
