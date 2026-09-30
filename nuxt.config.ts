export default defineNuxtConfig({
  ssr: true,

  nitro: {
    prerender: {
      routes: ["/", "/about", "/projects", "/projects/gruper", "/projects/dozzle"],
    },
  },

  css: ["@unocss/reset/tailwind-compat.css", "~/assets/css/custom.css"],

  modules: ["@unocss/nuxt", "@nuxtjs/google-fonts"],

  app: {
    // View transitions only. A Vue `pageTransition` would run inside the view
    // transition's update callback, freezing the screen (and the waves) until it ends.
    viewTransition: true,
    head: {
      htmlAttrs: {
        lang: "en",
        class: "text-gray-700 transition-colors bg-cream dark:bg-gray-900 dark:text-gray-300",
      },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preload", as: "image", href: "/noise.png", fetchpriority: "low" },
      ],
    },
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

  compatibilityDate: "2026-09-30",
});
