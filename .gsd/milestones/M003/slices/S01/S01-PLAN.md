# S01: Branding & Cleanup

**Goal:** Replace all room-facing "BananaPoker" text with "Keystimate" and rename all `banana_*` localStorage keys to `keystimate_*` with backward-compatible theme migration.
**Demo:** Open a room — navbar says "Keystimate". localStorage keys use `keystimate_` prefix. Returning users with the old theme key get seamless migration to the new one.

## Must-Haves

- Navbar h1 text says "Keystimate" instead of "BananaPoker" (R201)
- All `banana_session_*` localStorage keys renamed to `keystimate_session_*` (R202)
- All `banana_tasks_open_*` localStorage keys renamed to `keystimate_tasks_open_*` (R202)
- `banana-poker-theme` localStorage key renamed to `keystimate-theme` with backward-compatible read (R202)
- `PlayerAvatar.jsx` import path updated to avoid `banana-poker/` directory reference in room code (R201)
- Zero changes to `src/components/home/`, `src/pages/Landing.jsx`, or the `assets/banana-poker/` directory (D011)

## Proof Level

- This slice proves: contract
- Real runtime required: no (grep verification sufficient for string replacements)
- Human/UAT required: no

## Verification

- `rg "BananaPoker" client/src/components/Room/ client/src/pages/Room.jsx` → zero matches
- `rg "banana_session_|banana_tasks_open_" client/src/pages/Room.jsx` → zero matches
- `rg "banana-poker-theme" client/src/context/ThemeContext.jsx` → present only in migration fallback, not as primary key
- `rg "Keystimate" client/src/components/Room/RoomNavbar.jsx` → at least 1 match
- `rg "keystimate_session_" client/src/pages/Room.jsx` → at least 5 matches
- `rg "keystimate_tasks_open_" client/src/pages/Room.jsx` → at least 3 matches
- `rg "keystimate-theme" client/src/context/ThemeContext.jsx` → at least 1 match
- `rg "banana-poker/" client/src/components/Room/` → zero matches
- `rg "banana" client/src/components/home/ client/src/pages/Landing.jsx` → unchanged (landing untouched)

## Observability / Diagnostics

- Runtime signals: ThemeContext migration shim logs nothing — silent fallback read. No structured logging needed for pure string replacement work.
- Inspection surfaces: Browser DevTools → Application → Local Storage shows key names
- Failure visibility: If theme migration fails, user sees a theme flash on first load (visual only, self-correcting on next toggle)
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: none (first slice)
- New wiring introduced in this slice: ThemeContext migration shim (read `keystimate-theme` → fallback to `banana-poker-theme` → write `keystimate-theme`)
- What remains before the milestone is truly usable end-to-end: S02 (host dropdown + dialogs), S03 (card customizer), S04 (participant panel), S05 (integration polish)

## Tasks

- [x] **T01: Rename branding text and localStorage keys across all room-facing files** `est:20m`
  - Why: Delivers both R201 (branding) and R202 (localStorage keys) in a single pass across the 4 affected files
  - Files: `client/src/components/Room/RoomNavbar.jsx`, `client/src/pages/Room.jsx`, `client/src/context/ThemeContext.jsx`, `client/src/components/Room/PlayerAvatar.jsx`
  - Do: (1) Change "BananaPoker" → "Keystimate" in RoomNavbar h1. (2) Replace all `banana_session_` → `keystimate_session_` and `banana_tasks_open_` → `keystimate_tasks_open_` in Room.jsx (8 occurrences). (3) In ThemeContext.jsx, change key to `keystimate-theme` with migration shim: read new key first, if null read old `banana-poker-theme` key, always write to new key. (4) In PlayerAvatar.jsx, update the import to reference `anonymous-monkey.svg` via a path that doesn't include `banana-poker/` in room code — copy the SVG to `assets/` root or use a re-export. Do NOT rename/move the `banana-poker/` directory. (5) Verify zero landing page changes.
  - Verify: Run all 9 rg verification commands from the Verification section above — all must pass
  - Done when: No `BananaPoker` text or `banana_*` keys in room-facing code; `Keystimate` and `keystimate_*` present; landing page files untouched; ThemeContext has backward-compatible migration

## Files Likely Touched

- `client/src/components/Room/RoomNavbar.jsx`
- `client/src/pages/Room.jsx`
- `client/src/context/ThemeContext.jsx`
- `client/src/components/Room/PlayerAvatar.jsx`
