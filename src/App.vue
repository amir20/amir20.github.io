<template>
  <Waves></Waves>
  <div class="relative z-10 flex flex-col min-h-screen">
    <nav class="flex justify-start m-4 gap-6 text-lg">
      <Logo class="color-blue-500 dark:color-white fill-current mr-auto" />
      <router-link class="no-underline hover:underline text-gray-700 dark:text-white" :to="path" v-for="{ title, path } in menu">{{ title }}</router-link>
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <router-view v-slot="{ Component }">
        <transition name="scale" mode="out-in">
          <component :is="Component" />
        </transition>
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
  transition: all 0.5s ease;
  @media (hover: none) {
    transition: none !important;
  }
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
