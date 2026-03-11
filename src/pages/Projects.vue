<template>
  <div class="w-auto md:w-4/5 lg:w-2/3">
    <h1 class="mb-10 text-5xl md:text-6xl leading-tight" style="view-transition-name: title">Projects</h1>
    <div>
      <ul class="space-y-10 text-lg">
        <li class="md:flex" v-for="project in projects" :key="project.title">
          <div class="md:flex-shrink-0">
            <a class="mt-1 font-medium leading-tight" :href="project.link">
              <img :src="project.image" :alt="project.imageAlt" width="320" height="165" class="object-cover w-full rounded-lg shadow-sm md:w-60 border border-gray-200 dark:border-gray-700" />
            </a>
          </div>
          <div class="mt-8 md:mt-0 md:ml-8">
            <a class="mt-1 text-lg font-medium leading-tight" :href="project.link">{{ project.title }}</a>
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-400 leading-relaxed" v-html="project.description"></p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { multipier } from "../components/Waves.vue";
import { useHead } from "@vueuse/head";

const images = import.meta.glob("/src/images/*.png", { eager: true });

export default {
  data() {
    return {
      projects: [
        {
          title: "Dozzle for Docker",
          link: "https://dozzle.dev/",
          image: images["/src/images/dozzle.png"].default,
          imageAlt: "Dozzle screenshot",
          description: `Dozzle is a web application that provides an interface to monitor your
              <a href="https://www.docker.com/">Docker</a> containers and logs. It supports multiple hosts, Docker Swarm and Kubernetes.`,
        },
        {
          title: "dtop",
          link: "https://dtop.dev/",
          image: images["/src/images/dtop.png"].default,
          imageAlt: "dtop screenshot",
          description: `dtop is a TUI application for monitoring Docker containers across multiple hosts with real-time CPU, memory, and network metrics. Built with Rust which uses minimal dependencies and is highly performant.`,
        },
        {
          title: "PhantomJS integration for NodeJS",
          link: "https://github.com/amir20/phantomjs-node",
          image: images["/src/images/phantom.png"].default,
          imageAlt: "Phantom screenshot",
          description: `Phantom is a module for integrating <a href="https://phantomjs.org/">PhantomJs</a> with Node. This project is no longer maintained because
              PhantomJs has been deprecated.`,
        },
        {
          title: "Clashleaders.com",
          link: "https://www.clashleaders.com/",
          image: images["/src/images/clashleaders.png"].default,
          imageAlt: "Clashleaders screenshot",
          description: `Clashleaders was a website for the <a href="https://supercell.com/en/games/clashofclans/">Clash of Clans</a> game, created to help players track their progress and compete. However, it became too time-consuming to maintain, so I decided to shut it down and focus on other projects.`,
        },
      ],
    };
  },
  created() {
    useHead({
      title: "Projects | AmirRaminfar.me",
    });
  },
  mounted() {
    multipier.value = 1.5;
  },
};
</script>
<style scoped></style>
