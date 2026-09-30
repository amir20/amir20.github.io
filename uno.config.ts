import { defineConfig, presetIcons, presetWind3, transformerDirectives } from "unocss";

export default defineConfig({
  // Classes applied via nuxt.config `htmlAttrs`, which UnoCSS doesn't scan.
  safelist: ["text-gray-700", "transition-colors", "bg-cream", "dark:bg-gray-900", "dark:text-gray-300"],
  transformers: [transformerDirectives()],
  presets: [presetWind3({ dark: "media" }), presetIcons()],
  theme: {
    colors: {
      cream: "#f5f3ee",
    },
  },
});
