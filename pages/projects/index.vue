<template>
  <div class="w-auto md:w-4/5 lg:w-2/3">
    <h1 class="mb-6 page-title" style="view-transition-name: title">Projects</h1>
    <div>
      <ul class="space-y-10 text-lg">
        <li class="md:flex" v-for="(project, i) in projects" :key="project.title">
          <div class="md:flex-shrink-0">
            <NuxtLink class="mt-1 font-medium leading-tight" :to="project.link">
              <img
                :src="project.image"
                :alt="project.imageAlt"
                width="320"
                height="165"
                :loading="i === 0 ? 'eager' : 'lazy'"
                decoding="async"
                class="object-cover w-full rounded-lg shadow-sm md:w-60 border border-gray-200 dark:border-gray-700"
              />
            </NuxtLink>
          </div>
          <div class="mt-6 md:mt-0 md:ml-8">
            <NuxtLink class="text-lg font-medium leading-tight" :to="project.link">{{ project.title }}</NuxtLink>
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-300 leading-relaxed" v-html="project.description"></p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useWaveMultiplier } from "~/composables/useWaves";
import dozzle from "~/assets/images/dozzle-thumb.png";
import dtop from "~/assets/images/dtop.png";
import phantom from "~/assets/images/phantom.png";
import clashleaders from "~/assets/images/clashleaders.png";
import gruperPoster from "~/assets/images/gruper-poster.jpg";

useHead({
  title: "Projects | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 2.5;
});

const projects = [
  {
    title: "Dozzle",
    link: "/projects/dozzle",
    image: dozzle,
    imageAlt: "Dozzle screenshot",
    description: `A lightweight web UI for tailing <a href="https://www.docker.com/">Docker</a> logs in real time, across hosts, Swarm, and Kubernetes. Dozzle Cloud adds AI summaries, smart alerts, and a chat agent on top of self-hosted instances.`,
  },
  {
    title: "dtop",
    link: "https://dtop.dev/",
    image: dtop,
    imageAlt: "dtop screenshot",
    description: `A terminal UI for watching Docker containers across hosts: CPU, memory, network, all live. Written in Rust with very few dependencies.`,
  },
  {
    title: "Gruper",
    link: "/projects/gruper",
    image: gruperPoster,
    imageAlt: "Gruper demo",
    description: `A browser extension that groups your open tabs with AI, so you stop drowning in 60-tab sessions.`,
  },
  {
    title: "PhantomJS for Node.js",
    link: "https://github.com/amir20/phantomjs-node",
    image: phantom,
    imageAlt: "Phantom screenshot",
    description: `A bridge between Node and <a href="https://phantomjs.org/">PhantomJS</a>. Archived; PhantomJS itself is no longer maintained.`,
  },
  {
    title: "Clashleaders.com",
    link: "https://www.clashleaders.com/",
    image: clashleaders,
    imageAlt: "Clashleaders screenshot",
    description: `A stats and leaderboard site for <a href="https://supercell.com/en/games/clashofclans/">Clash of Clans</a> players. I ran it for years before retiring it to free up time.`,
  },
];
</script>
