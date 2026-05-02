# Raindrop Effect Design

## Summary

Add a canvas-based animated raindrop overlay that simulates light rain sliding down a window. Layers on top of existing noise effect. Drops interact with underlying wave colors via blend modes.

## Details

### Composable: `composables/useRaindrops.ts`

- Creates a full-viewport `<canvas>` element, fixed position, `pointer-events: none`
- Z-index between content and noise (z-index: 9998)
- Canvas uses `mix-blend-mode: overlay` to pick up wave colors

### Drop Model

- 5-10 drops active at a time
- Each drop: x, y, radius (2-5px), speed (0.5-2px/frame), opacity (0.3-0.7), horizontal drift, trail positions
- Spawn at random x near top, slide down with slight drift
- Respawn at top when exiting bottom

### Trail

- Each drop stores last 15-20 positions
- Trail rendered as progressively smaller, more transparent circles
- Fades quickly for subtlety

### Rendering

- `requestAnimationFrame` loop
- Canvas cleared and redrawn each frame
- Drops are white semi-transparent with bright highlight spot (refraction look)
- Radial gradient per drop: bright center fading to transparent edge

### Integration

- Called from `layouts/default.vue` alongside `useNoise()`
- Resizes canvas on window resize
- Works in both dark and light mode (white highlights + blend mode)

### Performance

- Max 10 drops + trails = ~200 draw calls per frame — negligible for canvas
- Single composable, no DOM thrashing
