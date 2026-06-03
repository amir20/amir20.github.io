export default defineNuxtConfig({
  ssr: true,

  nitro: {
    prerender: {
      routes: ["/", "/about", "/projects", "/projects/gruper", "/projects/dozzle"],
    },
  },

  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/custom.css"],

  modules: ["@unocss/nuxt", "nuxt-svgo", "@nuxtjs/google-fonts"],

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      htmlAttrs: {
        lang: "en",
        class:
          "text-gray-700 transition-colors bg-cream dark:bg-gray-900 dark:text-gray-300",
      },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preload", as: "image", href: "/noise.png", fetchpriority: "low" },
      ],
    },
  },

  experimental: {
    viewTransition: true,
  },

  googleFonts: {
    families: {
      "Work Sans": [400, 500],
      "IBM Plex Mono": [600],
    },
    subsets: ["latin"],
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

  compatibilityDate: "2026-03-11",
});
