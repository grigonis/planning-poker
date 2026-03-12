# S01: Bootstrap + Theme — Research

**Date:** 2026-03-12
**Slice:** M002/S01 — Bootstrap + Theme
**Requirements owned:** R101, R102, R113; R114 (constraint — must not break)

---

## Summary

S01 bootstraps shadcn/ui into `client/` using `npx shadcn@latest init`, writes the "claude blu 2" OKLCH CSS variables to `index.css`, wires semantic color tokens into `tailwind.config.js`, installs Inter font, and removes the stale `App.css`. The primary risk is that **shadcn 4.x init generates index.css with `@import "shadcn/tailwind.css"` which contains Tailwind v4-only syntax** (`@theme inline`, `@custom-variant`). These directives cause `vite build` to fail under Tailwind v3. The fix is a mandatory post-init CSS rewrite.

The project uses Tailwind v3 (`^3.4.17`), Vite 5, React 18, and has no tsconfig.json — all three of which require deliberate handling. The shadcn CLI requires a tsconfig.json with `paths: {"@/*": ["./src/*"]}` and a matching Vite alias before it can run; neither exist today. `clsx` and `tailwind-merge` are already installed; `radix-ui`, `class-variance-authority`, and `shadcn` (runtime) are not. `lucide-react` is already installed — this informs the correct `--preset` choice.

The "claude blu 2" theme is a blue-indigo OKLCH palette (hue 252). The light/dark primary values from the milestone context are `oklch(0.55 0.15 252)` (light) and `oklch(0.66 0.12 252)` (dark). A full set of supporting tokens must be defined manually in `index.css` following the pattern confirmed to work: CSS variables store only the OKLCH channel values (e.g. `--primary: 0.55 0.15 252;`) and `tailwind.config.js` wraps them as `oklch(var(--primary) / <alpha-value>)`. This pattern was verified to produce a passing `vite build`.

## Recommendation

Run `npx shadcn@latest init --preset nova --template vite --yes` which uses `lucide-react` (already installed) and `radix-ui` base. After init, perform a mandatory 3-step post-init fix: (1) rewrite `index.css` to remove v4-only imports and inject "claude blu 2" OKLCH vars; (2) extend `tailwind.config.js` with the full semantic color map; (3) delete `App.css`. Do not use the `maia` preset — it installs `@hugeicons/react` and `@hugeicons/core-free-icons` as additional dependencies and uses `iconLibrary: "hugeicons"` which conflicts with the existing `lucide-react` usage throughout the codebase.

---

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Component scaffolding + utils.ts + components.json | `npx shadcn@latest init` | Creates all canonical files at correct paths; doing it manually diverges from CLI expectations |
| Semantic CSS variable wiring for Tailwind v3 | `extend.colors` with `oklch(var(--X) / <alpha-value>)` | Proven pattern; confirmed build passes with this setup |
| Font loading (Inter) | `@fontsource-variable/inter` npm package OR Google Fonts `<link>` in `index.html` | `index.html` already loads Google Fonts for Outfit/Poppins; adding Inter there is the zero-dep path |
| TypeScript utils.ts in a JS project | shadcn generates `utils.ts` regardless; Vite+React handles `.ts` without a tsconfig | No action needed — Vite transpiles TS out of the box via esbuild |

---

## Existing Code and Patterns

- `client/tailwind.config.js` — Contains landing-page-only tokens: `silver`, `carbon`, `dark`, `champagne`. These must be **preserved in full**. The shadcn `extend.colors` entries go alongside them, not replacing them.
- `client/src/index.css` — Contains Tailwind directives, a `@layer base` block, and large blocks of landing-page CSS utilities (`.glass`, `.glass-silver`, `.aurora`, `.modern-grid`, `.presence-dot`, `.bento-noise`, flip-card animations, spotlight mode keyframes). The `:root`/`.dark`/`* { @apply border-border... }` block must be **inserted into the existing `@layer base`** — not pasted at the top or as a new file, or the landing-page utilities break.
- `client/src/App.css` — Stale Vite scaffold (`.card`, `.logo`, `.read-the-docs`, centered `#root`). Safe to delete; nothing imports it from application code (App.jsx imports it implicitly only if main.jsx imports it — confirmed: `main.jsx` does NOT import `App.css`; only `index.css` is imported).
- `client/src/components/ui/shimmer-button.jsx` — Has its own local `cn()`. After S01, this file's `cn` is superseded but not broken — the file is landing-only and not in scope.
- `client/src/context/ThemeContext.jsx` — Applies `.dark` on `<html>` via `document.documentElement.classList.toggle('dark', isDark)`. This is exactly what shadcn's class-based dark mode expects. **No changes needed.**
- `client/index.html` — Already has Google Fonts `<link>` block for Outfit and Poppins. Add Inter Variable here rather than via npm package to avoid adding another runtime dependency.
- `client/vite.config.js` — No path alias today. Must add `resolve.alias: { "@": path.resolve(__dirname, "./src") }` and create `tsconfig.json` with `compilerOptions.paths: {"@/*": ["./src/*"]}` for shadcn init to pass its import alias validation.
- `client/src/lib/` — Does not exist. shadcn init creates it with `utils.ts`.

---

## Constraints

- **Tailwind v3 only** (`^3.4.17`) — no upgrade. The `@theme inline` and `@custom-variant` directives in `shadcn/tailwind.css` are v4-only and must not appear in the final `index.css`.
- **`@import "shadcn/tailwind.css"` must be removed** after init — verified failure mode: `vite build` errors with `The 'border-border' class does not exist` under Tailwind v3 when this import is present.
- **`@import "tw-animate-css"` must be removed** — the project already has `tailwindcss-animate` as a devDependency and it is already in `tailwind.config.js` plugins. `tw-animate-css` is a runtime dep shadcn adds; it is not needed.
- **Landing-page CSS must survive** — `index.css` contains ~300 lines of landing utilities below the `@layer base` block. Any edit to `@layer base` must be a surgical insert, not a file overwrite.
- **Preserve existing `tailwind.config.js` tokens** — `silver`, `carbon`, `dark`, `champagne` color scales are used by `src/components/home/` and `src/pages/Landing.jsx`. Merge, don't replace.
- **`lucide-react` is the icon library** — already installed; use `--preset nova` (lucide) not `--preset maia` (hugeicons).
- **No tsconfig.json today** — must create one with the `@/*` path alias before running `shadcn init`. Vite also needs `resolve.alias` patched. The `tsconfig.json` needs only `compilerOptions.baseUrl` + `paths` — no other TS config needed since Vite handles transpilation.
- **shadcn installs itself as a runtime dep** (`"shadcn": "^4.0.5"`) — this is expected; do not remove it.
- **CSS variable format for Tailwind v3**: variables store bare channel values (e.g. `--primary: 0.55 0.15 252;` not `--primary: oklch(0.55 0.15 252);`) so the `oklch(var(--primary) / <alpha-value>)` wrapper in `tailwind.config.js` produces valid output.

---

## Common Pitfalls

- **Overwriting index.css entirely** — init patches the existing file; the post-init edit must also patch, not overwrite, to keep landing-page utilities intact.
- **Using `oklch()` in the CSS variable value** — if `--primary: oklch(0.55 0.15 252)` then the tailwind.config.js wrapping `oklch(var(--primary) / <alpha-value>)` produces `oklch(oklch(0.55 0.15 252) / 0.5)` which is invalid. CSS variables must store bare values: `0.55 0.15 252`.
- **`--border` dark mode value** — the dark value is `1 0 0 / 10%` (with embedded alpha). When tailwind.config.js uses `oklch(var(--border) / <alpha-value>)`, the `/ 10%` in the variable breaks the alpha-value pattern. Solution: use the `border` color for `border-border` without the alpha wrapper, or store the dark border as a raw value without embedded alpha and adjust the lightness instead.
- **`@apply border-border` in `@layer base`** — this will fail unless `border` is in `tailwind.config.js` extend.colors. The fix is to either (a) replace `* { @apply border-border }` with `* { border-color: oklch(var(--border)); }` as raw CSS, or (b) ensure the tailwind.config.js mapping is present. Option (b) is cleaner.
- **`outline-ring/50` in `@apply`** — same issue; `ring` must be in extend.colors for `outline-ring/50` to resolve. Add `ring: "oklch(var(--ring) / <alpha-value>)"` to the config.
- **Running shadcn init in the wrong directory** — always run from `client/` not the monorepo root. The `--cwd` flag or `cd client/` first.
- **shadcn adds `shadcn` and `tw-animate-css` to `dependencies`** — after init, move `tw-animate-css` to devDependencies or remove it (tailwindcss-animate covers this). Leave `shadcn` as a runtime dep (it provides the CLI for future `add` commands).
- **`@fontsource-variable/geist` installed by init** — we want Inter, not Geist. The simpler path is to add Inter via a Google Fonts `<link>` in `index.html` and not install `@fontsource-variable/inter`. Remove the `@import "@fontsource-variable/geist"` line shadcn adds to index.css.

---

## Open Risks

- **"claude blu 2" full palette** — only the primary values are documented (`oklch(0.55 0.15 252)` light, `oklch(0.66 0.12 252)` dark). The rest of the token set (secondary, accent, muted, background, card, etc.) must be derived. The safe approach: use the standard nova neutral palette for structural tokens (background, card, border) and apply the blue-indigo hue only to `primary`, `ring`, and sidebar-primary. This matches what shadcn's "blue" theme preset looks like.
- **`--border` dark mode embedded alpha** — the `/ 10%` syntax in dark `--border: 1 0 0 / 10%` may not behave predictably inside `oklch(var(--border) / <alpha-value>)`. Mitigation: use a straight lightness value for border in dark mode (e.g. `--border: 0.3 0 0`) rather than relying on embedded alpha.
- **Existing `@layer base` body styles in index.css** — the current file has `body { @apply bg-slate-50 dark:bg-carbon-950 ... }` inside `@layer base`. After adding shadcn's `body { @apply bg-background text-foreground }`, there will be a conflict. The shadcn body rule must come after, or the existing rule must be replaced for room-scope pages. Since the landing page depends on `bg-slate-50 dark:bg-carbon-950`, this needs to remain for landing — but room pages will rely on `bg-background`. The resolution: keep the existing body rule but override at the page level with `bg-background` on room containers. OR: remove the body rule from `@layer base` and handle page-specific backgrounds in each page component.
- **`radix-ui` consolidated package vs individual `@radix-ui/*`** — shadcn 4.x uses the new `radix-ui` meta-package. The generated components import from `radix-ui` (e.g. `import { Slot } from "radix-ui"`), not `@radix-ui/react-slot`. This is a new pattern (4.0.x) — should work fine but is worth noting for downstream slices.

---

## Execution Steps (for S01-PLAN)

1. **Pre-init prerequisites**
   - Create `client/tsconfig.json` with `{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}`
   - Add Vite alias to `client/vite.config.js`: `import path from 'path'` + `resolve: { alias: { "@": path.resolve(__dirname, "./src") } }`

2. **Run shadcn init**
   - `cd client && npx shadcn@latest init --preset nova --template vite --yes`
   - Creates: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
   - Patches: `src/index.css` (inserts v4-style imports and CSS vars — will need fixing)
   - Adds to package.json: `radix-ui`, `class-variance-authority`, `shadcn`, `tw-animate-css`, `@fontsource-variable/geist`

3. **Post-init index.css surgery**
   - Remove: `@import "shadcn/tailwind.css"` (v4-only)
   - Remove: `@import "tw-animate-css"` (already covered by tailwindcss-animate)
   - Remove: `@import "@fontsource-variable/geist"` (using Inter instead)
   - The `:root` / `.dark` / `body` / `* { @apply ... }` block stays but gets the "claude blu 2" primary values substituted
   - The existing landing-page CSS below `@layer base` is untouched

4. **Update tailwind.config.js**
   - Merge shadcn semantic color extensions alongside existing `silver`, `carbon`, `dark`, `champagne` tokens
   - Full map: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring` — all as `oklch(var(--X) / <alpha-value>)`

5. **Add Inter font**
   - Add `<link>` for `Inter:wght@300;400;500;600;700` to `client/index.html`
   - Update `tailwind.config.js` fontFamily.sans to `["Inter", "sans-serif"]` for room scope

6. **Delete App.css**
   - `rm client/src/App.css`

7. **Run npm install and build**
   - `cd client && npm install && npm run build` — must exit 0

8. **Smoke test**
   - Start dev server, navigate to `/create`, confirm a Button renders with blue primary color

---

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| shadcn/ui | shadcn (installed at `.agents/skills/shadcn/`) | Installed |

---

## Sources

- Confirmed: `shadcn@4.0.5` available on system via `npx shadcn@latest --version`
- Confirmed: all shadcn presets (nova, vega, maia, lyra, mira) generate `@import "shadcn/tailwind.css"` which contains `@theme inline` and `@custom-variant` — incompatible with Tailwind v3 (source: test run against `/tmp/shadcn-test2`)
- Confirmed: `vite build` passes with manual CSS var approach + `tailwind.config.js` extend.colors map (source: test build `/tmp/shadcn-test2`)
- Confirmed: `shadcn init` requires `tsconfig.json` with `paths` configured (source: error `No import alias found in your tsconfig.json file`)
- Confirmed: nova preset uses `iconLibrary: "lucide"` — compatible with existing `lucide-react` dep (source: test `components.json`)
- Confirmed: new deps added by init: `radix-ui`, `class-variance-authority`, `shadcn`, `tw-animate-css`, `@fontsource-variable/geist` (source: test `package.json` diff)
- Confirmed: existing deps already present: `clsx ^2.1.1`, `tailwind-merge ^3.5.0`, `lucide-react ^0.564.0`, `tailwindcss-animate ^1.0.7` (source: `client/package.json`)
- Landing-page isolation risk: `index.css` has ~300 lines of utilities that must survive; confirmed via `client/src/index.css` read
