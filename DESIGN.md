---
name: AmirRaminfar.me
description: Personal site for an engineer-leader and open-source builder, rendered as a warm coastal atelier over a living tide.
colors:
  cream: "#f5f3ee"
  ink-deep: "#1a1a1a"
  ink-cream: "#f0ece4"
  body-light: "#374151"
  body-dark: "#d1d5db"
  surface-night: "#111827"
  ember-brown: "#b8513d"
  ember-brown-deep: "#943f2f"
  warm-gold: "#d4a87c"
  warm-gold-bright: "#e8c49e"
  tide-deep: "#071e32"
  tide-shore: "#5dade2"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.75rem, 6vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "'opsz' auto"
  body:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.01em"
  label:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
components:
  button-glass:
    backgroundColor: "rgba(255,255,255,0.45)"
    textColor: "{colors.body-light}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-glass-hover:
    backgroundColor: "rgba(255,255,255,0.65)"
    textColor: "#1a3f47"
  button-glass-dark:
    backgroundColor: "rgba(255,255,255,0.08)"
    textColor: "{colors.body-dark}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  nav-link:
    textColor: "#6b7280"
    typography: "{typography.label}"
    padding: "8px 8px"
  nav-link-active:
    textColor: "{colors.ink-deep}"
    typography: "{typography.label}"
  link-inline:
    textColor: "{colors.ember-brown}"
  link-inline-dark:
    textColor: "{colors.warm-gold}"
  project-thumb:
    rounded: "{rounded.lg}"
    width: "240px"
---

# Design System: AmirRaminfar.me

## 1. Overview

**Creative North Star: "The Coastal Atelier"**

The site is an engineer's workshop with the ocean visible through the window. Warm cream paper, hand-set serif headlines, and a working tide that reacts to where you point. Every signature element is built, not bought: a six-layer animated D3 wave system, ambient raindrops, view-transitioned title morphs between pages. The interface is the proof of taste. Adjectives are not needed.

Density is calm. One column of generous text on cream paper, with a single anchored signature: the tide along the bottom. The page makes room for the work, not the other way around. This is not a SaaS landing, not a dev terminal, not a LinkedIn profile in HTML; it is closer to a small magazine cover that animates when nobody is reading it.

The system explicitly rejects the dev-portfolio category reflex: no neon-on-black, no monospace headers, no "$ whoami", no hero metrics, no identical card grids. When dark mode appears, it stays warm-tinted toward gold, never blue-black.

**Key Characteristics:**
- Warm cream surface (`#f5f3ee`) with optical-sized serif display type
- A living, mouse-reactive tide animation as the persistent background signature
- Two warm accents only: ember brown in light mode, warm gold in dark mode
- Generous vertical air, narrow text column (≤66ch), no card-grid filler
- View transitions on the title and nav between routes

## 2. Colors: The Cream and Tide Palette

A short palette by intent. Two warms carry every accent; one neutral pair carries every surface; the tide owns the background and is never used as type or chrome.

### Primary
- **Ember Brown** (`#b8513d`): the light-mode accent. Inline links, the active-route underline, anything the eye should follow first. Hover deepens to **Ember Brown Deep** (`#943f2f`).
- **Warm Gold** (`#d4a87c`): the dark-mode accent and link-decoration tint in both modes. Inline links in dark, the active-route underline in dark, link-underline tint at 40% opacity in both. Hover lifts to **Warm Gold Bright** (`#e8c49e`).

### Neutral
- **Cream** (`#f5f3ee`): the light-mode page surface. Paper, not white. The site is unmistakably warm before a single accent touches it.
- **Ink Deep** (`#1a1a1a`): light-mode heading color. Near-black, never `#000`, slightly warm.
- **Body Light** (`#374151`): light-mode body text. Reads quietly under the headings.
- **Surface Night** (`#111827`): dark-mode page surface. Warm-leaning charcoal, not blue-black.
- **Ink Cream** (`#f0ece4`): dark-mode heading color. The cream returns as type.
- **Body Dark** (`#d1d5db`): dark-mode body text.

### Tertiary: The Tide
- **Tide Deep** (`#071e32`) → **Tide Shore** (`#5dade2`): six layered wave colors stepping from deep navy to shore teal. These live exclusively in `Waves.vue`. **They are never type, never chrome, never borders.** The tide is a place, not a palette.

### Named Rules

**The Two Warms Rule.** Light mode uses Ember Brown for accent; dark mode uses Warm Gold. They are not interchangeable across modes. A brown link in dark mode looks like a bug; a gold link in light mode looks like a sticker.

**The Tide Stays in the Tide.** The blue-teal range is the property of `Waves.vue`. Nothing else on the page is allowed to borrow from it: not a button, not a focus ring, not a tag. The tide reads as scene because nothing else is wearing its colors.

**The No-Pure-Black Rule.** `#000` and `#fff` are forbidden. Surface and ink are always tinted toward cream. If a value drifts toward true black or true white, it is wrong by definition.

## 3. Typography

**Display Font:** Playfair Display (serif, with optical sizing across 400–900, italic available)
**Body Font:** Roboto (sans, weights 100–900)

**Character:** A near-magazine pairing. Playfair carries the page identity; Roboto stays out of the way. Display headings tighten letter-spacing (`-0.02em`); body opens slightly (`+0.01em`). The result reads editorial without dressing up.

### Hierarchy
- **Display** (Playfair, weight 500, `clamp(2.75rem, 6vw, 3.75rem)`, line-height 1.1, `letter-spacing: -0.02em`): the page title, one per route. Always carries `view-transition-name: title` so it morphs across navigations.
- **Body** (Roboto, weight 400, `1.125rem`, line-height 1.7, `letter-spacing: 0.01em`): paragraph text. Cap line length at ~66ch by holding the column at `md:w-3/4 lg:w-1/2` for prose-heavy pages.
- **Label** (Roboto, weight 500, `0.875rem`, `letter-spacing: 0.05em`, `text-transform: uppercase`): nav links and any small navigational chrome. The only place small caps appear.
- **Inline link** (inherits body): underlined with a 40% gold decoration tint, offset 4. Color follows mode (Ember Brown / Warm Gold).

### Named Rules

**The One Title Rule.** Each route has exactly one display heading and it owns `view-transition-name: title`. Subheads use body weight at body size, not a stepped-down display. The display voice belongs to the page, once.

**The Optical Sizing Rule.** Playfair must declare `font-optical-sizing: auto`. The font has a real `opsz` axis and the difference at hero size is visible; turning it off makes the headline look like it shipped in 2014.

## 4. Elevation

The site is essentially flat at rest. There are no card stacks, no layered panels, no drop shadows on text or surfaces. Depth is conveyed by the live tide behind everything (parallax, motion, blur layers in the wave SVG itself), and by the `backdrop-filter: blur(12px)` glass on the social buttons. Project thumbnails carry a single 1px border and a `shadow-sm`, nothing more.

### Shadow Vocabulary
- **Glass-rest** (`0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)`): the social-button rest state. A whisper of lift over the cream.
- **Glass-hover** (`0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)`): the same button on hover, paired with `transform: translateY(-1px)`.
- **Thumb-rest** (`shadow-sm`, ~`0 1px 2px rgba(0,0,0,0.05)`): project list image. That's all.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat. The only earned shadows in this system live on the glass buttons (functional: they need to read as liftable above the tide) and on project thumbnails (functional: they need to read as image-not-page). No decorative elevation anywhere else.

**The One Glass Rule.** `backdrop-filter` is allowed in exactly one place: `GlassButton.vue`. Adding glass to a card, a nav, or a panel breaks the rule. If a new surface wants to feel glassy, the answer is no.

## 5. Components

### Buttons (Glass)
- **Shape:** generously rounded (`12px`, `rounded-xl`).
- **Light:** translucent white at 45% opacity, 1px white-50 border, blurred 12px, body-light text. Padding `10px 20px`. Hover lifts to 65% opacity and `translateY(-1px)`; active settles back.
- **Dark:** translucent white at 8% opacity, white-12 border, body-dark text. Hover lifts to 15% opacity. Same lift, deeper shadow.
- **Use:** external destinations only (GitHub, LinkedIn, Stack Overflow). The glass treatment signals "leaves the site". Internal navigation never uses it.

### Navigation
- **Style:** uppercase Roboto medium, `0.875rem`, tracking `0.05em`. Default text is gray-500/400; active route is ink-deep/ink-cream.
- **Active:** a 2px full-width underline in Ember Brown (light) or Warm Gold (dark), placed via `::before` and carrying `view-transition-name: selected` so it slides between routes.
- **No hover background, no pill, no chip.** A nav link is text and an underline. That is the whole component.

### Inline Links (Body)
- **Style:** colored (Ember Brown light / Warm Gold dark), underlined with a 40%-opacity gold decoration, `underline-offset: 4`. Hover deepens the text color one step; the decoration does not change.
- **Never** style as a button or pill inside body text. The two-warm system reads as link the moment a color appears under the body weight.

### Project Item
- **Layout:** image left (`240px`), text right, on `md+`; stacked on mobile. Items are spaced by `2.5rem` of vertical air, never inside a card.
- **Image:** rounded-`16px`, 1px gray-200/700 border, `shadow-sm`. Video thumbnails autoplay muted in the same frame.
- **Text:** project name in body weight + medium, description in body color, inline links allowed.
- **No card.** The list is intentionally borderless. Each row reads as an entry on a page, not a tile in a grid.

### Signature: The Tide (Waves.vue)
A six-layer SVG wave field rendered with `d3-shape` curves and animated by `d3-timer`. Layers step from `Tide Deep` (back, blurred 10px, opacity 0.35) to `Tide Shore` (front, sharp, opacity 0.6). Mouse position drives a hue-rotation across all layers; the tide phase advances continuously. Per-page `useWaveMultiplier` scales amplitude (Home `9`, About `4`, Projects `2.5`).

The tide is the brand. It must always be present. It must never be replaced with a static image, gradient, or video.

### Signature: View Transitions
The page title (`view-transition-name: title`), the nav (`view-transition-name: nav`), and the active-route underline (`view-transition-name: selected`) morph across routes via the View Transitions API. New components added to a page-level surface should consider whether they belong in this morph set; most do not.

## 6. Do's and Don'ts

### Do:
- **Do** keep the tide visible on every page. It is the brand.
- **Do** use Ember Brown in light mode and Warm Gold in dark mode, and only those two, for accents.
- **Do** hold body text columns to `md:w-3/4 lg:w-1/2` (≈66ch) on prose-heavy pages.
- **Do** declare `font-optical-sizing: auto` wherever Playfair Display appears.
- **Do** use `view-transition-name` for elements that persist across routes (title, nav, active underline).
- **Do** prefer flat, bordered, list-shaped layouts over cards. Project list and About page are the templates.
- **Do** use `clamp()` for display sizes so headings scale fluidly rather than stepping at breakpoints.

### Don't:
- **Don't** drift into the standard dev-portfolio aesthetic: no monospace headers, no blinking terminal cursor, no neon-on-black, no `$ whoami`. (Anti-reference, PRODUCT.md.)
- **Don't** drift into the FAANG-manager LinkedIn look: no stock photos, no badge logos, no "passionate leader" copy, no work-not-shown. (Anti-reference, PRODUCT.md.)
- **Don't** ship glassy SaaS landing patterns: no hero metrics, no identical card grids, no gradient text. (Anti-reference, PRODUCT.md.)
- **Don't** add a blog section unless there is something genuinely worth reading. (Anti-reference, PRODUCT.md.)
- **Don't** use `#000` or `#fff` anywhere. Tint to cream.
- **Don't** use the tide's blue-teal range outside `Waves.vue`. Not as a button, not as a focus ring, not as a tag.
- **Don't** use Ember Brown in dark mode or Warm Gold in light mode. The two warms are mode-bound.
- **Don't** add `backdrop-filter` to anything other than `GlassButton`.
- **Don't** wrap content in cards by reflex. The site is list-shaped, not tile-shaped.
- **Don't** use side-stripe borders, gradient text, or modals as the first reach for an interaction.
- **Don't** use em dashes in body copy. Commas, colons, semicolons, periods, parentheses.
- **Don't** add a second display headline to a page. One title per route.
