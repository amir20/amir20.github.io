import { ref } from "vue";

const multiplier = ref(2);

export function useWaveMultiplier() {
  return multiplier;
}
