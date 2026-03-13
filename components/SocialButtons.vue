<template>
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
</template>

<style scoped>
.btn {
  --at-apply: py-2.5 px-5 rounded-xl inline-flex items-center transition-all duration-300 gap-2 text-sm font-medium tracking-wide;
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
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.5);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
}

@media (prefers-color-scheme: dark) {
  .btn {
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
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:active {
      background: rgba(255, 255, 255, 0.1);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
