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
const multipier = useWaveMultiplier();

// 6 wave layers: deep background → surface foreground
const waveLayers = [
  { colors: ["#0a2e4a", "#071e32"], blur: 10, opacity: 0.35, points: 6,  speed: 0.4,  heightOffset: 0.92, amplitude: 0.6  },
  { colors: ["#0e3d5e", "#0b2d47"], blur: 7,  opacity: 0.4,  points: 7,  speed: 0.55, heightOffset: 0.88, amplitude: 0.7  },
  { colors: ["#1a5276", "#135a6e"], blur: 5,  opacity: 0.45, points: 8,  speed: 0.7,  heightOffset: 0.84, amplitude: 0.8  },
  { colors: ["#2179a0", "#1a6b8a"], blur: 3,  opacity: 0.5,  points: 9,  speed: 0.9,  heightOffset: 0.80, amplitude: 0.85 },
  { colors: ["#3498b8", "#2980a0"], blur: 1,  opacity: 0.55, points: 10, speed: 1.1,  heightOffset: 0.76, amplitude: 0.9  },
  { colors: ["#5dade2", "#48a0d4"], blur: 0,  opacity: 0.6,  points: 12, speed: 1.4,  heightOffset: 0.72, amplitude: 1.0  },
];

export default {
  data() {
    return {
      vis: null,
      mousePosition: [500, 700],
      wavesCount: waveLayers.length,
      waves: [],
      highlights: [],
      paths: [],
      pathHeights: [],
      seeds: [],
      w: null,
      h: null,
      defs: null,
      mouseHue: 0,
      tidePhase: 0,
    };
  },
  mounted() {
    this.vis = d3.select(this.$el).append("svg").attr("pointer-events", "all");
    this.defs = this.vis.append("defs");

    for (let i = 0; i < this.wavesCount; i++) {
      const layer = waveLayers[i];

      const grad = this.defs
        .append("linearGradient")
        .attr("id", `wave-grad-${i}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      grad.append("stop").attr("offset", "0%").attr("stop-color", layer.colors[0]);
      grad.append("stop").attr("offset", "100%").attr("stop-color", layer.colors[1]);

      const wave = this.vis
        .append("path")
        .attr("class", "wave")
        .style("fill", `url(#wave-grad-${i})`)
        .style("opacity", layer.opacity)
        .style("will-change", "d");

      if (layer.blur > 0) {
        wave.style("filter", `blur(${layer.blur}px)`);
      }

      this.waves.push(wave);

      // Add highlight stroke on the top 3 surface waves
      if (i >= this.wavesCount - 3) {
        const highlightOpacity = 0.08 + (i - (this.wavesCount - 3)) * 0.06;
        const highlight = this.vis
          .append("path")
          .attr("class", "wave-highlight")
          .style("fill", "none")
          .style("stroke", `rgba(255, 255, 255, ${highlightOpacity})`)
          .style("stroke-width", 1.5 - (this.wavesCount - 1 - i) * 0.3)
          .style("will-change", "d");
        this.highlights.push({ path: highlight, waveIndex: i });
      }

      // Each layer gets its own shape function with matching point count
      this.paths.push({ points: layer.points, data: [] });
      this.seeds.push(Math.random());
    }

    this.init();
    this.generateNoise();
    d3.timer(this.step);

    window.addEventListener("mousemove", (e) => {
      this.mousePosition[0] = Math.min(e.clientX, 200) + 250;
      this.mousePosition[1] = Math.min(e.clientY, 300) + 600;
      this.mouseHue = ((e.clientX / (this.w || 1)) - 0.5) * 20;
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
        data[i + 3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);
    },
    init() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.vis.attr("width", this.w).attr("height", this.h);

      for (let i = 0; i < this.wavesCount; i++) {
        const layer = waveLayers[i];
        const pathObj = this.paths[i];
        const pts = layer.points;

        pathObj.data[0] = [-200 * Math.random(), this.h];
        for (let j = 0; j < pts; j++) {
          pathObj.data[j + 1] = [(this.w / pts) * j, pathObj.data[j + 1]?.[1] || this.h / 4];
        }
        pathObj.data[pts + 1] = [this.w + Math.random() * 200, this.h];
        this.pathHeights[i] = this.h / 2;
      }
    },
    step(elapsed) {
      this.$el.style.filter = `hue-rotate(${this.mouseHue}deg)`;

      // Slow tide: gentle up/down over ~20 seconds
      this.tidePhase = Math.sin(elapsed / 10000) * 15;

      for (let i = 0; i < this.wavesCount; i++) {
        const layer = waveLayers[i];
        this.pathHeights[i] += (this.h / multipier.value - (this.mousePosition[1] / 3 + this.mousePosition[0] / 3 + 200) - this.pathHeights[i]) / 10;
        this.update(elapsed, this.pathHeights[i], this.waves[i], this.paths[i], this.seeds[i], layer);
      }

      // Update highlight strokes to follow their wave paths
      for (const hl of this.highlights) {
        const pathData = this.paths[hl.waveIndex].data;
        const shape = d3.line().curve(d3.curveBasis);
        // Highlight follows just the top edge (exclude the bottom-anchored endpoints)
        hl.path.attr("d", shape(pathData));
      }
    },
    update(elapsed, height, wave, pathObj, seed, layer) {
      const pts = pathObj.points;
      const data = pathObj.data;
      const speed = layer.speed;
      const amp = layer.amplitude;
      const shape = d3.line().curve(d3.curveBasis);

      // Use the multiplier to shift the base position
      // Higher multiplier = waves rise higher, lower = waves sink toward bottom
      // multipier.value ranges from ~2 (about page) to ~9 (home page)
      const rise = Math.min((multipier.value - 1) / 8, 1); // 0..1
      const baseY = this.h * (1 - (1 - layer.heightOffset) * rise);

      for (let i = 1; i < pts + 1; i++) {
        const t = ((seed / 2 + 0.2) * elapsed * speed) / 6 + (i + (i % 10)) * 100 + seed * 500;

        // Primary swell — slow, broad
        const swell = Math.sin(t / 160) * Math.sin(t / 300) * amp;
        // Secondary chop — medium frequency
        const chop = Math.sin(t / 80 + i * 1.2) * 0.18 * amp;
        // Surface ripple — fast, small (stronger on front waves)
        const ripple = Math.sin(t / 35 + i * 2.5) * 0.07 * amp;

        data[i][1] = (swell + chop + ripple) * height * 0.5 + baseY + this.tidePhase * (1 - amp * 0.3);
      }

      wave.attr("d", shape(data));
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
