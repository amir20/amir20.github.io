<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-8 text-5xl">Hi there, my name is Amir.</h1>
    <p class="text-lg font-light">
      I am a software engineer, mentor and parent in San Francisco. I am currently an engineering manager at Netflix. Previously, I was at
      <a href="https://about.google" target="_blank" rel="noopener">Google</a>,
      <a target="_blank" rel="noopener" href="https://www.oracle.com/industries/utilities/opower-energy-efficiency/">Opower</a>, Capital One and a few other
      start ups.
    </p>
    <div class="flex flex-wrap mt-8 -m-2">
      <a class="bg-purple-500 btn hover:bg-purple-600" href="https://github.com/amir20">
        <div class="i-ph-github-logo-bold"></div>
        <span>GitHub</span>
      </a>
      <a class="bg-blue-500 btn hover:bg-blue-600" href="https://www.linkedin.com/in/amirraminfar">
        <div class="i-ph-linkedin-logo-bold"></div>
        <span>LinkedIn</span>
      </a>
      <a class="bg-green-600 btn hover:bg-green-700" href="https://stackoverflow.com/users/419075/amir-raminfar">
        <div class="i-ph-stack-overflow-logo-bold"></div>
        <span>Stack Overflow</span>
      </a>
    </div>
  </div>
</template>
<script setup></script>
<script>
import { multipier } from "../components/Waves.vue";
import { useHead } from "@vueuse/head";
export default {
  created() {
    useHead({
      title: "This is Amir | AmirRaminfar.me",
    });
  },
  mounted() {
    multipier.value = 9;
  },
};
</script>
<style scoped>
.btn {
  --at-apply: text-white py-2 px-4 m-2 rounded-3xl inline-flex items-center no-underline bg-opacity-90 "hover:bg-opacity-100" transition-colors gap-2;
}
</style>
