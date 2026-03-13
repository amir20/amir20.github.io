<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-6 text-5xl md:text-6xl leading-tight" style="view-transition-name: title">Hi there, my name is Amir.</h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
      I am a software engineer, mentor and parent in San Francisco area. Currently, I am an engineering manager at Netflix. Previously, I have worked at
      <a href="https://about.google" target="_blank" rel="noopener">Google</a>,
      <a target="_blank" rel="noopener" href="https://www.oracle.com/industries/utilities/opower-energy-efficiency/">Opower</a>, Capital One and a few other
      start ups. See my <NuxtLink to="/projects">projects</NuxtLink> for more information.
    </p>
    <SocialButtons />
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

