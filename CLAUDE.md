# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website (amirraminfar.com) built with **Nuxt 4** (Vue 3), styled with **UnoCSS**, and deployed as a static site on **Netlify**.

## Commands

- **Dev server**: `pnpm dev`
- **Build** (static generation): `pnpm build`
- **Preview build**: `pnpm preview`
- **Format**: `npx prettier --write .`

No test or lint commands are configured.

## Architecture

- **Package manager**: pnpm (v10.18.2)
- **Node version**: 24 (see `.node-version`)
- **Main branch**: `source` (not `main`)

### Key Tech

- **UnoCSS** for utility-first styling (configured in `uno.config.ts`) with Tailwind-compatible reset and `@apply` directive support
- **D3.js** (d3-selection, d3-shape, d3-timer) powers the interactive wave animation in `components/Waves.vue`
- **Google Fonts**: Playfair Display (headings) and Roboto (body) loaded via `@nuxtjs/google-fonts`
- **nuxt-svgo** for SVG component imports
- **Phosphor icons** via `@iconify-json/ph`

### Wave Animation System

The wave background is the site's signature visual element:
- `components/Waves.vue` renders 6 layered SVG waves animated with D3
- Mouse position drives hue rotation on the waves
- `composables/useWaveMultiplier.ts` provides shared state for wave height
- Each page sets its own wave multiplier (Home: 9, About: 2, Projects: 1.5)

### Styling

- Custom colors defined in `uno.config.ts`: `cream` (#f5f3ee)
- Dark mode: media-based (`prefers-color-scheme`)
- Accent colors: brown (#b8513d) and gold (#d4a87c) defined in `assets/css/custom.css`
- Max line width: 160 characters (Prettier + EditorConfig)

### Deployment

- Netlify deploys from `source` branch
- Build output: `dist/`
- Prerendered routes: `/`, `/about`, `/projects`
- Experimental View Transitions API enabled
