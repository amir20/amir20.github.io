<template>
  <div class="w-auto md:w-3/4 lg:w-2/3">
    <h1 class="mb-2 page-title" style="view-transition-name: title">Dozzle</h1>
    <p class="mb-10 text-lg text-gray-500 dark:text-gray-400">
      A lightweight, web-based log viewer for Docker, Swarm, and Kubernetes.
    </p>

    <div class="mb-10 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 relative" style="aspect-ratio: 1920 / 1298;">
      <button
        v-if="!playing"
        type="button"
        @click="playing = true"
        class="absolute inset-0 w-full h-full p-0 m-0 border-0 bg-transparent cursor-pointer"
        aria-label="Play the Dozzle demo video"
      >
        <picture>
          <source :srcset="dozzleWebp" type="image/webp" />
          <img
            :src="dozzlePng"
            alt="Dozzle landing page showing supported platforms and feature cards"
            width="1920"
            height="1298"
            loading="eager"
            decoding="async"
            class="w-full h-full object-cover block"
          />
        </picture>
        <span class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span class="i-ph-play-circle-fill text-7xl text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" />
        </span>
      </button>
      <iframe
        v-else
        class="absolute inset-0 w-full h-full"
        src="https://www.youtube-nocookie.com/embed/ztjlsmJcVnE?autoplay=1&rel=0"
        title="Dozzle demo"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
    </div>

    <div class="space-y-6 text-lg leading-normal text-gray-600 dark:text-gray-300">
      <p>
        Dozzle started as a weekend project to scratch a real itch: I wanted to read Docker logs in a browser without
        running a heavy stack like ELK or Loki. It grew from there. Today it streams logs in real time, shows live CPU
        and memory metrics, groups stack traces, parses JSON, and connects multiple hosts, Swarm clusters, and
        Kubernetes installations from a single interface. It is sponsored by
        <a href="https://www.docker.com/">Docker OSS</a> and ships as a tiny Go binary with a Vue 3 frontend.
      </p>
      <p>
        The thing I am most proud of is what is missing. There is no agent to install, no database to provision, no
        retention policy to configure. You point Dozzle at a Docker socket and it works. That keeps it useful as a
        dev-machine tool, a homelab dashboard, or a quick triage UI in production.
      </p>

      <h2 class="text-3xl mt-12 mb-4">Dozzle Cloud</h2>
      <p>
        <a href="https://dozzle.dev/guide/dozzle-cloud">Dozzle Cloud</a> is the optional managed layer on top. It links
        your self-hosted instances and adds the things that get hard once you are running Dozzle across more than one
        environment: AI-summarized alerts that cluster similar errors so you stop getting paged for the same thing
        twelve times, daily digests of error patterns and infrastructure health, and a chat agent that lets you ask
        questions about your containers in Slack, Telegram, or Discord and act on the answers (restart, stop, inspect)
        without leaving the conversation.
      </p>
      <p>
        Dozzle itself stays fully open source and self-hosted; Cloud is opt-in, and the free tier is intentionally
        generous. I love building things people love, so I would rather you actually use it than bounce off a paywall.
        If you try it, <a href="https://github.com/amir20/dozzle/discussions">tell me what works and what doesn't</a>.
        I want Dozzle Cloud to become the personal SRE assistant you never knew you wanted.
      </p>
    </div>

    <div class="mt-10 flex flex-wrap gap-3">
      <GlassButton href="https://dozzle.dev/">
        <span class="i-ph-globe-bold" aria-hidden="true" />
        <span>Dozzle</span>
      </GlassButton>
      <GlassButton href="https://dozzle.dev/guide/dozzle-cloud">
        <span class="i-ph-cloud-bold" aria-hidden="true" />
        <span>Dozzle Cloud</span>
      </GlassButton>
      <GlassButton href="https://github.com/amir20/dozzle">
        <span class="i-ph-github-logo-bold" aria-hidden="true" />
        <span>GitHub</span>
      </GlassButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useWaveMultiplier } from "~/composables/useWaves";
import dozzlePng from "~/assets/images/dozzle.png";
import dozzleWebp from "~/assets/images/dozzle.webp";

const playing = ref(false);

useHead({
  title: "Dozzle | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 1.5;
});
</script>
