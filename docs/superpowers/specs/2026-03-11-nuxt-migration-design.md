# Nuxt 3 Migration Design

## Goal

Migrate the personal portfolio site from Vue 3 + Vite SSG to Nuxt 3 with static prerendering (`nuxt generate`). The output is pure static HTML deployed to GitHub Pages. No server runtime.

## Constraints

- GitHub Pages hosting: no Node server, prerendered HTML only
- 1:1 feature parity with current site — no new features
- Preserve all current styling (UnoCSS, custom CSS, dark mode, view transitions)
- Preserve D3 animated waves (client-only)
- Self-hosted fonts (match current `vite-plugin-webfont-dl` behavior)

## File Structure

```
├── app.vue                    # Root component (minimal, just <NuxtLayout> + <NuxtPage>)
├── layouts/
│   └── default.vue            # Nav + Waves + <slot> (from current App.vue)
├── pages/
│   ├── index.vue              # Home (from Home.vue)
│   ├── about.vue              # About (from About.vue)
│   └── projects.vue           # Projects (from Projects.vue)
├── components/
│   └── Waves.vue              # D3 wave background (auto-imported)
├── composables/
│   └── useWaves.ts            # Shared wave multiplier state
├── assets/
│   ├── css/
│   │   └── custom.css         # Global typography and link styles
│   └── images/
│       ├── ar.svg
│       ├── dozzle.png
│       ├── dtop.png
│       ├── phantom.png
│       └── clashleaders.png
├── public/
│   ├── favicon.svg            # Static favicon (moved from project root)
│   ├── CNAME                  # GitHub Pages custom domain (amirraminfar.com) — preserved
│   └── resume/                # Resume PDF and LaTeX source — preserved
│       ├── amir_raminfar_resume.pdf
│       └── amir_raminfar_resume.tex
├── nuxt.config.ts             # Nuxt configuration
├── uno.config.ts              # UnoCSS config (unchanged)
└── package.json
```

## Component Migration

### app.vue

Minimal root:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

### layouts/default.vue

Derived from current `App.vue`:

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
        :to="path"
        v-for="{ title, path } in menu"
      >{{ title }}</NuxtLink>
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Logo from '~/assets/images/ar.svg'

const menu = {
  home: { title: 'Home', path: '/' },
  about: { title: 'About Me', path: '/about' },
  projects: { title: 'Projects', path: '/projects' },
}
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

Key changes from `App.vue`:
- `<router-view>` becomes `<slot />`
- `<router-link>` becomes `<NuxtLink>`
- `defineAsyncComponent` for Waves replaced by `<ClientOnly>` wrapper
- `aria-current="page"` selector becomes `.router-link-active` (Nuxt's default)
- Scale transition CSS classes removed (replaced by Nuxt view transitions)

### pages/index.vue

From `Home.vue`. Refactored to `<script setup>` with Nuxt auto-imports:

```vue
<script setup>
import { useWaveMultiplier } from '~/composables/useWaves'

useHead({
  title: 'This is Amir | AmirRaminfar.me',
})

onMounted(() => {
  useWaveMultiplier().value = 9
})
</script>
```

- `useHead()` auto-imported from Nuxt (no import needed)
- `onMounted` auto-imported from Vue
- `<router-link>` becomes `<NuxtLink>`

### pages/about.vue

From `About.vue`. Same `<script setup>` refactor pattern.

### pages/projects.vue

From `Projects.vue`:
- Image imports change from `import.meta.glob("/src/images/*.png")` to direct imports:

```ts
import dozzle from '~/assets/images/dozzle.png'
import dtop from '~/assets/images/dtop.png'
import phantom from '~/assets/images/phantom.png'
import clashleaders from '~/assets/images/clashleaders.png'
```

### composables/useWaves.ts

Extract the shared `multipier` ref from `Waves.vue` into a composable to avoid module-level state sharing issues during SSR prerendering:

```ts
const multiplier = ref(2)

export function useWaveMultiplier() {
  return multiplier
}
```

`Waves.vue` and all pages import from here instead of exporting/importing a ref from the component file.

### components/Waves.vue

Mostly unchanged. Key changes:
- Remove the exported `multipier` ref; import from `~/composables/useWaves` instead
- Must always be inside `<ClientOnly>` since it uses `window`, `document`, D3 DOM APIs, and `this.$el`

### SVG Logo (ar.svg)

Use `nuxt-svgo` module for inline SVG component behavior (same as current `vite-svg-loader`). Preserve the SVGO config that disables `convertPathData` to avoid SVG rendering changes.

## Configuration

### nuxt.config.ts

```ts
export default defineNuxtConfig({
  ssr: true,

  nitro: {
    prerender: {
      routes: ['/', '/about', '/projects'],
    },
  },

  css: [
    '@unocss/reset/tailwind-compat.css',
    '~/assets/css/custom.css',
  ],

  modules: [
    '@unocss/nuxt',
    'nuxt-svgo',
    '@nuxtjs/google-fonts',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
        class: 'text-gray-700 transition-colors bg-cream dark:bg-gray-900 dark:text-gray-300',
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  // Native View Transitions API (replaces manual router.beforeResolve hook)
  experimental: {
    viewTransition: true,
  },

  // Self-host Google Fonts at build time (matches vite-plugin-webfont-dl behavior)
  googleFonts: {
    families: {
      'Playfair Display': { wght: '400..900', ital: '400..900' },
      'Roboto': [100, 300, 400, 500, 700, 900],
    },
    download: true,
    display: 'swap',
  },

  svgo: {
    defaultImport: 'component',
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              convertPathData: false,
            },
          },
        },
      ],
    },
  },

  // Preserve LightningCSS behavior from current Vite config
  vite: {
    css: {
      transformer: 'lightningcss',
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },

  compatibilityDate: '2026-03-11',
})
```

### UnoCSS

`uno.config.ts` stays unchanged. The `@unocss/nuxt` module picks it up automatically.

### View Transitions

Use Nuxt's `experimental: { viewTransition: true }` which provides the same `document.startViewTransition()` wrapping that the current `router.beforeResolve` hook does. The `style="view-transition-name: ..."` attributes on elements stay as-is.

## Packages

### Remove
- `vite-ssg`
- `vue-router` (bundled with Nuxt)
- `@vueuse/head` (Nuxt has `useHead` built-in)
- `@vitejs/plugin-vue` (bundled with Nuxt)
- `@vue/compiler-sfc` (bundled with Nuxt)
- `@vue/server-renderer` (bundled with Nuxt)
- `vite-plugin-webfont-dl` (replaced by `@nuxtjs/google-fonts`)
- `vite-svg-loader` (replaced by `nuxt-svgo`)
- `cross-env` (not needed)
- `vite` (bundled with Nuxt)
- `beasties` (Nuxt handles critical CSS)
- `serve-static` (not needed)
- `lightningcss` (keep as devDep for Vite config, but remove from dependencies)
- `unplugin-icons` (unused — site uses UnoCSS preset-icons via class names)
- `d3` (unused — only the individual `d3-selection`, `d3-shape`, `d3-timer` packages are imported)

### Add
- `nuxt`
- `@unocss/nuxt`
- `nuxt-svgo`
- `@nuxtjs/google-fonts`

### Keep
- `d3-selection`, `d3-shape`, `d3-timer`
- `unocss`, `@unocss/reset`, `@unocss/transformer-directives`
- `@iconify-json/ph`
- `vue` (peer dep)
- `lightningcss` (as devDep for Vite CSS config)

## Cleanup

Files to remove after migration:
- `src/` (entire directory — all content moved to Nuxt structure)
- `vite.config.ts` (replaced by `nuxt.config.ts`)
- `jsconfig.json` (Nuxt auto-generates `.nuxt/tsconfig.json`)
- `index.html` (Nuxt generates HTML)

Files to update:
- `.gitignore`: replace `.vite-ssg-temp/` with `.nuxt/`, `.output/`, `.nitro/`
- `netlify.toml`: update build command to `nuxt generate` and publish dir to `.output/public`

Files to preserve in `public/`:
- `CNAME` (custom domain for GitHub Pages)
- `resume/` directory (PDF and LaTeX source)
- `favicon.svg` (move from project root to `public/`)

## Deployment

`nuxt generate` outputs to `.output/public/`. GitHub Pages / Netlify should be configured to serve from this directory.

### Scripts

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt generate",
    "preview": "nuxt preview"
  }
}
```

## Migration Steps (High Level)

1. Scaffold Nuxt config and install dependencies
2. Create Nuxt directory structure (`layouts/`, `pages/`, `components/`, `composables/`, `assets/`)
3. Move static assets: `favicon.svg` to `public/`, images to `assets/images/`, CSS to `assets/css/`
4. Create `composables/useWaves.ts` for shared wave state
5. Port `App.vue` to `app.vue` + `layouts/default.vue`
6. Port pages to `<script setup>` with Nuxt auto-imports (Home -> index, About -> about, Projects -> projects)
7. Port `Waves.vue` to use composable instead of exported ref
8. Configure `nuxt-svgo` for SVG logo
9. Verify `nuxt generate` produces correct static output for all 3 routes
10. Clean up: remove `src/`, `vite.config.ts`, `jsconfig.json`, `index.html`
11. Update `.gitignore` and `netlify.toml`

## Out of Scope

- Blog / content system (future work)
- New pages or features
- Visual design changes
- CI/CD pipeline changes (beyond build command and publish dir)
