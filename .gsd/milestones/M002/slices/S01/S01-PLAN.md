# S01: Bootstrap + Theme

**Goal:** shadcn/ui is initialised in `client/`, "claude blu 2" OKLCH CSS variables are live in `index.css`, `cn()` is exported from `src/lib/utils.ts`, Inter font is loaded, `App.css` is deleted, and a sample Button from `src/components/ui/button.tsx` renders with the correct blue-indigo primary in both light and dark mode.
**Demo:** Dev server starts; navigating to `/create` shows at least one shadcn Button with blue primary colour; toggling dark mode in the app switches the Button to the dark-mode primary value; `npm run build` exits 0 from `client/`; landing page at `/` is visually unchanged.

## Must-Haves

- `client/components.json` exists and references the nova preset
- `client/src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- `client/src/components/ui/button.tsx` exists with variant/size API
- `index.css` contains "claude blu 2" OKLCH CSS variables in `:root` and `.dark`, with **no** `@import "shadcn/tailwind.css"`, no `@import "tw-animate-css"`, no `@import "@fontsource-variable/geist"`
- `tailwind.config.js` extended with all semantic color tokens (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`) using `oklch(var(--X) / <alpha-value>)` pattern; existing `silver`, `carbon`, `dark`, `champagne` tokens preserved
- Inter font loaded via `<link>` in `index.html`; `tailwind.config.js` fontFamily.sans updated to `["Inter", "sans-serif"]`
- `client/src/App.css` deleted (was stale Vite scaffold; `main.jsx` does not import it)
- `client/vite.config.js` has `resolve.alias: { "@": path.resolve(__dirname, "./src") }`
- `client/tsconfig.json` exists with `paths: {"@/*": ["./src/*"]}`
- `npm run build` in `client/` exits 0

## Proof Level

- This slice proves: contract + integration
- Real runtime required: yes (dev server smoke test for colour rendering)
- Human/UAT required: no (automated build pass + browser colour assertion sufficient)

## Verification

- `cd client && npm run build` — must exit 0 with no errors
- `rg "@import \"shadcn/tailwind" client/src/index.css` — must return zero hits
- `rg "@import \"tw-animate" client/src/index.css` — must return zero hits
- `rg "@import \"@fontsource" client/src/index.css` — must return zero hits
- `ls client/src/lib/utils.ts` — must exist
- `ls client/src/components/ui/button.tsx` — must exist
- `ls client/components.json` — must exist
- `ls client/src/App.css` — must NOT exist
- Browser: navigate to `/create`, confirm Button has blue-indigo primary background (not grey); toggle dark mode and confirm colour shifts
- Browser: navigate to `/` (landing page), confirm it renders identically to pre-migration

## Observability / Diagnostics

- Runtime signals: `vite build` stderr surfaces any unresolved token/import errors immediately; CSS variable resolution failures appear as unstyled elements at runtime
- Inspection surfaces: `npm run build 2>&1` in `client/`; browser DevTools → Elements → Computed → `--primary` should show `oklch(...)` value
- Failure visibility: If `bg-primary` renders as transparent/black, the tailwind.config.js `extend.colors.primary` mapping is missing or the CSS variable format is wrong (double-wrapped `oklch()`)
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: none (first slice)
- New wiring introduced in this slice:
  - `client/tsconfig.json` + `vite.config.js` alias → enables `@/` imports for all generated shadcn components
  - `components.json` → shadcn CLI config for all future `npx shadcn add` commands in downstream slices
  - `src/lib/utils.ts` → `cn()` imported by every generated shadcn component
  - `src/index.css` → OKLCH CSS variables consumed by `tailwind.config.js` extend.colors map
  - `src/components/ui/button.tsx` → canonical Button for downstream modal/form use
- What remains before the milestone is truly usable end-to-end: S02 (modals), S03 (forms), S04 (voting + toasts), S05 (navbar unification)

## Tasks

- [x] **T01: Create tsconfig.json, wire Vite alias, and run shadcn init** `est:30m`
  - Why: shadcn CLI requires a tsconfig.json with `@/*` path alias and a matching Vite resolve alias before it can run; without these, `npx shadcn init` exits with "No import alias found in your tsconfig.json file"
  - Files: `client/tsconfig.json` (new), `client/vite.config.js`, `client/package.json` (modified by init)
  - Do: (1) Create `client/tsconfig.json` with `{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}`. (2) Add `import path from 'path'` and `resolve: { alias: { "@": path.resolve(__dirname, "./src") } }` to `client/vite.config.js`. (3) Run `cd client && npx shadcn@latest init --preset nova --template vite --yes` to scaffold `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, and patch `index.css`. Accept all defaults. (4) Run `npm install` to install new deps (`radix-ui`, `class-variance-authority`, `shadcn`, `tw-animate-css`, `@fontsource-variable/geist`).
  - Verify: `ls client/components.json && ls client/src/lib/utils.ts && ls client/src/components/ui/button.tsx` — all must exist
  - Done when: `components.json`, `utils.ts`, and `button.tsx` are all present on disk

- [x] **T02: Fix index.css — remove v4 imports, inject "claude blu 2" OKLCH variables** `est:45m`
  - Why: shadcn 4.x init generates `index.css` with `@import "shadcn/tailwind.css"` (Tailwind v4-only, causes vite build failure), `@import "tw-animate-css"` (redundant — tailwindcss-animate already in config), and `@import "@fontsource-variable/geist"` (wrong font — using Inter instead). The OKLCH CSS variable block must be replaced with "claude blu 2" values. All existing landing-page CSS utilities (~300 lines) must be preserved.
  - Files: `client/src/index.css`
  - Do: (1) Remove the three bad import lines. (2) Remove or replace the shadcn-generated `:root` / `.dark` CSS variable block with the full "claude blu 2" palette: light-mode `:root` with `--primary: 0.55 0.15 252` and `--primary-foreground: 0.98 0 0`, plus the full set of structural tokens (background, foreground, card, popover, secondary, muted, accent, destructive, border, input, ring, sidebar-*). Dark-mode `.dark` with `--primary: 0.66 0.12 252` and matching structural dark values. All CSS variables store bare OKLCH channel values — NOT `oklch(...)` wrapped. (3) Keep the `body { @apply bg-background text-foreground }` and `* { @apply border-border outline-ring/50 }` lines from shadcn init inside `@layer base`. (4) Ensure the existing `body { @apply bg-slate-50 dark:bg-carbon-950 ... }` line is removed or replaced — the shadcn body rule supersedes it for all pages; room pages will use `bg-background` which resolves to the OKLCH background token. (5) Verify the landing-page CSS utilities block below `@layer base` is still intact.
  - Verify: `rg "@import \"shadcn/tailwind" client/src/index.css` returns 0 hits; `rg "@import \"tw-animate" client/src/index.css` returns 0 hits; `rg "@import \"@fontsource" client/src/index.css` returns 0 hits; `rg "\-\-primary" client/src/index.css` shows the bare-value format `0.55 0.15 252`
  - Done when: index.css has no v4 imports, contains "claude blu 2" OKLCH vars in bare-channel format, and the landing utility classes (`.glass`, `.aurora`, etc.) are still present

- [x] **T03: Extend tailwind.config.js with shadcn semantic tokens and Inter font** `est:30m`
  - Why: Without the `extend.colors` map, `bg-primary`, `text-foreground`, `border-border`, etc. produce no styles — Tailwind v3 doesn't read CSS variables automatically. The `oklch(var(--X) / <alpha-value>)` pattern bridges the CSS variables to Tailwind utility classes. The font family must switch to Inter for room scope.
  - Files: `client/tailwind.config.js`
  - Do: (1) Merge the full shadcn semantic color map into `theme.extend.colors` **alongside** the existing `silver`, `carbon`, `dark`, `champagne` tokens — do not replace them. Required entries: `background: "oklch(var(--background) / <alpha-value>)"`, `foreground: "oklch(var(--foreground) / <alpha-value>)"`, `card: { DEFAULT: "oklch(var(--card) / <alpha-value>)", foreground: "oklch(var(--card-foreground) / <alpha-value>)" }`, `popover: { DEFAULT, foreground }`, `primary: { DEFAULT, foreground }`, `secondary: { DEFAULT, foreground }`, `muted: { DEFAULT, foreground }`, `accent: { DEFAULT, foreground }`, `destructive: { DEFAULT, foreground }`, `border: "oklch(var(--border) / <alpha-value>)"`, `input: "oklch(var(--input) / <alpha-value>)"`, `ring: "oklch(var(--ring) / <alpha-value>)"`. (2) Add sidebar tokens if needed by button.tsx. (3) Update `fontFamily.sans` to `["Inter", "sans-serif"]`. Keep `fontFamily.heading` as-is or update to Inter too. (4) Do NOT remove or change `tailwindcss-animate` from plugins.
  - Verify: `npm run build` in `client/` exits 0; no error mentioning `border-border`, `bg-background`, or `outline-ring`
  - Done when: `npm run build` exits 0 from `client/`

- [x] **T04: Add Inter font, delete App.css, smoke test in browser** `est:20m`
  - Why: Inter is the "claude blu 2" theme font; Geist (the current font) is loaded via Google Fonts `@import` in `index.css` but must be replaced. `App.css` is stale Vite scaffold with a centred `#root` rule that would break room layouts if ever imported. Browser smoke test confirms the full wiring works end-to-end.
  - Files: `client/index.html`, `client/src/App.css` (deleted)
  - Do: (1) Add Inter Variable Google Fonts `<link>` to `client/index.html` `<head>`: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`. Keep the existing Outfit/Poppins link for landing page. (2) Remove the `@import url('https://fonts.googleapis.com/css2?family=Geist:...')` line from `client/src/index.css` (was the existing font before init — replaced by Inter). (3) Delete `client/src/App.css`. (4) Start dev server (`npm run dev` in `client/`), navigate to `/create`, and verify a Button from `src/components/ui/button.tsx` is visible with the correct blue-indigo primary colour. (5) Toggle dark mode and confirm the Button shifts to the dark-mode primary value. (6) Navigate to `/` and confirm the landing page renders without visual regression. (7) Stop dev server, run `npm run build` from `client/` and confirm exit 0.
  - Verify: `ls client/src/App.css` exits non-zero (file deleted); `npm run build` exits 0; browser shows Button with blue primary; landing page unchanged
  - Done when: App.css deleted, build passes, Button renders in blue, landing page intact

## Files Likely Touched

- `client/tsconfig.json` (new)
- `client/vite.config.js`
- `client/components.json` (generated)
- `client/src/lib/utils.ts` (generated)
- `client/src/components/ui/button.tsx` (generated)
- `client/src/index.css`
- `client/tailwind.config.js`
- `client/index.html`
- `client/src/App.css` (deleted)
- `client/package.json` (updated by shadcn init)
