<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="['glass-btn', { 'glass-btn--accent': accent }]"
  >
    <slot />
  </a>
</template>

<script setup>
const props = defineProps({
  href: {
    type: String,
    required: true,
  },
  accent: {
    type: Boolean,
    default: false,
  },
});

const external = /^https?:\/\//.test(props.href);
</script>

<style scoped>
.glass-btn {
  --at-apply: py-2.5 px-5 rounded-xl inline-flex items-center gap-2 text-sm font-medium tracking-wide;
  color: #374151;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);

  &:hover {
    background: rgba(255, 255, 255, 0.65);
    border-color: rgba(255, 255, 255, 0.7);
    color: #1a3f47;
  }

  &:active {
    background: rgba(255, 255, 255, 0.5);
  }
}

@media (prefers-color-scheme: dark) {
  .glass-btn {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.glass-btn--accent {
  color: #fff;
  background: linear-gradient(135deg, rgba(212, 168, 124, 0.75) 0%, rgba(184, 81, 61, 0.78) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 4px 14px rgba(184, 81, 61, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;

  &:hover {
    color: #fff;
    background: linear-gradient(135deg, rgba(220, 181, 145, 0.85) 0%, rgba(196, 92, 70, 0.88) 100%);
    border-color: rgba(255, 255, 255, 0.55);
    transform: translateY(-1px);
    box-shadow:
      0 6px 18px rgba(184, 81, 61, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.45);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.97);
  }
}

@media (prefers-color-scheme: dark) {
  .glass-btn--accent {
    color: #fff;
    background: linear-gradient(135deg, rgba(212, 168, 124, 0.6) 0%, rgba(184, 81, 61, 0.65) 100%);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow:
      0 4px 16px rgba(184, 81, 61, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &:hover {
      color: #fff;
      background: linear-gradient(135deg, rgba(220, 181, 145, 0.72) 0%, rgba(196, 92, 70, 0.78) 100%);
      border-color: rgba(255, 255, 255, 0.28);
      box-shadow:
        0 6px 20px rgba(184, 81, 61, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
  }
}
</style>
