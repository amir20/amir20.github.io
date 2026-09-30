// Shared wave height: each page sets its own value and Waves.vue springs toward it.
const multiplier = ref(2);

export function useWaveMultiplier() {
  return multiplier;
}
