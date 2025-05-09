import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";
import "./custom.css";
import { ViteSSG } from "vite-ssg";
import { ref } from "vue";
import App from "./App.vue";
import { routes } from "./router";

export const data = ref({ starts: 0 });
export const createApp = ViteSSG(App, { routes }, async ({ app, router, routes, isClient, initialState }) => {
  router.beforeResolve((to, from) => {
    if (typeof document !== "undefined") {
      if (!document.startViewTransition) {
        return Promise.resolve(true);
      }

      return new Promise((resolve) => {
        document.startViewTransition(async () => {
          resolve(true);
        });
      });
    }
  });
});
