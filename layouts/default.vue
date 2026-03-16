<template>
  <div class="relative z-10 flex flex-col min-h-screen">
    <nav class="flex justify-start mx-6 my-5 gap-x-5 text-base" style="view-transition-name: nav">
      <Logo class="color-gray-800 dark:color-white fill-current mr-auto mt-1" />
      <NuxtLink
        class="no-underline! text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 z-2 transition-colors font-medium tracking-wide uppercase text-sm"
        :to="item.path"
        v-for="item in menu"
        :key="item.path"
        >{{ item.title }}</NuxtLink
      >
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Logo from "~/assets/images/ar.svg";
import { useNoise } from "~/composables/useNoise";
onMounted(() => {
  useNoise();
});

const menu = [
  { title: "Home", path: "/" },
  { title: "About Me", path: "/about" },
  { title: "Projects", path: "/projects" },
];
</script>

<style scoped>
nav a {
  position: relative;

  &.router-link-active {
    --at-apply: "text-gray-900 dark:text-white";
  }

  &.router-link-active::before {
    content: " ";
    --at-apply: "absolute w-full h-[2px] bottom-0 left-0 right-0 bg-[#b8513d] dark:bg-[#d4a87c]";
    view-transition-name: selected;
  }
}
</style>
