<template>
  <div class="w-auto md:w-3/4 lg:w-1/2 prose text-lg">
    <h1>Hello there.</h1>
    <p>
      I am a software engineer and manager with 18 years of experience, having worked at startups, large corporations, and as a co-founder of my own startup. My
      projects have ranged from web development to infrastructure, and I have managed engineering teams and served as a technical lead. I am passionate about
      building products and teams, constantly seeking new challenges and opportunities for growth.
    </p>

    <p>
      Born in Iran and raised in Seattle, I started programming in high school and went on to study computer science at George Washington University. My career
      began at AOL, where I worked on movies, aol.com, music, and AIM. In 2011, I joined Opower to lead the development of the Home Energy Reports product.
      Later, I co-founded Tilofy in 2014, creating a news recommendation engine for real-time content. I joined Google in 2019, where I worked on internal CRM systems and led the
      growth team for Assistant Auto. Currently, I am a manager at Netflix, leading the Discovery Platform team.
    </p>

    <p>
      I live in the East Bay with my wife and two kids. In my free time, I enjoy weightlifting, playing games, and working on open source projects, which keep
      me engaged and connected to the broader tech community.
    </p>
  </div>
</template>
<script>
import { multipier } from "../components/Waves.vue";
import { useHead } from "@vueuse/head";
export default {
  created() {
    useHead({
      title: "About | AmirRaminfar.me",
    });
  },
  mounted() {
    multipier.value = 2;
  },
};
</script>
<style scoped></style>
