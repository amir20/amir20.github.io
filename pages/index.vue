<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-6 page-title" style="view-transition-name: title">Hi there, my name is Amir.</h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 leading-normal">
      I'm a software engineer, mentor, and parent in the Bay Area. These days I lead a team at Netflix on the Discovery
      Platform. Before that I was at <a href="https://about.google" target="_blank" rel="noopener">Google</a>,
      <a target="_blank" rel="noopener" href="https://www.oracle.com/industries/utilities/opower-energy-efficiency/">Opower</a>,
      Capital One, and a couple of startups. The <NuxtLink to="/projects">projects</NuxtLink> page is the best place to
      see what I actually build.
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

