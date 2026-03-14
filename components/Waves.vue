<template>
  <div ref="root"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { select } from "d3-selection";
import { line, curveBasis } from "d3-shape";
import { timer } from "d3-timer";
import { useWaveMultiplier } from "~/composables/useWaves";

const d3 = { select, line, curveBasis, timer };
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

const root = ref(null);

// Non-reactive mutable state (no need for reactivity on animation internals)
let vis = null;
let defs = null;
const mousePosition = [500, 700];
const waves = [];
const highlights = [];
const paths = [];
const pathHeights = [];
const seeds = [];
let w = null;
let h = null;
let effectiveW = null;
let mouseHue = 0;
let tidePhase = 0;

function init() {
  w = window.innerWidth;
  h = window.innerHeight;
  effectiveW = Math.max(w, 1200);
  const overflow = (effectiveW - w) / 2;
  vis.attr("width", effectiveW).attr("height", h).style("margin-left", `${-overflow}px`);

  for (let i = 0; i < waveLayers.length; i++) {
    const layer = waveLayers[i];
    const pathObj = paths[i];
    const pts = layer.points;

    pathObj.data[0] = [-200 * Math.random(), h];
    for (let j = 0; j < pts; j++) {
      pathObj.data[j + 1] = [(effectiveW / pts) * j, pathObj.data[j + 1]?.[1] || h / 4];
    }
    pathObj.data[pts + 1] = [effectiveW + Math.random() * 200, h];
    pathHeights[i] = h / 2;
  }
}

function update(elapsed, height, wave, pathObj, seed, layer) {
  const pts = pathObj.points;
  const data = pathObj.data;
  const speed = layer.speed;
  const amp = layer.amplitude;
  const shape = d3.line().curve(d3.curveBasis);

  const rise = Math.min((multiplier.value - 1) / 8, 1);
  const baseY = h * (1 - (1 - layer.heightOffset) * rise);

  for (let i = 1; i < pts + 1; i++) {
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

  wave.attr("d", shape(data));
}

function step(elapsed) {
  root.value.style.filter = `hue-rotate(${mouseHue}deg)`;

  // Slow tide: gentle up/down over ~20 seconds
  tidePhase = Math.sin(elapsed / 10000) * 15 + Math.sin(elapsed / 4000) * 8;

  for (let i = 0; i < waveLayers.length; i++) {
    const layer = waveLayers[i];
    pathHeights[i] += (h / multiplier.value - (mousePosition[1] / 3 + mousePosition[0] / 3 + 200) - pathHeights[i]) / 10;
    update(elapsed, pathHeights[i], waves[i], paths[i], seeds[i], layer);
  }

  // Update highlight strokes to follow their wave paths
  for (const hl of highlights) {
    const pathData = paths[hl.waveIndex].data;
    const shape = d3.line().curve(d3.curveBasis);
    hl.path.attr("d", shape(pathData));
  }
}

onMounted(() => {
  vis = d3.select(root.value).append("svg").attr("pointer-events", "all");
  defs = vis.append("defs");

  for (let i = 0; i < waveLayers.length; i++) {
    const layer = waveLayers[i];

    const grad = defs.append("linearGradient").attr("id", `wave-grad-${i}`).attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");

    grad.append("stop").attr("offset", "0%").attr("stop-color", layer.colors[0]);
    grad.append("stop").attr("offset", "100%").attr("stop-color", layer.colors[1]);

    const wave = vis.append("path").attr("class", "wave").style("fill", `url(#wave-grad-${i})`).style("opacity", layer.opacity).style("will-change", "d");

    if (layer.blur > 0) {
      wave.style("filter", `blur(${layer.blur}px)`);
    }

    waves.push(wave);

    // Add highlight stroke on the top 3 surface waves
    if (i >= waveLayers.length - 3) {
      const highlightOpacity = 0.08 + (i - (waveLayers.length - 3)) * 0.06;
      const highlight = vis
        .append("path")
        .attr("class", "wave-highlight")
        .style("fill", "none")
        .style("stroke", `rgba(255, 255, 255, ${highlightOpacity})`)
        .style("stroke-width", 1.5 - (waveLayers.length - 1 - i) * 0.3)
        .style("will-change", "d");
      highlights.push({ path: highlight, waveIndex: i });
    }

    paths.push({ points: layer.points, data: [] });
    seeds.push(Math.random());
  }

  init();
  d3.timer(step);

  window.addEventListener("mousemove", (e) => {
    mousePosition[0] = Math.min(e.clientX, 200) + 250;
    mousePosition[1] = Math.min(e.clientY, 300) + 600;
    mouseHue = (e.clientX / (w || 1) - 0.5) * 20;
  });

  window.addEventListener("resize", () => {
    init();
  });
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
  view-transition-name: none;
  will-change: filter;
  transform: translateY(100%);
  animation:
    slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards,
    bob 6s ease-in-out 1.4s infinite;
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
    transform: translateY(50px);
  }
}
</style>
