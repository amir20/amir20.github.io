# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website (amirraminfar.com) built with **Nuxt 4** (Vue 3), styled with **UnoCSS**, and deployed as a static site on **Netlify**.

## Commands

- **Install**: `bun install`
- **Dev server**: `bun run dev`
- **Build** (static generation): `bun run build`
- **Preview build**: `bun run preview`
- **Format**: `bun run format`

No test or lint commands are configured.

## Architecture

- **Package manager**: bun (see `packageManager` in `package.json`)
- **Source dir**: Nuxt 4 `app/` layout (`app/pages`, `app/components`, …); `public/` stays at the root
- **Runtime**: bun only. Scripts use `bun --bun` so Nuxt/Vite run on bun instead of Node; no Node install is needed
- **Main branch**: `source` (not `main`)

### Key Tech

- **UnoCSS** for utility-first styling (configured in `uno.config.ts`) with Tailwind-compatible reset and `@apply` directive support
- **D3.js** (d3-selection, d3-shape, d3-timer) powers the interactive wave animation in `app/components/Waves.vue`
- **Google Fonts**: IBM Plex Mono (headings) and Work Sans (body), self-hosted at build via `@nuxtjs/google-fonts`
- **Phosphor icons** via `@iconify-json/ph`

### Wave Animation System

The wave background is the site's signature visual element:
- `app/components/Waves.vue` renders 6 layered SVG waves animated with D3
- Mouse position drives hue rotation on the waves
- `app/composables/useWaveMultiplier.ts` provides shared state for wave height
- Each page sets its own wave multiplier in `onMounted` (Home: 9, About: 4, Projects: 2.5, project detail pages: 1.5)

### Styling

- Custom colors defined in `uno.config.ts`: `cream` (#f5f3ee)
- Dark mode: media-based (`prefers-color-scheme`)
- Accent colors: brown (#b8513d) and gold (#d4a87c) defined in `app/assets/css/custom.css`
- Max line width: 160 characters (Prettier + EditorConfig)

### Deployment

- Netlify deploys from `source` branch
- Build output: `.output/public` (Netlify's Nuxt integration picks it up)
- Prerendered routes: `/`, `/about`, `/projects`, `/projects/gruper`, `/projects/dozzle`
- Route animations use the View Transitions API only (`app.viewTransition`, styled in `custom.css`). Don't add a Vue `pageTransition`: Nuxt holds the view transition open until `page:finish`, so an out-in page transition freezes the screen and the waves
