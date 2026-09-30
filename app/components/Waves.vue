<template>
  <div ref="root"></div>
</template>

<script setup>
import { select } from "d3-selection";
import { line, curveBasis } from "d3-shape";
import { timer } from "d3-timer";

const multiplier = useWaveMultiplier();

// 6 wave layers: deep background → surface foreground
const waveLayers = [
  { colors: ["#0a2e4a", "#071e32"], blur: 10, opacity: 0.35, points: 6, speed: 0.4, heightOffset: 0.92, amplitude: 0.6 },
  { colors: ["#0e3d5e", "#0b2d47"], blur: 7, opacity: 0.4, points: 7, speed: 0.55, heightOffset: 0.88, amplitude: 0.7 },
  { colors: ["#1a5276", "#135a6e"], blur: 5, opacity: 0.45, points: 8, speed: 0.7, heightOffset: 0.84, amplitude: 0.8 },
  { colors: ["#2179a0", "#1a6b8a"], blur: 3, opacity: 0.5, points: 9, speed: 0.9, heightOffset: 0.8, amplitude: 0.85 },
  { colors: ["#3498b8", "#2980a0"], blur: 1, opacity: 0.55, points: 10, speed: 1.1, heightOffset: 0.76, amplitude: 0.9 },
  { colors: ["#5dade2", "#48a0d4"], blur: 0, opacity: 0.6, points: 12, speed: 1.4, heightOffset: 0.72, amplitude: 1.0 },
];
const HIGHLIGHT_LAYERS = 3;

const root = ref(null);

// Non-reactive mutable state (no need for reactivity on animation internals)
// Paths are rebuilt every frame; 1 decimal keeps the `d` strings short without visible loss.
const shape = line().curve(curveBasis).digits(1);
const mousePosition = [500, 700];
const layers = []; // { wave, highlight?, data, height, seed }
let vis = null;
let loop = null;
let resizeFrame = 0;
let w = 0;
let h = 0;
let mouseHue = 0;
let appliedHue = null;
let smoothedMultiplier = multiplier.value;
let multiplierVelocity = 0;

function init() {
  w = window.innerWidth;
  h = window.innerHeight;
  const effectiveW = Math.max(w, 1200);
  const overflow = (effectiveW - w) / 2;
  vis.attr("width", effectiveW).attr("height", h).style("margin-left", `${-overflow}px`);

  for (let i = 0; i < waveLayers.length; i++) {
    const pts = waveLayers[i].points;
    const { data } = layers[i];

    data[0] = [-200 * Math.random(), h];
    for (let j = 0; j < pts; j++) {
      data[j + 1] = [(effectiveW / pts) * j, data[j + 1]?.[1] || h / 4];
    }
    data[pts + 1] = [effectiveW + Math.random() * 200, h];
    layers[i].height = h / 2;
  }
}

function update(elapsed, tidePhase, layer, { data, height, seed }) {
  const { points, speed, amplitude: amp } = layer;
  const rise = Math.min((smoothedMultiplier - 1) / 8, 1);
  const baseY = h * (1 - (1 - layer.heightOffset) * rise);

  for (let i = 1; i < points + 1; i++) {
    const t = ((seed / 2 + 0.2) * elapsed * speed) / 6 + (i + (i % 10)) * 100 + seed * 500;

    // Primary swell — slow, broad
    const swell = Math.sin(t / 160) * Math.sin(t / 300) * amp;
    // Secondary chop — medium frequency
    const chop = Math.sin(t / 80 + i * 1.2) * 0.18 * amp;
    // Surface ripple — fast, small (stronger on front waves)
    const ripple = Math.sin(t / 35 + i * 2.5) * 0.07 * amp;

    // Per-layer bob: each layer oscillates at its own rate
    const layerBob = Math.sin(elapsed / (3000 + seed * 2000) + i * 0.3) * 6 * amp;
    data[i][1] = (swell + chop + ripple) * height * 0.5 + baseY + tidePhase * (1 - amp * 0.3) + layerBob;
  }
}

function step(elapsed) {
  // Writing `filter` invalidates the whole blurred layer, so only touch it when the hue moves.
  if (mouseHue !== appliedHue) {
    root.value.style.filter = `hue-rotate(${mouseHue}deg)`;
    appliedHue = mouseHue;
  }

  // Slow tide: gentle up/down over ~20 seconds
  const tidePhase = Math.sin(elapsed / 10000) * 15 + Math.sin(elapsed / 4000) * 8;

  // Spring physics on the multiplier so page navigation bounces in
  const stiffness = 0.04;
  const damping = 0.78;
  multiplierVelocity += (multiplier.value - smoothedMultiplier) * stiffness;
  multiplierVelocity *= damping;
  smoothedMultiplier += multiplierVelocity;

  const mouseOffset = mousePosition[1] / 3 + mousePosition[0] / 3 + 200;
  const target = h / smoothedMultiplier - mouseOffset;

  for (let i = 0; i < waveLayers.length; i++) {
    const state = layers[i];
    // Smooth the mouse component, but let the spring's bounce pass through directly
    state.height = target * 0.7 + (state.height + (target - state.height) / 10) * 0.3;
    update(elapsed, tidePhase, waveLayers[i], state);

    const d = shape(state.data);
    state.wave.attr("d", d);
    state.highlight?.attr("d", d);
  }
}

function onMouseMove(e) {
  mousePosition[0] = Math.min(e.clientX, 200) + 250;
  mousePosition[1] = Math.min(e.clientY, 300) + 600;
  mouseHue = Math.round((e.clientX / (w || 1) - 0.5) * 20);
}

function onResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(init);
}

onMounted(() => {
  vis = select(root.value).append("svg").attr("pointer-events", "all");
  const defs = vis.append("defs");

  for (let i = 0; i < waveLayers.length; i++) {
    const layer = waveLayers[i];

    const grad = defs.append("linearGradient").attr("id", `wave-grad-${i}`).attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", layer.colors[0]);
    grad.append("stop").attr("offset", "100%").attr("stop-color", layer.colors[1]);

    const wave = vis.append("path").attr("class", "wave").style("fill", `url(#wave-grad-${i})`).style("opacity", layer.opacity);
    if (layer.blur > 0) {
      wave.style("filter", `blur(${layer.blur}px)`);
    }

    // Add highlight stroke on the top surface waves
    let highlight = null;
    const fromTop = i - (waveLayers.length - HIGHLIGHT_LAYERS);
    if (fromTop >= 0) {
      highlight = vis
        .append("path")
        .attr("class", "wave-highlight")
        .style("fill", "none")
        .style("stroke", `rgba(255, 255, 255, ${0.08 + fromTop * 0.06})`)
        .style("stroke-width", 1.5 - (waveLayers.length - 1 - i) * 0.3);
    }

    layers.push({ wave, highlight, data: [], height: 0, seed: Math.random() });
  }

  init();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    step(0);
  } else {
    loop = timer(step);
  }

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
});

onBeforeUnmount(() => {
  loop?.stop();
  cancelAnimationFrame(resizeFrame);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
div {
  z-index: 1;
  opacity: 0.85;
  position: fixed;
  bottom: -10px;
  left: 0;
  right: 0;
  overflow: hidden;
  view-transition-name: waves;
  transform: translateY(100%);
  animation:
    slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards,
    bob 8s cubic-bezier(0.455, 0.03, 0.515, 0.955) 1.4s infinite;
}

@keyframes slide-up {
  to {
    transform: translateY(0);
  }
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
}
</style>
