<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-6 text-5xl md:text-6xl leading-tight" style="view-transition-name: title">Hi there, my name is Amir.</h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
      I am a software engineer, mentor and parent in San Francisco area. Currently, I am an engineering manager at Netflix. Previously, I have worked at
      <a href="https://about.google" target="_blank" rel="noopener">Google</a>,
      <a target="_blank" rel="noopener" href="https://www.oracle.com/industries/utilities/opower-energy-efficiency/">Opower</a>, Capital One and a few other
      start ups. See my <NuxtLink to="/projects">projects</NuxtLink> for more information.
    </p>
    <div class="flex flex-wrap mt-10 gap-3">
      <a class="btn" href="https://github.com/amir20">
        <div class="i-ph-github-logo-bold"></div>
        <span>GitHub</span>
      </a>
      <a class="btn" href="https://www.linkedin.com/in/amirraminfar">
        <div class="i-ph-linkedin-logo-bold"></div>
        <span>LinkedIn</span>
      </a>
      <a class="btn" href="https://stackoverflow.com/users/419075/amir-raminfar">
        <div class="i-ph-stack-overflow-logo-bold"></div>
        <span>Stack Overflow</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useWaveMultiplier } from "~/composables/useWaves";

useHead({
  title: "This is Amir | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 9;
});
</script>

<style scoped>
.btn {
  --at-apply: text-gray-700 dark:text-gray-200 py-2.5 px-5 rounded-lg inline-flex items-center no-underline border border-gray-300 dark:border-gray-600 "hover:bg-[#2d6b72] hover:text-white hover:border-[#2d6b72] dark:hover:bg-[#5a9ea8] dark:hover:text-gray-900 dark:hover:border-[#5a9ea8]" transition-all duration-200 gap-2 text-sm font-medium tracking-wide;
}
</style>
