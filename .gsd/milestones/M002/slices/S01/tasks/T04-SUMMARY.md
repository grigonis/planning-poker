---
id: T04
parent: S01
milestone: M002
provides:
  - client/index.html with Inter Google Fonts link (Outfit/Poppins preserved)
  - client/src/App.css deleted
  - Full OKLCH token chain verified end-to-end in browser (light + dark mode)
  - npm run build exits 0
key_files:
  - client/index.html
  - client/src/App.jsx
key_decisions:
  - Test buttons added temporarily in App.jsx for visual colour verification, then reverted before commit
  - ERR_CONNECTION_REFUSED console errors are expected (socket backend not running during frontend smoke test) — not a regression
patterns_established:
  - shadcn Button uses bg-primary which resolves to oklch(0.55 0.15 252) in light mode and oklch(0.66 0.12 252) in dark mode via the CSS variable bridge pattern
  - Inter font loaded globally via Google Fonts <link> in index.html; font-family resolves as "Inter, sans-serif" on all shadcn components
observability_surfaces:
  - grep "Inter" client/index.html — confirms font link present
  - ls client/src/App.css — must return non-zero (file not found)
  - cd client && npm run build — exits 0
  - Browser DevTools → Elements → Computed → background-color on button.bg-primary shows oklch value
  - Browser DevTools → Computed → --primary on :root shows bare channel values (0.55 0.15 252 light / 0.66 0.12 252 dark)
duration: 1 session (resumed from crash at step 4/7)
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T04: Add Inter font, delete App.css, smoke test in browser

**Inter font loaded globally, App.css removed, and the full OKLCH token chain confirmed end-to-end in both light and dark mode via browser smoke test with `npm run build` passing.**

## What Happened

The task resumed after a crash that had already completed steps 1–3 (Inter font added to `index.html`, `App.css` deleted, dev server started). The previous session had also temporarily added test buttons to `App.jsx` for visual colour confirmation.

On resuming:
- Verified `client/index.html` had the Inter font `<link>` after the Outfit/Poppins link ✅
- Verified `client/src/App.css` does not exist (exit 2) ✅
- Started a fresh dev server on port 5174
- Navigated to `/` in the browser — landing page rendered correctly in light mode
- Verified the "Primary Test" shadcn Button computed background-color: `oklch(0.55 0.15 252)` and font-family: `Inter, sans-serif` ✅
- Toggled dark mode via the ThemeToggle — Button background shifted to `oklch(0.66 0.12 252)` ✅
- Landing page rendered correctly in both light and dark modes with no visual regressions ✅
- Reverted `App.jsx` to remove the temporary test buttons (Button import also removed) ✅
- Ran `npm run build` from `client/` — exited 0 (only Tailwind ambiguous-class warnings, no errors) ✅

## Verification

**File checks:**
- `grep "Inter" client/index.html` — shows the Inter Google Fonts link ✅
- `grep "Outfit" client/index.html` — Outfit/Poppins link still present ✅
- `ls client/src/App.css` — exit 2 (not found) ✅
- `ls client/src/lib/utils.ts` — exists ✅
- `ls client/src/components/ui/button.tsx` — exists ✅
- `ls client/components.json` — exists ✅

**CSS import checks (all return exit 1 = not found):**
- `rg "@import \"shadcn/tailwind"` — no hits ✅
- `rg "@import \"tw-animate"` — no hits ✅
- `rg "@import \"@fontsource"` — no hits ✅

**Browser smoke test:**
- Light mode `bg-primary` computed: `oklch(0.55 0.15 252)` ✅
- Dark mode `bg-primary` computed: `oklch(0.66 0.12 252)` ✅
- `--primary` CSS var: bare channels `0.55 0.15 252` (light) / `0.66 0.12 252` (dark) ✅
- `font-family` on Button: `Inter, sans-serif` ✅
- Landing page at `/` — no visual regression in light or dark mode ✅
- No CSS variable or import errors in browser console ✅

**Build:**
- `cd client && npm run build` — exits 0, 2550 modules transformed ✅

## Diagnostics

- **Font loading**: Browser DevTools → Network → Fonts tab should show Inter weights loading from fonts.gstatic.com
- **Token inspection**: DevTools → Elements → `:root` → Computed → filter `--primary` shows bare OKLCH channels
- **Button colour**: DevTools → select any `.bg-primary` element → Computed → `background-color` shows `oklch(...)` blue value
- **Build errors**: `cd client && npm run build 2>&1 | grep "error"` — should return empty
- **App.css removal**: `grep "App.css" client/src/main.jsx` — returns 0 (not imported); `ls client/src/App.css` — file not found

## Deviations

- The dev server started on port 5174 instead of the default 5173 (a port was already in use). No config change needed — Vite auto-increments.
- Temporary test buttons were added to `App.jsx` during visual verification (as planned in the task plan), then reverted before commit.

## Known Issues

- `ERR_CONNECTION_REFUSED` console errors appear because the WebSocket/socket.io backend is not running during frontend-only smoke tests. This is expected and pre-existing — not introduced by this task.
- Build warns about large SVG/AVIF asset chunks (>500kB). Pre-existing issue, out of scope for S01.

## Files Created/Modified

- `client/index.html` — added Inter Google Fonts `<link>` after existing Outfit/Poppins link
- `client/src/App.jsx` — temporarily added test Button imports/components for smoke test, then reverted to clean state (no Button import)
- `client/src/App.css` — **deleted**
