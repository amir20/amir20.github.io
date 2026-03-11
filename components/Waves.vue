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

    // Create gradient defs (no SVG blur filters — use CSS filter instead)
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

      // Use CSS filter: blur() instead of SVG feGaussianBlur for GPU acceleration
      const wave = this.vis
        .append("path")
        .attr("class", "wave")
        .style("fill", `url(#wave-grad-${i})`)
        .style("opacity", 0.15 + ((i + 1) / this.wavesCount) * 0.55)
        .style("will-change", "d");

      if (waveBlur[i] > 0) {
        wave.style("filter", `blur(${waveBlur[i]}px)`);
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
      // Apply hue shift on the container div (GPU-composited, avoids SVG re-rasterization)
      this.$el.style.filter = `hue-rotate(${this.mouseHue}deg)`;

      for (let i = 0; i < this.wavesCount; i++) {
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
  will-change: filter;
  transform: translateZ(0);
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
