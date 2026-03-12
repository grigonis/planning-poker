---
estimated_steps: 5
estimated_files: 4
---

# T01: Rename branding text and localStorage keys across all room-facing files

**Slice:** S01 — Branding & Cleanup
**Milestone:** M003

## Description

Single task delivering both R201 (BananaPoker → Keystimate branding) and R202 (banana_* → keystimate_* localStorage keys) across the 4 affected files. Includes a backward-compatible theme key migration shim in ThemeContext so returning users don't lose their theme preference.

## Steps

1. In `RoomNavbar.jsx` line 46, change the h1 text content from `BananaPoker` to `Keystimate`
2. In `Room.jsx`, replace all 8 occurrences: `banana_session_` → `keystimate_session_` (5 occurrences on lines 74, 106, 119, 145, 363) and `banana_tasks_open_` → `keystimate_tasks_open_` (3 occurrences on lines 43, 462, 534)
3. In `ThemeContext.jsx`, replace the localStorage logic:
   - Line 7: read from `keystimate-theme` first; if null, fall back to reading `banana-poker-theme`; if the old key was used, write to `keystimate-theme` immediately (one-time migration)
   - Line 18: write to `keystimate-theme` only (no change to write target beyond the key name)
4. In `PlayerAvatar.jsx` line 6, update the import path for `anonymous-monkey.svg` to avoid the `banana-poker/` directory in room code — copy the SVG to `client/src/assets/anonymous-monkey.svg` and update the import to `../../assets/anonymous-monkey.svg`
5. Run all 9 verification grep commands. Confirm zero landing page changes by checking `client/src/components/home/` and `client/src/pages/Landing.jsx` are unmodified in git.

## Must-Haves

- [ ] Navbar displays "Keystimate" (R201)
- [ ] All `banana_session_*` keys renamed to `keystimate_session_*` in Room.jsx (R202)
- [ ] All `banana_tasks_open_*` keys renamed to `keystimate_tasks_open_*` in Room.jsx (R202)
- [ ] ThemeContext uses `keystimate-theme` with backward-compatible fallback from `banana-poker-theme` (R202)
- [ ] PlayerAvatar import path no longer references `banana-poker/` directory (R201)
- [ ] `assets/banana-poker/` directory and all landing page files untouched (D011)

## Verification

- `rg "BananaPoker" client/src/components/Room/ client/src/pages/Room.jsx` → zero matches
- `rg "banana_session_|banana_tasks_open_" client/src/pages/Room.jsx` → zero matches
- `rg "banana-poker-theme" client/src/context/ThemeContext.jsx` → present only inside migration fallback read, not as primary key
- `rg "Keystimate" client/src/components/Room/RoomNavbar.jsx` → at least 1 match
- `rg "keystimate_session_" client/src/pages/Room.jsx` → at least 5 matches
- `rg "keystimate_tasks_open_" client/src/pages/Room.jsx` → at least 3 matches
- `rg "keystimate-theme" client/src/context/ThemeContext.jsx` → at least 1 match
- `rg "banana-poker/" client/src/components/Room/` → zero matches
- `git diff --name-only` shows no changes to `client/src/components/home/` or `client/src/pages/Landing.jsx`

## Observability Impact

- Signals added/changed: None — pure string replacement. ThemeContext migration is silent (no console output).
- How a future agent inspects this: `rg "keystimate" client/src/` to confirm all keys use new prefix; browser DevTools Local Storage tab to see runtime key names
- Failure state exposed: Theme migration failure manifests as visible theme flash on first load for returning users — self-corrects after first toggle

## Inputs

- `client/src/components/Room/RoomNavbar.jsx` — line 46, h1 with "BananaPoker" text
- `client/src/pages/Room.jsx` — 8 localStorage calls with `banana_` prefix
- `client/src/context/ThemeContext.jsx` — lines 7 and 18, `banana-poker-theme` key
- `client/src/components/Room/PlayerAvatar.jsx` — line 6, import from `banana-poker/` directory
- S01-RESEARCH.md findings on file locations and line numbers

## Expected Output

- `client/src/components/Room/RoomNavbar.jsx` — h1 reads "Keystimate"
- `client/src/pages/Room.jsx` — all localStorage keys use `keystimate_session_` and `keystimate_tasks_open_` prefixes
- `client/src/context/ThemeContext.jsx` — reads `keystimate-theme`, falls back to `banana-poker-theme` on first visit, writes only `keystimate-theme`
- `client/src/components/Room/PlayerAvatar.jsx` — imports `anonymous-monkey.svg` from `../../assets/anonymous-monkey.svg`
- `client/src/assets/anonymous-monkey.svg` — copy of the SVG (original in `banana-poker/` untouched)
