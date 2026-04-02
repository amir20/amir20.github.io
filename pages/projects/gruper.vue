<template>
  <div class="w-auto md:w-4/5 lg:w-2/3">
    <h1 class="mb-2 text-5xl md:text-6xl leading-tight" style="view-transition-name: title">Gruper</h1>
    <p class="mb-8 text-lg text-gray-500 dark:text-gray-400">
      A browser extension that automatically groups your open tabs using AI.
    </p>

    <div class="mb-10 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <video src="/gruper.mp4" autoplay loop muted playsinline class="w-full" />
    </div>

    <div class="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      <p>
        Gruper intelligently organizes your open browser tabs into groups using AI, so you can focus on what matters
        instead of drowning in a sea of tabs.
      </p>
      <p>
        It analyzes your open tabs and automatically creates logical groupings, keeping your browser tidy without any
        manual effort.
      </p>
    </div>

    <div class="mt-10 flex gap-4">
      <GlassButton href="https://chromewebstore.google.com/detail/gruper/pebogmmlgobamgmpnjmheeafnmbampbh?authuser=0&hl=en">
        <span class="i-ph-google-chrome-logo mr-2 text-lg" />
        Chrome Web Store
      </GlassButton>
      <GlassButton href="https://github.com/amir20/gruper">
        <span class="i-ph-github-logo mr-2 text-lg" />
        View on GitHub
      </GlassButton>
    </div>
  </div>
</template>

<script setup>
import { useWaveMultiplier } from "~/composables/useWaves";

useHead({
  title: "Gruper | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 1.5;
});
</script>
