# S01: Branding & Cleanup — Research

**Date:** 2026-03-12

## Summary

S01 covers two requirements: R201 (replace "BananaPoker" text with "Keystimate" in room-facing UI) and R202 (rename all `banana_*` localStorage keys to `keystimate_*`). The scope is small and well-bounded — a total of 3 files need changes, affecting ~12 specific lines.

The one nuance is the `banana-poker/` asset directory. It's shared between landing page components (Footer, Hero, HowItWorks — all out of scope per D011) and one room component (`PlayerAvatar.jsx`). The directory itself cannot be renamed without touching landing files. The approach is to leave the directory in place but update the `PlayerAvatar` import to reference the asset by a path that doesn't carry legacy branding — either a copy or a simple alias import.

ThemeContext uses `banana-poker-theme` as its localStorage key. Since it's shared between landing and room pages, the migration needs to read from the new key first, fall back to the old key for existing users, and write only to the new key going forward.

## Recommendation

Straightforward find-and-replace approach with a one-time migration shim in ThemeContext:

1. **RoomNavbar.jsx** — Change "BananaPoker" text to "Keystimate" (1 line)
2. **Room.jsx** — Rename all `banana_session_*` → `keystimate_session_*` and `banana_tasks_open_*` → `keystimate_tasks_open_*` (8 lines)
3. **ThemeContext.jsx** — Rename `banana-poker-theme` → `keystimate-theme` with backward-compatible read (2 lines + migration shim)
4. **PlayerAvatar.jsx** — Update import path for `anonymous-monkey.svg` to avoid `banana-poker/` in room code (1 line)

No migration of existing localStorage data is needed for session/task keys because they're per-room and ephemeral — losing them just means users rejoin as new guests on next visit. Theme preference deserves a graceful migration read since losing it causes a visible flash.

## Don't Hand-Roll

_Nothing — this is pure string replacement work. No libraries or tools needed._

## Existing Code and Patterns

- `client/src/components/Room/RoomNavbar.jsx:46` — h1 with text "BananaPoker", styled with `text-xl font-black text-primary`. Change text content only.
- `client/src/pages/Room.jsx` — 8 localStorage calls using `banana_session_${roomId}` (5 occurrences) and `banana_tasks_open_${roomId}` (3 occurrences). All are template literals — simple prefix swap.
- `client/src/context/ThemeContext.jsx:7,18` — `banana-poker-theme` read on line 7, write on line 18. Shared by both landing and room pages via `ThemeProvider` in `App.jsx`.
- `client/src/components/Room/PlayerAvatar.jsx:6` — imports `anonymous-monkey.svg` from `../../assets/banana-poker/`. Only room component importing from that directory.
- `client/src/components/KeystimateLogo.jsx` — SVG logo component used by landing navbar. Available if we want to add a logo mark to the room navbar alongside the "Keystimate" text, but not required by R201.

## Constraints

- **D011 — Landing page isolation**: Zero changes to `src/components/home/` and `src/pages/Landing.jsx`. The `banana-poker/` asset directory cannot be renamed since landing components (`Footer.jsx`, `Hero.jsx`, `HowItWorks.jsx`) import from it.
- **D035 — localStorage prefix**: New prefix is `keystimate_` (underscore) for session/task keys, `keystimate-` (hyphen) for theme key (matching existing convention of `banana-poker-theme` → `keystimate-theme`).
- **ThemeContext is global**: Wrapped at `App.jsx` level, used by both landing and room. Migration must be backward-compatible.
- **No server changes needed**: All banana references are client-side only.

## Common Pitfalls

- **Breaking landing page asset imports** — The `banana-poker/` directory must stay intact. Only change the `PlayerAvatar` import path for `anonymous-monkey.svg`, don't move or rename the directory.
- **Theme flash on migration** — If we just rename the key without reading the old one, returning users get system-default theme on first load. The migration shim (read new → fallback to old → write new) prevents this.
- **Regex over-replacement** — Manual targeted edits are safer than a broad find-replace. The word "banana" appears in landing page code (CSS classes like `bg-banana-500/30`, email `support@bananapoker.com`, comments) that must not be touched.

## Open Risks

- **Stale localStorage keys accumulating** — Old `banana_session_*` and `banana_tasks_open_*` keys will linger in users' browsers indefinitely. These are small and harmless but won't be cleaned up. Not worth adding cleanup logic for ephemeral per-room keys.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| shadcn/ui | `shadcn` | installed (not needed for S01) |

No additional skills needed — S01 is pure branding text and localStorage key renaming.

## Sources

- Direct codebase exploration (rg, grep, file reads)
