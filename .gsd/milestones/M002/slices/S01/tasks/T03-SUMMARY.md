---
id: T03
parent: S01
milestone: M002
provides:
  - client/tailwind.config.js extended with full shadcn semantic color map (oklch CSS-variable bridge) and Inter font
key_files:
  - client/tailwind.config.js
key_decisions:
  - shadcn tokens merged into existing extend.colors alongside landing-page tokens (silver, carbon, dark, champagne) — no clobber
  - font family updated to Inter for both sans and heading to match "claude blu 2" theme
patterns_established:
  - All shadcn semantic utility classes (bg-primary, text-foreground, border-border, ring, etc.) resolve via oklch(var(--X) / <alpha-value>) bridge pattern — alpha modifier (e.g. /80) works correctly
  - Existing landing-page custom tokens preserved in extend.colors alongside shadcn tokens — no conflict
observability_surfaces:
  - "npm run build 2>&1 | grep 'does not exist'" surfaces any missing Tailwind token at build time
  - Browser DevTools → Elements → Computed → filter --primary shows bare channel values (0.55 0.15 252 in light mode); semantic utility bg-primary resolves to oklch(0.55 0.15 252) at runtime
duration: ~5 min
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T03: Extend tailwind.config.js with shadcn semantic tokens and Inter font

**Merged full shadcn "claude blu 2" OKLCH semantic color map into `tailwind.config.js` and switched font family to Inter, with all landing-page tokens preserved.**

## What Happened

Read the existing `tailwind.config.js` to identify the exact `extend.colors` structure (silver, carbon, dark, champagne, gray palettes). Appended the full shadcn semantic token block immediately after the existing gray entry, using the `oklch(var(--X) / <alpha-value>)` bridge pattern for every token. Updated `fontFamily.sans` and `fontFamily.heading` from `["Geist", "sans-serif"]` to `["Inter", "sans-serif"]`. All existing keyframes, animations, and `tailwindcss-animate` plugin left untouched.

## Verification

- `grep "primary" client/tailwind.config.js` — shows `oklch(var(--primary) / <alpha-value>)` ✓
- `grep "silver" client/tailwind.config.js` — shows existing silver scale ✓
- `grep "carbon" client/tailwind.config.js` — shows carbon tokens ✓
- `grep "Inter" client/tailwind.config.js` — shows Inter in both fontFamily entries ✓
- `grep "border\|input\|ring" client/tailwind.config.js` — flat string values present ✓
- `cd client && npm run build` — exits 0 (2550 modules, 4.04s, no errors; only pre-existing ambiguous class warnings) ✓

## Diagnostics

- `npm run build 2>&1 | grep "does not exist"` — should return empty; any output here means a token is missing from `extend.colors`
- Browser DevTools → Elements → Computed → `--primary`: should show `0.55 0.15 252` (bare channels, light mode)
- If `bg-primary` renders transparent/black: the `extend.colors.primary` entry is missing or the CSS variable is double-wrapped (`oklch(oklch(...))`)
- `tailwindcss-animate` confirmed still present in `plugins` array

## Deviations

none

## Known Issues

Pre-existing ambiguous-class warnings for `duration-[400ms]`, `duration-[500ms]`, `ease-[cubic-bezier(...)]` in source — unrelated to this task, existed before T03.

## Files Created/Modified

- `client/tailwind.config.js` — extended with full shadcn semantic color map (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, sidebar tokens) and Inter font family; all landing-page tokens preserved
