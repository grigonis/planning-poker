---
id: S04
parent: M002
milestone: M002
provides:
  - shadcn Card and Sonner integration
  - Rebuilt VotingOverlay with Card primitives
  - Non-blocking Sonner toasts for all room alerts
  - Zero banana-* tokens in room scope
requires:
  - slice: S03
    provides: form primitives stable
affects:
  - S05
key_files:
  - client/src/components/Voting/VotingOverlay.jsx
  - client/src/components/Voting/Card.jsx
  - client/src/App.jsx
key_decisions:
  - Replaced all 10 alert() calls with toast.error() for consistency.
  - Updated additional components (ThemeToggle, ResultsBoard, ShufflingCards) to ensure complete theme migration.
patterns_established:
  - Use of shadcn Card for complex grid selection UIs.
  - Global toast notifications via Sonner.
observability_surfaces:
  - sonner toast events
  - npm run build (contract)
  - rg "banana-" (contract)
drill_down_paths:
  - .gsd/milestones/M002/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S04/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S04/tasks/T03-SUMMARY.md
  - .gsd/milestones/M002/slices/S04/tasks/T04-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-12
---

# S04: Voting Overlay + Toasts

**Rebuilt the voting card picker with shadcn Card components and replaced all blocking browser alerts with modern Sonner toasts.**

## What Happened

The slice successfully modernized the voting experience and alert system. 
1. **Infrastructure**: Installed `card` and `sonner` primitives and mounted the `<Toaster />` in `App.jsx`.
2. **Alert Migration**: Replaced all 10 `alert()` calls across the room creation, joining, and settings flows with `toast.error()`, making the UI non-blocking and theme-aware.
3. **Voting Overlay**: Completely rebuilt `VotingOverlay.jsx` using shadcn `Card` components, replacing custom glassmorphism with semantic tokens and fixing OKLCH color issues.
4. **Token Cleanup**: Performed a final sweep of `Card.jsx`, `PokerTable.jsx`, and `Room.jsx`, ensuring zero `banana-*` or `orange-*` tokens remain. Additional components like `ThemeToggle` were also updated for theme consistency.

## Verification

- `npm run build` in `client/` passed successfully.
- `rg "banana-" client/src/components/Room client/src/components/Voting client/src/pages/Room.jsx` returns zero hits (excluding assets).
- Manual UAT confirmed that toasts appear correctly, cards in the overlay are styled with the blue theme, and revealed cards use semantic tokens.

## Requirements Advanced

- R103 — All 47+ banana-* tokens replaced with semantic tokens.
- R109 — All 10 alert() calls replaced with Sonner toasts.
- R110 — VotingOverlay rebuilt using Card primitives.
- R111 — Card.jsx revealed state updated with semantic tokens.

## Requirements Validated

- R103 — Verified by `rg` and manual inspection of the room UI.
- R109 — Verified by triggering error conditions in room settings and creation.
- R110 — Verified by opening the voting overlay and selecting cards.
- R111 — Verified by revealing votes and checking card styling.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Updated `ThemeToggle.jsx`, `ResultsBoard.jsx`, and `ShufflingCards.jsx` for consistency, which were not explicitly in the task list but were necessary for full theme coverage in the room UI.

## Known Limitations

- The navbar still needs unification (S05).
- Some custom vote progress bars in `PokerTable` are still hand-rolled (to be replaced by shadcn Progress in S05).

## Follow-ups

- S05 will handle the navbar unification and final Progress component migration.

## Files Created/Modified

- `client/src/App.jsx` — Mounted Toaster.
- `client/src/components/Voting/VotingOverlay.jsx` — Rebuilt with Card.
- `client/src/components/Voting/Card.jsx` — Updated with semantic tokens.
- `client/src/components/Room/PokerTable.jsx` — Token cleanup.
- `client/src/pages/Room.jsx` — Token cleanup and toast integration.
- `client/src/components/ui/card.tsx` — New primitive.
- `client/src/components/ui/sonner.tsx` — New primitive.

## Forward Intelligence

### What the next slice should know
- The "Claude Blue 2" theme is now fully applied to the voting cards and table.
- Sonner is ready for any new alerts in S05.
- `VotingOverlay` uses `framer-motion` alongside shadcn `Card`.

### What's fragile
- Confetti colors in `Room.jsx` are hardcoded in an array; they match the theme now but aren't dynamically tied to CSS variables.

### Authoritative diagnostics
- `rg "banana-"` is the best way to check for missed tokens.
- `npm run build` catches any broken imports or TypeScript errors.

### What assumptions changed
- Originally thought `alert()` calls were only 8, but found 10 and migrated all of them.
