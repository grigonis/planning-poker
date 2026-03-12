---
estimated_steps: 6
estimated_files: 3
---

# T04: Add Inter font, delete App.css, smoke test in browser

**Slice:** S01 — Bootstrap + Theme
**Milestone:** M002

## Description

Final wiring for S01: add Inter as a Google Fonts `<link>` in `index.html` (the landing page already loads Outfit/Poppins this way — zero new npm deps), delete the stale `App.css` Vite scaffold (confirmed `main.jsx` does not import it), and perform a browser smoke test to verify the full OKLCH token chain works end-to-end. The smoke test confirms: (1) a Button from `src/components/ui/button.tsx` renders with blue-indigo primary colour; (2) dark mode produces the dark-mode primary shift; (3) the landing page at `/` is visually unchanged.

## Steps

1. Add Inter Variable Google Fonts `<link>` to `client/index.html` `<head>`, **after** the existing Outfit/Poppins link:
   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
     rel="stylesheet">
   ```
   Preserve the existing Outfit/Poppins link for the landing page.

2. Delete `client/src/App.css`:
   ```bash
   rm client/src/App.css
   ```
   Confirm `main.jsx` does NOT import it (it imports only `./index.css`). If any file imports App.css, remove that import first.

3. Start the dev server from `client/`:
   ```bash
   cd client && npm run dev
   ```

4. Navigate to `/create` in the browser. Verify that a shadcn Button component is rendered with blue-indigo primary background colour (not grey, not transparent, not orange). If no Button is visible on the CreateRoom page yet, navigate to any room page or temporarily render `<Button>Test</Button>` in `App.jsx` for visual confirmation, then revert.

5. Toggle dark mode using the existing ThemeToggle in the UI. Verify the Button's primary colour shifts to the dark-mode value (lighter blue, approximately `oklch(0.66 0.12 252)`).

6. Navigate to `/` (landing page). Verify it renders correctly with no visible regression — the glassmorphism cards, heading typography, and colour palette should match pre-migration appearance.

7. Stop the dev server. Run `npm run build` from `client/` and confirm it exits 0.

## Must-Haves

- [ ] `client/index.html` has Inter Google Fonts `<link>` in `<head>`
- [ ] `client/src/App.css` does not exist
- [ ] `npm run build` exits 0
- [ ] No browser console errors related to missing CSS variables or broken imports
- [ ] Button at `/create` (or equivalent) renders with blue-indigo colour (visual confirmation)
- [ ] Landing page at `/` renders without visual regression (visual confirmation)

## Verification

- `ls client/src/App.css` — must return non-zero exit (file not found)
- `grep "Inter" client/index.html` — must show the Inter link
- `grep "Outfit" client/index.html` — must still be present (landing page font preserved)
- `cd client && npm run build` — must exit 0
- Browser: DevTools → Elements → `<button>` using `bg-primary` → Computed → background-color should show an `oklch(...)` blue value
- Browser: landing page `/` renders without visible regression

## Observability Impact

- Signals added/changed: Inter font now applied globally via CSS variable `font-family`; any missing font load surfaced as network error in DevTools; App.css removal eliminates the centred `#root` max-width rule
- How a future agent inspects this: `grep "Inter" client/index.html` confirms font link; browser DevTools → Network → Fonts tab shows Inter loading; `grep "App.css" client/src/main.jsx` returns 0 (not imported)
- Failure state exposed: If landing page breaks after App.css deletion, check for hidden `@import './App.css'` in any component; if Button renders grey, check `--primary` var in DevTools → `:root` computed styles

## Inputs

- `client/index.html` — existing HTML with Outfit/Poppins Google Fonts links
- `client/src/App.css` — stale Vite scaffold to be deleted
- `client/src/index.css` — "claude blu 2" CSS variables (from T02 output)
- `client/tailwind.config.js` — semantic token map (from T03 output)
- `client/src/components/ui/button.tsx` — generated Button (from T01 output)

## Expected Output

- `client/index.html` — updated with Inter font link; Outfit/Poppins preserved
- `client/src/App.css` — deleted
- Dev server: Button renders with blue-indigo primary; dark mode toggle shifts colour; landing page unchanged
- `npm run build` exits 0 from `client/`
