---
estimated_steps: 5
estimated_files: 1
---

# T02: Fix index.css — remove v4 imports, inject "claude blu 2" OKLCH variables

**Slice:** S01 — Bootstrap + Theme
**Milestone:** M002

## Description

After `npx shadcn@latest init`, `index.css` contains three incompatible imports and a wrong CSS variable block. This task surgically patches `index.css` to:
1. Remove `@import "shadcn/tailwind.css"` (Tailwind v4-only — causes vite build failure under v3)
2. Remove `@import "tw-animate-css"` (redundant — `tailwindcss-animate` already in config)
3. Remove `@import "@fontsource-variable/geist"` (wrong font — using Inter via Google Fonts)
4. Replace the shadcn-generated `:root` / `.dark` block with the full "claude blu 2" OKLCH palette
5. Replace the old `body { @apply bg-slate-50 dark:bg-carbon-950 }` rule with the shadcn `body { @apply bg-background text-foreground }` rule
6. Preserve all existing landing-page CSS utilities intact (~300 lines below `@layer base`)

The "claude blu 2" theme is a blue-indigo OKLCH palette (hue 252). CSS variables store **bare channel values only** — e.g. `--primary: 0.55 0.15 252;` NOT `--primary: oklch(0.55 0.15 252);`. The `oklch()` wrapper is added in `tailwind.config.js` (T03). Storing wrapped values here would produce double-nested `oklch(oklch(...))` which is invalid CSS.

## Steps

1. Read the current `client/src/index.css` in full to identify exact lines added by shadcn init and the exact text of the old body rule.

2. Remove the three bad import lines that shadcn init added (exact text will vary slightly but pattern is clear):
   - Any line matching `@import "shadcn/tailwind.css"`
   - Any line matching `@import "tw-animate-css"`
   - Any line matching `@import "@fontsource-variable/geist"`
   - Also remove the existing `@import url('https://fonts.googleapis.com/css2?family=Geist:...')` line from before init (if still present)

3. Replace the shadcn-generated `:root` / `.dark` CSS variable block entirely with the "claude blu 2" palette:

   ```css
   @layer base {
     :root {
       --background: 0.98 0 0;
       --foreground: 0.15 0.01 252;
       --card: 0.97 0 0;
       --card-foreground: 0.15 0.01 252;
       --popover: 0.98 0 0;
       --popover-foreground: 0.15 0.01 252;
       --primary: 0.55 0.15 252;
       --primary-foreground: 0.98 0 0;
       --secondary: 0.94 0.02 252;
       --secondary-foreground: 0.25 0.05 252;
       --muted: 0.94 0.01 252;
       --muted-foreground: 0.50 0.04 252;
       --accent: 0.92 0.03 252;
       --accent-foreground: 0.25 0.05 252;
       --destructive: 0.55 0.20 25;
       --destructive-foreground: 0.98 0 0;
       --border: 0.88 0.02 252;
       --input: 0.88 0.02 252;
       --ring: 0.55 0.15 252;
       --radius: 0.5rem;
       --sidebar-background: 0.97 0.01 252;
       --sidebar-foreground: 0.25 0.05 252;
       --sidebar-primary: 0.55 0.15 252;
       --sidebar-primary-foreground: 0.98 0 0;
       --sidebar-accent: 0.92 0.03 252;
       --sidebar-accent-foreground: 0.25 0.05 252;
       --sidebar-border: 0.88 0.02 252;
       --sidebar-ring: 0.55 0.15 252;
     }

     .dark {
       --background: 0.10 0.02 252;
       --foreground: 0.95 0.01 252;
       --card: 0.13 0.02 252;
       --card-foreground: 0.95 0.01 252;
       --popover: 0.12 0.02 252;
       --popover-foreground: 0.95 0.01 252;
       --primary: 0.66 0.12 252;
       --primary-foreground: 0.10 0.02 252;
       --secondary: 0.18 0.03 252;
       --secondary-foreground: 0.90 0.02 252;
       --muted: 0.18 0.02 252;
       --muted-foreground: 0.60 0.04 252;
       --accent: 0.20 0.04 252;
       --accent-foreground: 0.90 0.02 252;
       --destructive: 0.60 0.18 25;
       --destructive-foreground: 0.98 0 0;
       --border: 0.25 0.03 252;
       --input: 0.25 0.03 252;
       --ring: 0.66 0.12 252;
       --sidebar-background: 0.12 0.02 252;
       --sidebar-foreground: 0.90 0.02 252;
       --sidebar-primary: 0.66 0.12 252;
       --sidebar-primary-foreground: 0.10 0.02 252;
       --sidebar-accent: 0.20 0.04 252;
       --sidebar-accent-foreground: 0.90 0.02 252;
       --sidebar-border: 0.25 0.03 252;
       --sidebar-ring: 0.66 0.12 252;
     }

     * {
       @apply border-border outline-ring/50;
     }

     body {
       @apply bg-background text-foreground;
     }
   }
   ```

4. Remove the old `body { @apply bg-slate-50 dark:bg-carbon-950 ... }` rule (and any transition on it) that was in the original `@layer base` block — the new `body { @apply bg-background text-foreground }` replaces it. Keep the `h1–h6` font rules and the element transition-colors rule.

5. Verify the existing landing utilities block (`.glass`, `.glass-silver`, `.aurora`, `.modern-grid`, `.presence-dot`, `.bento-noise`, flip card, spotlight keyframes) is still present and unmodified below the updated `@layer base`.

## Must-Haves

- [ ] No line in `index.css` contains `@import "shadcn/tailwind.css"`
- [ ] No line in `index.css` contains `@import "tw-animate-css"`
- [ ] No line in `index.css` contains `@import "@fontsource-variable"`
- [ ] No line in `index.css` contains `@import url` with Geist font
- [ ] `:root` contains `--primary: 0.55 0.15 252;` (bare channel value, no `oklch()` wrapper)
- [ ] `.dark` contains `--primary: 0.66 0.12 252;`
- [ ] `body { @apply bg-background text-foreground; }` is present in `@layer base`
- [ ] `* { @apply border-border outline-ring/50; }` is present in `@layer base`
- [ ] Landing CSS utilities (`.glass`, `.aurora`, etc.) are still present below `@layer base`

## Verification

- `rg '@import "shadcn/tailwind' client/src/index.css` — must return 0 hits
- `rg '@import "tw-animate' client/src/index.css` — must return 0 hits
- `rg '@import "@fontsource' client/src/index.css` — must return 0 hits
- `rg 'Geist' client/src/index.css` — must return 0 hits
- `rg '\-\-primary' client/src/index.css` — must show `0.55 0.15 252` and `0.66 0.12 252`
- `rg '\.glass' client/src/index.css` — must return hits (landing utils still present)
- `rg '\.aurora' client/src/index.css` — must return hits

## Observability Impact

- Signals added/changed: CSS variables now define the full "claude blu 2" palette — inspectable via browser DevTools → computed styles on `:root`
- How a future agent inspects this: `grep "\-\-primary" client/src/index.css` or browser DevTools → Elements → `:root` computed → `--primary`
- Failure state exposed: If `--primary` shows as `oklch(0.55 0.15 252)` (with wrapper), the `tailwind.config.js` wrapping will double-nest and produce invalid CSS — tokens will render as transparent

## Inputs

- `client/src/index.css` after shadcn init (contains v4 imports and wrong vars from T01 output)

## Expected Output

- `client/src/index.css` — cleaned of v4 imports, containing "claude blu 2" OKLCH bare-channel CSS variables, with existing landing-page CSS utilities intact
