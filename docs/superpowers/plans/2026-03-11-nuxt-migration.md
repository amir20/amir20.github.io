# Nuxt 3 Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Vue 3 + Vite SSG portfolio site to Nuxt 3 with static prerendering (`nuxt generate`) for GitHub Pages deployment.

**Architecture:** Nuxt 3 with file-based routing, `@unocss/nuxt` for styling, `nuxt-svgo` for SVG components, `@nuxtjs/google-fonts` for self-hosted fonts, and `experimental.viewTransition` for the View Transitions API. D3 wave animation runs client-only via `<ClientOnly>`. All output is prerendered static HTML.

**Tech Stack:** Nuxt 3, UnoCSS, D3.js, LightningCSS, nuxt-svgo, @nuxtjs/google-fonts

**Spec:** `docs/superpowers/specs/2026-03-11-nuxt-migration-design.md`

---

## Chunk 1: Scaffold and Dependencies

### Task 1: Install Nuxt and update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove old dependencies and add Nuxt**

Run:
```bash
pnpm remove vite-ssg vue-router @vueuse/head @vitejs/plugin-vue @vue/compiler-sfc @vue/server-renderer vite-plugin-webfont-dl vite-svg-loader cross-env vite beasties serve-static unplugin-icons d3
pnpm add nuxt @unocss/nuxt nuxt-svgo @nuxtjs/google-fonts
pnpm add -D lightningcss
```

Note: `lightningcss` moves to devDependencies. `d3` umbrella removed (individual `d3-selection`, `d3-shape`, `d3-timer` are kept).

- [ ] **Step 2: Update scripts in package.json**

Change `scripts` in `package.json` to:
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt generate",
    "preview": "nuxt preview"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: swap dependencies from Vite SSG to Nuxt 3"
```

### Task 2: Create nuxt.config.ts

**Files:**
- Create: `nuxt.config.ts`

- [ ] **Step 1: Write nuxt.config.ts**

Create `nuxt.config.ts` at project root:

```ts
export default defineNuxtConfig({
  ssr: true,

  nitro: {
    prerender: {
      routes: ["/", "/about", "/projects"],
    },
  },

  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/custom.css"],

  modules: ["@unocss/nuxt", "nuxt-svgo", "@nuxtjs/google-fonts"],

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
        class:
          "text-gray-700 transition-colors bg-cream dark:bg-gray-900 dark:text-gray-300",
      },
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  experimental: {
    viewTransition: true,
  },

  googleFonts: {
    families: {
      "Playfair Display": { wght: "400..900", ital: "400..900" },
      Roboto: [100, 300, 400, 500, 700, 900],
    },
    download: true,
    display: "swap",
  },

  svgo: {
    defaultImport: "component",
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              convertPathData: false,
            },
          },
        },
      ],
    },
  },

  vite: {
    css: {
      transformer: "lightningcss",
    },
    build: {
      cssMinify: "lightningcss",
    },
  },

  compatibilityDate: "2026-03-11",
});
```

- [ ] **Step 2: Commit**

```bash
git add nuxt.config.ts
git commit -m "chore: add nuxt.config.ts with all module configuration"
```

## Chunk 2: File Structure and Assets

### Task 3: Create Nuxt directory structure and move assets

**Files:**
- Create: `app.vue`
- Create: `layouts/` directory
- Create: `pages/` directory
- Create: `components/` directory
- Create: `composables/` directory
- Create: `assets/css/` directory
- Create: `assets/images/` directory
- Move: `favicon.svg` → `public/favicon.svg`
- Move: `src/custom.css` → `assets/css/custom.css`
- Move: `src/images/*.png` → `assets/images/`
- Move: `src/images/ar.svg` → `assets/images/ar.svg`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p layouts pages components composables assets/css assets/images
```

- [ ] **Step 2: Move assets to Nuxt locations**

```bash
cp src/custom.css assets/css/custom.css
cp src/images/ar.svg assets/images/ar.svg
cp src/images/dozzle.png assets/images/dozzle.png
cp src/images/dtop.png assets/images/dtop.png
cp src/images/phantom.png assets/images/phantom.png
cp src/images/clashleaders.png assets/images/clashleaders.png
cp favicon.svg public/favicon.svg
```

Note: Using `cp` instead of `mv` so the old site still works until cleanup. The `public/` directory already exists with `CNAME` and `resume/`.

- [ ] **Step 3: Create minimal app.vue**

Create `app.vue`:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add app.vue layouts/ pages/ components/ composables/ assets/ public/favicon.svg
git commit -m "chore: create Nuxt directory structure and copy assets"
```

## Chunk 3: Composable and Components

### Task 4: Create wave multiplier composable

**Files:**
- Create: `composables/useWaves.ts`

- [ ] **Step 1: Write the composable**

Create `composables/useWaves.ts`:

```ts
import { ref } from "vue";

const multiplier = ref(2);

export function useWaveMultiplier() {
  return multiplier;
}
```

- [ ] **Step 2: Commit**

```bash
git add composables/useWaves.ts
git commit -m "feat: add useWaveMultiplier composable for shared wave state"
```

### Task 5: Port Waves component

**Files:**
- Create: `components/Waves.vue`
- Reference: `src/components/Waves.vue` (current source)

- [ ] **Step 1: Write Waves.vue using composable**

Create `components/Waves.vue` — copy from `src/components/Waves.vue` with these changes:
- Replace `export const multipier = ref(2);` with `import { useWaveMultiplier } from '~/composables/useWaves';`
- Add `const multipier = useWaveMultiplier();` inside the component's `data()` setup area
- In the `step()` method, reference `multipier.value` (which now comes from the composable)

The component stays Options API since it heavily uses `this.$el` and D3 DOM manipulation. Full file:

```vue
<template>
  <div></div>
</template>

<script>
import { select } from "d3-selection";
import { line, curveBasis } from "d3-shape";
import { timer } from "d3-timer";
import { useWaveMultiplier } from "~/composables/useWaves";

const d3 = Object.assign({}, { select, line, curveBasis, timer });
const shape = d3.line().curve(d3.curveBasis);
const multipier = useWaveMultiplier();

export default {
  data() {
    return {
      vis: null,
      points: 6,
      mousePosition: [500, 700],
      wavesCount: 4,
      waves: [],
      paths: [],
      pathHeights: [],
      seeds: [],
      w: null,
      h: null,
    };
  },
  mounted() {
    this.vis = d3.select(this.$el).append("svg").attr("pointer-events", "all");

    for (let i = 0; i < this.wavesCount; i++) {
      this.waves.push(
        this.vis
          .append("path")
          .attr("class", "wave")
          .style("opacity", (i + 1) / this.wavesCount / 2),
      );
      this.paths.push([]);
      this.seeds.push(Math.random());
    }

    this.init();
    d3.timer(this.step);

    window.addEventListener("mousemove", (e) => {
      this.mousePosition[0] = Math.min(e.clientX, 200) + 250;
      this.mousePosition[1] = Math.min(e.clientY, 300) + 600;
    });

    window.addEventListener("resize", this.init);
  },
  methods: {
    init() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.vis.attr("width", this.w).attr("height", this.h);

      for (let i = 0; i < this.wavesCount; i++) {
        const path = this.paths[i];

        path[0] = [-200 * Math.random(), this.h];
        for (let j = 0; j < this.points; j++) {
          path[j + 1] = [(this.w / this.points) * j, path[j + 1] || this.h / 4];
        }
        path[this.points + 1] = [this.w + Math.random() * 200, this.h];
        this.paths[i] = path;
        this.pathHeights[i] = this.h / 2;
      }
    },
    step(elapsed) {
      for (let i = 0; i < this.wavesCount; i++) {
        this.pathHeights[i] += (this.h / multipier.value - (this.mousePosition[1] / 3 + this.mousePosition[0] / 3 + 200) - this.pathHeights[i]) / 10;
        this.update(elapsed, this.pathHeights[i], this.waves[i], this.paths[i], this.seeds[i]);
      }
    },
    update(elapsed, height, wave, path, seed) {
      for (let i = 1; i < this.points + 1; i++) {
        const sinSeed = ((seed / 2 + 0.2) * elapsed) / 6 + (i + (i % 10)) * 100 + seed * 500;
        path[i][1] = Math.sin(sinSeed / 100) * Math.sin(sinSeed / 200) * height + (this.h - 20 - seed * 10);
      }

      wave.attr("d", shape(path));
    },
  },
};
</script>
<style scoped>
div {
  z-index: 1;
  opacity: 0.8;
  position: fixed;
  bottom: -10px;
  view-transition-name: waves;

  :deep(.wave:nth-of-type(1)) {
    fill: #8b7355;
  }

  :deep(.wave:nth-of-type(2)) {
    fill: #b8a590;
  }

  :deep(.wave:nth-of-type(3)) {
    fill: #6b8f9e;
  }

  :deep(.wave:nth-of-type(4)) {
    fill: #2d4a56;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add components/Waves.vue
git commit -m "feat: port Waves component to use composable for multiplier"
```

## Chunk 4: Layout and Pages

### Task 6: Create default layout

**Files:**
- Create: `layouts/default.vue`
- Reference: `src/App.vue` (current source)

- [ ] **Step 1: Write layouts/default.vue**

Create `layouts/default.vue`:

```vue
<template>
  <ClientOnly>
    <Waves />
  </ClientOnly>
  <div class="relative z-10 flex flex-col min-h-screen">
    <nav class="flex justify-start mx-6 my-5 gap-x-5 text-base" style="view-transition-name: nav">
      <Logo class="color-gray-800 dark:color-white fill-current mr-auto mt-1" />
      <NuxtLink
        class="no-underline! text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 z-2 transition-colors font-medium tracking-wide uppercase text-sm"
        :to="item.path"
        v-for="item in menu"
        :key="item.path"
      >{{ item.title }}</NuxtLink>
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Logo from "~/assets/images/ar.svg";

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
    --at-apply: "absolute w-full h-[2px] bottom-0 left-0 right-0 bg-gray-800 dark:bg-white";
    view-transition-name: selected;
  }
}
</style>
```

Note: Changed `menu` from object to array for cleaner `v-for`. Added `:key`. NuxtLink uses `.router-link-active` class automatically.

- [ ] **Step 2: Commit**

```bash
git add layouts/default.vue
git commit -m "feat: add default layout with nav, waves, and slot"
```

### Task 7: Port Home page

**Files:**
- Create: `pages/index.vue`
- Reference: `src/pages/Home.vue` (current source)

- [ ] **Step 1: Write pages/index.vue**

Create `pages/index.vue`:

```vue
<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="mb-6 text-5xl md:text-6xl leading-tight" style="view-transition-name: title">Hi there, my name is Amir.</h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
      I am a software engineer, mentor and parent in San Francisco area. Currently, I am an engineering manager at Netflix. Previously, I have worked at
      <a href="https://about.google" target="_blank" rel="noopener">Google</a>,
      <a target="_blank" rel="noopener" href="https://www.oracle.com/industries/utilities/opower-energy-efficiency/">Opower</a>, Capital One and a few other
      start ups. See my <NuxtLink to="/projects">projects</NuxtLink> for more information.
    </p>
    <div class="flex flex-wrap mt-10 gap-3">
      <a class="btn" href="https://github.com/amir20">
        <div class="i-ph-github-logo-bold"></div>
        <span>GitHub</span>
      </a>
      <a class="btn" href="https://www.linkedin.com/in/amirraminfar">
        <div class="i-ph-linkedin-logo-bold"></div>
        <span>LinkedIn</span>
      </a>
      <a class="btn" href="https://stackoverflow.com/users/419075/amir-raminfar">
        <div class="i-ph-stack-overflow-logo-bold"></div>
        <span>Stack Overflow</span>
      </a>
    </div>
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

<style scoped>
.btn {
  --at-apply: text-gray-700 dark:text-gray-200 py-2.5 px-5 rounded-lg inline-flex items-center no-underline border border-gray-300 dark:border-gray-600 "hover:bg-gray-800 hover:text-white hover:border-gray-800 dark:hover:bg-white dark:hover:text-gray-900 dark:hover:border-white" transition-all duration-200 gap-2 text-sm font-medium tracking-wide;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add pages/index.vue
git commit -m "feat: port Home page to Nuxt"
```

### Task 8: Port About page

**Files:**
- Create: `pages/about.vue`
- Reference: `src/pages/About.vue` (current source)

- [ ] **Step 1: Write pages/about.vue**

Create `pages/about.vue`:

```vue
<template>
  <div class="w-auto md:w-3/4 lg:w-1/2">
    <h1 class="text-5xl md:text-6xl mb-2 leading-tight" style="view-transition-name: title">Hello there.</h1>
    <div class="prose text-lg max-w-full text-gray-600 dark:text-gray-400 leading-relaxed">
      <p>
        I am a software engineer and manager with 18 years of experience, having worked at startups, large corporations, and as a co-founder of my own startup.
        My projects have ranged from web development to infrastructure, and I have managed engineering teams and served as a technical lead. I am passionate
        about building products and teams, constantly seeking new challenges and opportunities for growth.
      </p>

      <p>
        Born in Iran and raised in Seattle, I started programming in high school and went on to study computer science at George Washington University. My
        career began at AOL, where I worked on movies, aol.com, music, and AIM. In 2011, I joined Opower to lead the development of the Home Energy Reports
        product. Later, I co-founded Tilofy in 2014, creating a news recommendation engine for real-time content. I joined Google in 2019, where I worked on
        internal CRM systems and led the growth team for Assistant Auto. Currently, I am a manager at Netflix, leading the Discovery Platform team.
      </p>

      <p>
        I live in the East Bay with my wife and two kids. In my free time, I enjoy weightlifting, playing games, and working on open source projects, which keep
        me engaged and connected to the broader tech community.
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
  useWaveMultiplier().value = 2;
});
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/about.vue
git commit -m "feat: port About page to Nuxt"
```

### Task 9: Port Projects page

**Files:**
- Create: `pages/projects.vue`
- Reference: `src/pages/Projects.vue` (current source)

- [ ] **Step 1: Write pages/projects.vue**

Create `pages/projects.vue`:

```vue
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

<script setup>
import { useWaveMultiplier } from "~/composables/useWaves";
import dozzle from "~/assets/images/dozzle.png";
import dtop from "~/assets/images/dtop.png";
import phantom from "~/assets/images/phantom.png";
import clashleaders from "~/assets/images/clashleaders.png";

useHead({
  title: "Projects | AmirRaminfar.me",
});

onMounted(() => {
  useWaveMultiplier().value = 1.5;
});

const projects = [
  {
    title: "Dozzle for Docker",
    link: "https://dozzle.dev/",
    image: dozzle,
    imageAlt: "Dozzle screenshot",
    description: `Dozzle is a web application that provides an interface to monitor your
        <a href="https://www.docker.com/">Docker</a> containers and logs. It supports multiple hosts, Docker Swarm and Kubernetes.`,
  },
  {
    title: "dtop",
    link: "https://dtop.dev/",
    image: dtop,
    imageAlt: "dtop screenshot",
    description: `dtop is a TUI application for monitoring Docker containers across multiple hosts with real-time CPU, memory, and network metrics. Built with Rust which uses minimal dependencies and is highly performant.`,
  },
  {
    title: "PhantomJS integration for NodeJS",
    link: "https://github.com/amir20/phantomjs-node",
    image: phantom,
    imageAlt: "Phantom screenshot",
    description: `Phantom is a module for integrating <a href="https://phantomjs.org/">PhantomJs</a> with Node. This project is no longer maintained because
        PhantomJs has been deprecated.`,
  },
  {
    title: "Clashleaders.com",
    link: "https://www.clashleaders.com/",
    image: clashleaders,
    imageAlt: "Clashleaders screenshot",
    description: `Clashleaders was a website for the <a href="https://supercell.com/en/games/clashofclans/">Clash of Clans</a> game, created to help players track their progress and compete. However, it became too time-consuming to maintain, so I decided to shut it down and focus on other projects.`,
  },
];
</script>
```

- [ ] **Step 2: Commit**

```bash
git add pages/projects.vue
git commit -m "feat: port Projects page to Nuxt"
```

## Chunk 5: Verify and Cleanup

### Task 10: Verify static generation works

- [ ] **Step 1: Run nuxt generate**

```bash
pnpm build
```

Expected: Build completes successfully, generates `.output/public/` with `index.html`, `about/index.html`, `projects/index.html`, plus CNAME and resume files.

- [ ] **Step 2: Check generated output**

```bash
ls .output/public/
ls .output/public/about/
ls .output/public/projects/
cat .output/public/CNAME
```

Expected: All HTML files present. CNAME contains `amirraminfar.com`. Resume directory preserved.

- [ ] **Step 3: Run dev server and visually verify**

```bash
pnpm dev
```

Manually check:
- Home page loads with waves animation, social buttons, correct heading
- About page loads with bio text
- Projects page loads with project images and descriptions
- Navigation works between pages with view transitions
- Dark mode works
- Waves respond to mouse movement

### Task 11: Clean up old files

**Files:**
- Remove: `src/` (entire directory)
- Remove: `vite.config.ts`
- Remove: `jsconfig.json`
- Remove: `index.html`
- Remove: root-level `favicon.svg` (now in `public/`)
- Modify: `.gitignore`
- Modify: `netlify.toml`

- [ ] **Step 1: Remove old source files**

```bash
rm -rf src/
rm vite.config.ts
rm jsconfig.json
rm index.html
rm favicon.svg
```

- [ ] **Step 2: Update .gitignore**

Replace contents of `.gitignore` with:

```
node_modules
.nuxt/
.output/
.nitro/
bun.lock
```

- [ ] **Step 3: Update netlify.toml**

Replace contents of `netlify.toml` with:

```toml
[build]
command = "pnpm build"
publish = ".output/public"
```

- [ ] **Step 4: Verify build still works after cleanup**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old Vite SSG files and update config for Nuxt"
```

### Task 12: Final verification

- [ ] **Step 1: Run dev server one final time**

```bash
pnpm dev
```

Verify all pages, navigation, waves, dark mode, and view transitions work.

- [ ] **Step 2: Run generate one final time**

```bash
pnpm build
```

Verify clean build with all routes prerendered.

- [ ] **Step 3: Preview generated site**

```bash
pnpm preview
```

Verify the static output serves correctly.
