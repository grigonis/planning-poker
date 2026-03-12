---
estimated_steps: 3
estimated_files: 1
---

# T03: Extend tailwind.config.js with shadcn semantic tokens and Inter font

**Slice:** S01 — Bootstrap + Theme
**Milestone:** M002

## Description

Tailwind v3 does not automatically consume CSS variables — the bridge is an explicit `extend.colors` map that wraps each CSS variable with `oklch(var(--X) / <alpha-value>)`. This allows Tailwind utilities like `bg-primary`, `text-foreground`, `border-border`, and `outline-ring/50` to resolve to the correct OKLCH colours while preserving the alpha-value modifier pattern (e.g. `text-primary/80`).

The existing `tailwind.config.js` has custom tokens (`silver`, `carbon`, `dark`, `champagne`) used by the landing page and must be fully preserved. The new shadcn tokens are merged alongside them. The font family is updated to Inter to match the "claude blu 2" theme.

## Steps

1. Read the current `client/tailwind.config.js` to get the exact existing `theme.extend` structure.

2. Merge the full shadcn semantic color map into `theme.extend.colors`. The exact entries needed are:
   ```js
   // Shadcn semantic tokens — "claude blu 2" theme
   background: "oklch(var(--background) / <alpha-value>)",
   foreground: "oklch(var(--foreground) / <alpha-value>)",
   card: {
     DEFAULT: "oklch(var(--card) / <alpha-value>)",
     foreground: "oklch(var(--card-foreground) / <alpha-value>)",
   },
   popover: {
     DEFAULT: "oklch(var(--popover) / <alpha-value>)",
     foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
   },
   primary: {
     DEFAULT: "oklch(var(--primary) / <alpha-value>)",
     foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
   },
   secondary: {
     DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
     foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
   },
   muted: {
     DEFAULT: "oklch(var(--muted) / <alpha-value>)",
     foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
   },
   accent: {
     DEFAULT: "oklch(var(--accent) / <alpha-value>)",
     foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
   },
   destructive: {
     DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
     foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
   },
   border: "oklch(var(--border) / <alpha-value>)",
   input: "oklch(var(--input) / <alpha-value>)",
   ring: "oklch(var(--ring) / <alpha-value>)",
   sidebar: {
     DEFAULT: "oklch(var(--sidebar-background) / <alpha-value>)",
     foreground: "oklch(var(--sidebar-foreground) / <alpha-value>)",
     primary: "oklch(var(--sidebar-primary) / <alpha-value>)",
     "primary-foreground": "oklch(var(--sidebar-primary-foreground) / <alpha-value>)",
     accent: "oklch(var(--sidebar-accent) / <alpha-value>)",
     "accent-foreground": "oklch(var(--sidebar-accent-foreground) / <alpha-value>)",
     border: "oklch(var(--sidebar-border) / <alpha-value>)",
     ring: "oklch(var(--sidebar-ring) / <alpha-value>)",
   },
   ```
   These go **inside** the existing `extend.colors` block, not replacing it.

3. Update `theme.extend.fontFamily.sans` from `["Geist", "sans-serif"]` to `["Inter", "sans-serif"]`. Keep `fontFamily.heading` as-is or update to Inter as well.

   The full resulting `fontFamily` entry:
   ```js
   fontFamily: {
     sans: ["Inter", "sans-serif"],
     heading: ["Inter", "sans-serif"],
   },
   ```

4. Do NOT remove `require("tailwindcss-animate")` from `plugins`. Do NOT remove any existing keyframes or animations.

5. Run `cd client && npm run build` to verify the build passes with zero errors.

## Must-Haves

- [ ] `extend.colors` contains `primary: { DEFAULT: "oklch(var(--primary) / <alpha-value>)", ... }`
- [ ] `extend.colors` still contains `silver`, `carbon`, `dark`, `champagne` keys
- [ ] `extend.colors` contains `border`, `input`, `ring` as flat string values (not nested objects)
- [ ] `extend.colors` contains `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` as objects with `DEFAULT` and `foreground`
- [ ] `fontFamily.sans` is `["Inter", "sans-serif"]`
- [ ] `tailwindcss-animate` still in `plugins`
- [ ] `npm run build` exits 0

## Verification

- `grep "primary" client/tailwind.config.js` — must show `oklch(var(--primary) / <alpha-value>)`
- `grep "silver" client/tailwind.config.js` — must still show the existing silver scale
- `grep "carbon" client/tailwind.config.js` — must still show carbon tokens
- `grep "Inter" client/tailwind.config.js` — must show Inter in fontFamily
- `cd client && npm run build` — must exit 0

## Observability Impact

- Signals added/changed: All shadcn semantic utility classes now resolve at build time — if any token is missing, `npm run build` will emit an error naming the unresolvable class
- How a future agent inspects this: `npm run build 2>&1 | grep "does not exist"` will surface any missing Tailwind class; DevTools → computed styles shows rendered `oklch()` values for elements using semantic utilities
- Failure state exposed: `npm run build` failing with "The 'bg-primary' class does not exist" indicates the `extend.colors.primary` entry is missing or malformed in tailwind.config.js

## Inputs

- `client/tailwind.config.js` — existing config with landing-page tokens (from repo)
- `client/src/index.css` — "claude blu 2" CSS variables (from T02 output)

## Expected Output

- `client/tailwind.config.js` — extended with full shadcn semantic color map and Inter font, existing landing tokens preserved
- `npm run build` exits 0 from `client/`
