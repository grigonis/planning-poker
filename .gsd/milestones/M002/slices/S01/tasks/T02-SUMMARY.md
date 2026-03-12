---
id: T02
parent: S01
milestone: M002
provides:
  - client/src/index.css with "claude blu 2" OKLCH bare-channel CSS variables and no v4 imports
key_files:
  - client/src/index.css
key_decisions:
  - CSS variables store bare OKLCH channel values only (e.g. `--primary: 0.55 0.15 252;`) — the `oklch()` wrapper is added in tailwind.config.js (T03); storing wrapped values here would produce double-nested `oklch(oklch(...))` which is invalid CSS
patterns_established:
  - "claude blu 2" palette hue is 252 (blue-indigo) throughout all semantic tokens
  - `@layer base` block order: `:root` vars → `.dark` vars → `* { @apply border-border outline-ring/50; }` → `body { @apply bg-background text-foreground; }` → heading/element rules
observability_surfaces:
  - Browser DevTools → Elements → `:root` computed styles → `--primary` should show bare channel value `0.55 0.15 252`
  - `grep "\-\-primary" client/src/index.css` — quick CLI inspection of palette values
duration: <5min
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Fix index.css — remove v4 imports, inject "claude blu 2" OKLCH variables

**Replaced shadcn-generated v4 imports and default grey palette in `index.css` with the "claude blu 2" blue-indigo OKLCH bare-channel variable block, preserving all landing-page CSS utilities intact.**

## What Happened

The file after shadcn init contained four bad imports and a wrong CSS variable block:
- `@import "shadcn/tailwind.css"` — Tailwind v4-only, causes vite build failure under v3
- `@import "tw-animate-css"` — redundant with `tailwindcss-animate` already in config
- `@import "@fontsource-variable/geist"` — wrong font (using Inter via Google Fonts instead)
- `@import url('https://fonts.googleapis.com/css2?family=Geist:...')` — pre-init Geist import

All four were removed. The shadcn-generated `:root` / `.dark` block (grey achromatic values with `oklch()` wrappers) was replaced entirely with the "claude blu 2" palette: hue 252, OKLCH bare channel values (no `oklch()` wrapper — that's applied in tailwind.config.js during T03). The old `body { @apply dark:bg-carbon-950 ... }` rule with transitions was replaced by the canonical `body { @apply bg-background text-foreground; }`. The `* { @apply border-border outline-ring/50; }` rule was retained. All existing landing-page CSS utilities (`.glass`, `.glass-silver`, `.aurora`, `.modern-grid`, `.presence-dot`, `.bento-noise`, flip card, spotlight keyframes, grain overlay) were preserved untouched below `@layer base`.

## Verification

```
rg '@import "shadcn/tailwind' client/src/index.css   → 0 hits ✓
rg '@import "tw-animate' client/src/index.css         → 0 hits ✓
rg '@import "@fontsource' client/src/index.css        → 0 hits ✓
rg 'Geist' client/src/index.css                       → 0 hits ✓
rg '\-\-primary' client/src/index.css                 → shows 0.55 0.15 252 (light) and 0.66 0.12 252 (dark) ✓
rg '\.glass' client/src/index.css                     → multiple hits ✓
rg '\.aurora' client/src/index.css                    → hits present ✓
rg 'bg-background text-foreground' client/src/index.css → present ✓
rg 'border-border outline-ring' client/src/index.css  → present ✓
```

## Diagnostics

- `grep "\-\-primary" client/src/index.css` — confirms bare channel values, no `oklch()` wrapper
- Browser DevTools → Elements → Computed → filter `--primary`: should show `0.55 0.15 252` (light mode); if it shows `oklch(0.55 0.15 252)` a double-wrap error exists in tailwind.config.js

## Deviations

None. Executed exactly as planned.

## Known Issues

None.

## Files Created/Modified

- `client/src/index.css` — removed 4 bad imports; replaced shadcn grey `:root`/`.dark` block with "claude blu 2" OKLCH bare-channel palette; replaced old body rule with `bg-background text-foreground`; retained all landing-page utilities
