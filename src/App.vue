<template>
  <Waves />
  <div class="relative z-10 flex flex-col min-h-screen">
    <nav class="flex justify-start mx-6 my-5 gap-x-5 text-base" style="view-transition-name: nav">
      <Logo class="color-gray-800 dark:color-white fill-current mr-auto mt-1" />
      <router-link class="no-underline! text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 z-2 transition-colors font-medium tracking-wide uppercase text-sm" :to="path" v-for="{ title, path } in menu">{{ title }}</router-link>
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>
<script setup>
import { defineAsyncComponent } from "vue";
import Logo from "./images/ar.svg";
const Waves = defineAsyncComponent(() => import("./components/Waves.vue"));
const menu = {
  home: {
    title: "Home",
    path: "/",
  },
  about: {
    title: "About Me",
    path: "/about",
  },
  projects: {
    title: "Projects",
    path: "/projects",
  },
};
</script>
<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: all 150ms ease-out;
  @media (hover: none) {
    transition: none !important;
  }
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

nav a {
  position: relative;

  &[aria-current="page"] {
    --at-apply: "text-gray-900 dark:text-white";
  }

  &[aria-current="page"]::before {
    content: " ";
    --at-apply: "absolute w-full h-[2px] bottom-0 left-0 right-0 bg-gray-800 dark:bg-white";
    view-transition-name: selected;
  }
}
</style>
