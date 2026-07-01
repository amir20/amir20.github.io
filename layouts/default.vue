<template>
  <div class="relative z-10 flex flex-col min-h-screen">
    <nav ref="navRef" class="relative flex justify-start mx-6 my-5 gap-x-5 text-base" style="view-transition-name: nav">
      <Signature class="color-gray-800 dark:color-white mr-auto -mt-1" />
      <NuxtLink
        v-for="item in menu"
        :key="item.path"
        :ref="(el) => setLinkRef(el, item.path)"
        class="no-underline! text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 z-2 transition-colors font-medium tracking-wide uppercase text-sm"
        :to="item.path"
        >{{ item.title }}</NuxtLink
      >
      <span
        class="nav-underline"
        :class="{ 'is-ready': ready }"
        :style="{ transform: `translateX(${underline.left}px)`, width: `${underline.width}px` }"
      />
    </nav>
    <main class="flex items-center flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const menu = [
  { title: "Home", path: "/" },
  { title: "About Me", path: "/about" },
  { title: "Projects", path: "/projects" },
];

const route = useRoute();
const navRef = ref(null);
const linkRefs = new Map();
const underline = ref({ left: 0, width: 0 });
const ready = ref(false);

const setLinkRef = (el, path) => {
  if (el) {
    linkRefs.set(path, el.$el ?? el);
  } else {
    linkRefs.delete(path);
  }
};

const activePath = computed(() => {
  const path = route.path;
  const match = menu
    .filter((item) => (item.path === "/" ? path === "/" : path.startsWith(item.path)))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.path;
});

const updateUnderline = async () => {
  await nextTick();
  const nav = navRef.value;
  const el = activePath.value ? linkRefs.get(activePath.value) : null;
  if (!nav || !el) {
    underline.value = { left: 0, width: 0 };
    return;
  }
  const navRect = nav.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  underline.value = { left: rect.left - navRect.left, width: rect.width };
};

watch(activePath, updateUnderline);

onMounted(() => {
  updateUnderline().then(() => {
    requestAnimationFrame(() => (ready.value = true));
  });
  // Web fonts load after hydration with font-display: swap.
  // The swap reflows the link text, so re-measure once fonts are ready.
  document.fonts?.ready.then(updateUnderline);
  window.addEventListener("resize", updateUnderline);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateUnderline);
});
</script>

<style scoped>
nav a {
  position: relative;

  &.router-link-active {
    --at-apply: "text-gray-900 dark:text-white";
  }
}

.nav-underline {
  --at-apply: "absolute h-[2px] bottom-0 left-0 bg-[#b8513d] dark:bg-[#d4a87c] pointer-events-none";
  will-change: transform, width;
}

.nav-underline.is-ready {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
