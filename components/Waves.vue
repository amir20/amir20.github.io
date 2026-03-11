<template>
  <div>
    <canvas ref="noiseCanvas" class="noise-overlay"></canvas>
  </div>
</template>

<script>
import { select } from "d3-selection";
import { line, curveBasis } from "d3-shape";
import { timer } from "d3-timer";
import { useWaveMultiplier } from "~/composables/useWaves";

const d3 = Object.assign({}, { select, line, curveBasis, timer });
const shape = d3.line().curve(d3.curveBasis);
const multipier = useWaveMultiplier();

// Gradient definitions: [startColor, endColor] per wave
const waveGradients = [
  ["#d4a87c", "#c8846a"], // amber to terracotta
  ["#e0b98a", "#b8713e"], // warm gold to burnt sienna
  ["#6bbac4", "#3d8b8a"], // light teal to deep teal
  ["#2d6b72", "#1a3f47"], // deep teal to near-black teal
];

// Blur levels per wave (back to front: blurriest to sharpest)
const waveBlur = [6, 3, 1, 0];

export default {
  data() {
    return {
      vis: null,
      points: 6,
      mousePosition: [500, 700],
      wavesCount: 4,
      waves: [],
      paths: [],
      pathHeights: [],
      seeds: [],
      w: null,
      h: null,
      defs: null,
      mouseHue: 0,
    };
  },
  mounted() {
    this.vis = d3.select(this.$el).append("svg").attr("pointer-events", "all");
    this.defs = this.vis.append("defs");

    // Create gradient defs and blur filters
    for (let i = 0; i < this.wavesCount; i++) {
      const grad = this.defs
        .append("linearGradient")
        .attr("id", `wave-grad-${i}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", waveGradients[i][0]);
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", waveGradients[i][1]);

      // Blur filter for depth
      if (waveBlur[i] > 0) {
        const filter = this.defs
          .append("filter")
          .attr("id", `wave-blur-${i}`);
        filter
          .append("feGaussianBlur")
          .attr("in", "SourceGraphic")
          .attr("stdDeviation", waveBlur[i]);
      }

      const wave = this.vis
        .append("path")
        .attr("class", "wave")
        .style("fill", `url(#wave-grad-${i})`)
        .style("opacity", 0.15 + ((i + 1) / this.wavesCount) * 0.55);

      if (waveBlur[i] > 0) {
        wave.style("filter", `url(#wave-blur-${i})`);
      }

      this.waves.push(wave);
      this.paths.push([]);
      this.seeds.push(Math.random());
    }

    this.init();
    this.generateNoise();
    d3.timer(this.step);

    window.addEventListener("mousemove", (e) => {
      this.mousePosition[0] = Math.min(e.clientX, 200) + 250;
      this.mousePosition[1] = Math.min(e.clientY, 300) + 600;

      // Mouse-driven hue shift: map X position across viewport to -20..+20 degrees
      this.mouseHue = ((e.clientX / (this.w || 1)) - 0.5) * 40;
    });

    window.addEventListener("resize", () => {
      this.init();
      this.generateNoise();
    });
  },
  methods: {
    generateNoise() {
      const canvas = this.$refs.noiseCanvas;
      if (!canvas) return;
      canvas.width = this.w || window.innerWidth;
      canvas.height = this.h || window.innerHeight;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 18; // very subtle opacity
      }
      ctx.putImageData(imageData, 0, 0);
    },
    init() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.vis.attr("width", this.w).attr("height", this.h);

      for (let i = 0; i < this.wavesCount; i++) {
        const path = this.paths[i];

        path[0] = [-200 * Math.random(), this.h];
        for (let j = 0; j < this.points; j++) {
          path[j + 1] = [(this.w / this.points) * j, path[j + 1] || this.h / 4];
        }
        path[this.points + 1] = [this.w + Math.random() * 200, this.h];
        this.paths[i] = path;
        this.pathHeights[i] = this.h / 2;
      }
    },
    step(elapsed) {
      // Update gradient colors based on mouse hue shift
      const hueShift = this.mouseHue;
      for (let i = 0; i < this.wavesCount; i++) {
        // Shift gradient stop colors
        const stops = this.defs.select(`#wave-grad-${i}`).selectAll("stop");
        stops.each(function (d, j) {
          const baseColor = waveGradients[i][j];
          d3.select(this).attr("stop-color", shiftHue(baseColor, hueShift));
        });

        this.pathHeights[i] += (this.h / multipier.value - (this.mousePosition[1] / 3 + this.mousePosition[0] / 3 + 200) - this.pathHeights[i]) / 10;
        this.update(elapsed, this.pathHeights[i], this.waves[i], this.paths[i], this.seeds[i]);
      }
    },
    update(elapsed, height, wave, path, seed) {
      for (let i = 1; i < this.points + 1; i++) {
        const sinSeed = ((seed / 2 + 0.2) * elapsed) / 6 + (i + (i % 10)) * 100 + seed * 500;
        path[i][1] = Math.sin(sinSeed / 100) * Math.sin(sinSeed / 200) * height + (this.h - 20 - seed * 10);
      }

      wave.attr("d", shape(path));
    },
  },
};

// Utility: shift a hex color's hue by degrees
function shiftHue(hex, degrees) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  h = (h + degrees + 360) % 360;

  // HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1, g1, b1;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}
</script>
<style scoped>
div {
  z-index: 1;
  opacity: 0.85;
  position: fixed;
  bottom: -10px;
  left: 0;
  right: 0;
  view-transition-name: waves;
}

.noise-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: overlay;
  opacity: 0.4;
}
</style>
