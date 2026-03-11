import { defineConfig, presetUno, presetIcons, presetTypography } from "unocss";

import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  safelist: [
    "text-gray-700",
    "transition-colors",
    "bg-cream",
    "dark:bg-gray-900",
    "dark:text-gray-300",
  ],
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: "media",
    }),
    presetIcons(),
    presetTypography(),
  ],
  theme: {
    colors: {
      cream: "#f5f3ee",
    },
  },
});
