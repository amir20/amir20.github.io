<template>
  <div class="w-auto md:w-3/4 lg:w-2/3">
    <h1 class="mb-2 page-title" style="view-transition-name: title">Gruper</h1>
    <p class="mb-10 text-lg text-gray-500 dark:text-gray-400">
      An AI tab grouper for Chrome.
    </p>

    <div class="mb-10 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      <video src="/gruper.mp4" autoplay loop muted playsinline preload="metadata" class="w-full block" />
    </div>

    <div class="space-y-6 text-lg leading-normal text-gray-600 dark:text-gray-300">
      <p>
        Gruper started from a simple frustration: I work with 40 to 80 tabs open and Chrome's manual tab groups never
        survive the next research detour. So Gruper does it for you. It looks at your open tabs and quietly clusters
        them by topic in the background, then renames the groups when the shape of your work shifts.
      </p>
      <p>
        Everything runs locally in the extension. There's no dashboard, no account, no server round trip on every page
        load. Open a window, work normally, and your tabs stay organized without you thinking about it.
      </p>
    </div>

    <div class="mt-10 flex flex-wrap gap-3">
      <GlassButton href="https://chromewebstore.google.com/detail/gruper/pebogmmlgobamgmpnjmheeafnmbampbh?authuser=0&hl=en">
        <span class="i-ph-google-chrome-logo-bold" aria-hidden="true" />
        <span>Chrome Web Store</span>
      </GlassButton>
      <GlassButton href="https://github.com/amir20/gruper">
        <span class="i-ph-github-logo-bold" aria-hidden="true" />
        <span>View on GitHub</span>
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
