<template>
  <NuxtLink to="/" class="signature" aria-label="Amir Raminfar">
    <svg class="signature__svg" :viewBox="viewBox" role="img" aria-hidden="true">
      <path
        v-for="(s, i) in timed"
        :key="i"
        :d="s.d"
        pathLength="100"
        class="signature__stroke"
        :style="{ '--delay': `${s.delay}s`, '--dur': `${s.dur}s` }"
      />
    </svg>
  </NuxtLink>
</template>

<script setup>
// Real signature traced to centerline strokes (see assets/signature.js). Each
// stroke is drawn in turn, left-to-right, via stroke-dashoffset — reproducing
// the motion of actually signing. `start`/`frac` place each stroke in the
// shared timeline so the pen moves at a constant pace across the whole name.
import { viewBox, strokes } from "~/assets/signature.js";

// --- Timing controls ---------------------------------------------------------
const DURATION = 2.6; // seconds for the full signature to draw (speed)
const EASING = "easeIn"; // "linear" | "easeIn" | "easeOut" | "easeInOut"

// Warps the shared 0..1 timeline so the *pen* eases across the whole signature
// (rather than easing each stroke on its own, which looks jittery). Maps a
// progress value to the fraction of DURATION elapsed when the pen reaches it.
function warp(u) {
  const k = 0.8; // curve strength (closer to 1 = subtler; smaller = stronger slow-start)
  switch (EASING) {
    case "easeIn":
      return Math.pow(u, k); // slow start, then accelerate
    case "easeOut":
      return 1 - Math.pow(1 - u, k);
    case "easeInOut":
      return u < 0.5 ? Math.pow(2 * u, k) / 2 : 1 - Math.pow(2 * (1 - u), k) / 2;
    default:
      return u;
  }
}

// Precompute each stroke's delay + duration from its slot in the eased timeline.
const timed = strokes.map((s) => {
  const delay = warp(s.start) * DURATION;
  const end = warp(s.start + s.frac) * DURATION;
  return {
    d: s.d,
    delay: delay.toFixed(3),
    dur: Math.max(end - delay, 0.001).toFixed(3),
  };
});
</script>

<style scoped>
.signature {
  --at-apply: "no-underline! inline-block leading-none";
  color: inherit;
}

.signature__svg {
  height: 2.9rem;
  width: auto;
  display: block;
  overflow: visible;
}

.signature__stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 18;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: draw var(--dur) linear var(--delay) forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signature__stroke {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
