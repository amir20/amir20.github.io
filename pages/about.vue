<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-6 page-title" style="view-transition-name: title">Hello there.</h1>
    <div class="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
      <p>
        I've spent 18 years writing software and, for the last few of those, leading the people who write it. My work
        has spanned web products, infrastructure, recommendation systems, and developer tools, with stops at startups
        and large companies along the way. The thread through all of it is the same: ship something useful, then make
        it good.
      </p>

      <p>
        I was born in Iran, raised in Seattle, and started programming in high school. I studied computer science at
        George Washington University, then began my career at AOL working on movies, aol.com, music, and AIM. In 2011 I
        joined Opower to lead engineering on the Home Energy Reports product. In 2014 I co-founded Tilofy, a real-time
        news recommendation engine. I joined Google in 2019, working on internal CRM tools and later leading the growth
        team for Assistant Auto. Today I'm a manager at Netflix, leading the Discovery Platform team.
      </p>

      <p>
        I live in the East Bay with my wife and two kids. Outside of work I lift weights, play games, and keep
        <a href="/projects">a few open-source projects</a> alive (Dozzle being the largest). Most of what I learn ends
        up in one of them.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useWaveMultiplier } from "~/composables/useWaves";

useHead({
  title: "About | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 4;
});
</script>
