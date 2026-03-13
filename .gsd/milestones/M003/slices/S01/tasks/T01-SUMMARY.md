---
id: T01
parent: S01
milestone: M003
provides:
  - Keystimate branding in room navbar (R201)
  - keystimate_* localStorage key prefix for sessions and tasks pane (R202)
  - Backward-compatible theme key migration from banana-poker-theme to keystimate-theme (R202)
  - PlayerAvatar import decoupled from banana-poker/ directory in room code (R201)
key_files:
  - client/src/components/Room/RoomNavbar.jsx
  - client/src/pages/Room.jsx
  - client/src/context/ThemeContext.jsx
  - client/src/components/Room/PlayerAvatar.jsx
  - client/src/assets/anonymous-monkey.svg
key_decisions:
  - ThemeContext migration reads keystimate-theme first, falls back to banana-poker-theme if null, writes only keystimate-theme — silent one-time migration, no console output
  - Copied anonymous-monkey.svg to assets/ root rather than re-exporting or symlinking — keeps the original banana-poker/ directory untouched per D011
patterns_established:
  - localStorage keys in room code use keystimate_ prefix going forward
observability_surfaces:
  - none — pure string replacement work; theme migration failure manifests as visible theme flash on first load (self-correcting)
duration: 5m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Rename branding text and localStorage keys across all room-facing files

**Replaced all room-facing "BananaPoker" branding with "Keystimate" and renamed banana_* localStorage keys to keystimate_* with backward-compatible theme migration.**

## What Happened

Four files edited, one asset copied:

1. **RoomNavbar.jsx** — h1 text `BananaPoker` → `Keystimate`
2. **Room.jsx** — 8 localStorage key references renamed: `banana_session_` → `keystimate_session_` (5), `banana_tasks_open_` → `keystimate_tasks_open_` (3)
3. **ThemeContext.jsx** — Primary key changed to `keystimate-theme`. Added migration shim: reads new key first; if null, reads legacy `banana-poker-theme`; if found, immediately writes to `keystimate-theme`. Write path uses only the new key.
4. **PlayerAvatar.jsx** — Import path changed from `../../assets/banana-poker/anonymous-monkey.svg` to `../../assets/anonymous-monkey.svg`
5. **assets/anonymous-monkey.svg** — Copied from `assets/banana-poker/` to `assets/` root. Original untouched.

## Verification

All 9 slice-level verification checks pass:

- V1: `rg "BananaPoker" Room/ Room.jsx` → 0 matches ✅
- V2: `rg "banana_session_|banana_tasks_open_" Room.jsx` → 0 matches ✅
- V3: `rg "banana-poker-theme" ThemeContext.jsx` → line 10 only (migration fallback) ✅
- V4: `rg "Keystimate" RoomNavbar.jsx` → 1 match ✅
- V5: `rg -c "keystimate_session_" Room.jsx` → 5 ✅
- V6: `rg -c "keystimate_tasks_open_" Room.jsx` → 3 ✅
- V7: `rg -c "keystimate-theme" ThemeContext.jsx` → 3 ✅
- V8: `rg "banana-poker/" Room/` → 0 matches ✅
- V9: `git diff --name-only` → no changes to `home/` or `Landing.jsx` ✅

## Diagnostics

- Inspect runtime keys: Browser DevTools → Application → Local Storage → look for `keystimate_session_*`, `keystimate_tasks_open_*`, `keystimate-theme`
- Grep confirmation: `rg "keystimate" client/src/` shows all new key usages

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `client/src/components/Room/RoomNavbar.jsx` — h1 text BananaPoker → Keystimate
- `client/src/pages/Room.jsx` — 8 localStorage key renames (banana_ → keystimate_)
- `client/src/context/ThemeContext.jsx` — keystimate-theme as primary key with banana-poker-theme migration fallback
- `client/src/components/Room/PlayerAvatar.jsx` — import path updated to assets/anonymous-monkey.svg
- `client/src/assets/anonymous-monkey.svg` — copy of SVG from banana-poker/ subdirectory
