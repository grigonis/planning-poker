# S04: Voting Overlay + Toasts

**Goal:** Rebuild the voting card picker and replace all blocking browser alerts with modern toasts.
**Demo:** All room alerts appear as Sonner toasts; the voting overlay uses shadcn Card components; no `banana-*` tokens remain in the poker room UI.

## Must-Haves

- [x] shadcn `card` and `sonner` primitives installed
- [x] `<Toaster />` mounted in `App.jsx`
- [x] All 10 identified `alert()` calls replaced with `toast()`
- [x] `VotingOverlay.jsx` rebuilt using `Card` primitives
- [x] `Card.jsx` (revealed votes) uses semantic tokens (`bg-card`, `text-card-foreground`, `ring-primary`)
- [x] Zero `banana-*` tokens in `client/src/components/Room`, `client/src/components/Voting`, and `client/src/pages/Room.jsx`

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run build` in `client/` passes
- `rg "banana-" client/src/components/Room client/src/components/Voting client/src/pages/Room.jsx` returns zero results
- Manual UAT: Trigger a toast (e.g. invalid room code), open voting overlay, reveal cards, verify "claude blu 2" colors.

## Observability / Diagnostics

- Runtime signals: `sonner` toast events; React DevTools for `Card` component hierarchy.
- Inspection surfaces: Console logs for toast triggers; `client/src/components/ui/` for primitive presence.
- Failure visibility: Broken CSS tokens will result in unstyled elements (transparent/white); `alert()` fallback if toast is missing.

## Integration Closure

- Upstream surfaces consumed: `client/src/index.css` (semantic tokens), `client/src/App.jsx` (root mount).
- New wiring introduced in this slice: `sonner` global provider; `Card` composition in `VotingOverlay`.
- What remains before the milestone is truly usable end-to-end: S05 (Navbar Unification + Cleanup).

## Tasks

- [x] **T01: Install Card & Sonner primitives** `est:15m`
  - Why: Provides the base components needed for the voting UI and toast system.
  - Files: `client/components.json`, `client/src/App.jsx`
  - Do: Add `card` and `sonner` via `npx shadcn add`; mount `<Toaster />` in `App.jsx`.
  - Verify: Check `client/src/components/ui/card.tsx` and `sonner.tsx` exist; verify `<Toaster />` is in DOM.
  - Done when: Primitives are available and Toaster is mounted.

- [x] **T02: Migrate all alert() to Sonner toasts** `est:30m`
  - Why: Replaces blocking, unstyled browser dialogs with consistent theme-aware toasts (R109).
  - Files: `client/src/pages/CreateRoom.jsx`, `client/src/pages/Room.jsx`, `client/src/components/JoinSessionModal.jsx`, `client/src/components/Room/RoomSettingsModal.jsx`
  - Do: Replace 10 `alert()` calls with `toast.error()` or `toast.info()`.
  - Verify: Trigger alert conditions in browser and see toasts.
  - Done when: All 10 identified `alert()` calls are replaced.

- [x] **T03: Rebuild VotingOverlay with shadcn Card** `est:45m`
  - Why: Modernizes the main voting UI and eliminates broken tokens (R110, R103).
  - Files: `client/src/components/Voting/VotingOverlay.jsx`
  - Do: Rewrite the card selection grid using shadcn `Card` components; apply `ring-primary` for selection; maintain existing animations.
  - Verify: Open voting overlay in browser; verify card styling and selection state.
  - Done when: Overlay is functional and uses `Card` primitives with semantic tokens.

- [x] **T04: Final Card & Room Token Cleanup** `est:30m`
  - Why: Ensures all voting cards and the poker table use the new design system (R111, R103).
  - Files: `client/src/components/Voting/Card.jsx`, `client/src/components/Room/PokerTable.jsx`, `client/src/pages/Room.jsx`
  - Do: Update `Card.jsx` to use `bg-card` and `ring-primary`; sweep `PokerTable.jsx` and `Room.jsx` for remaining `banana-` tokens.
  - Verify: `rg "banana-"` returns zero hits in room scope; revealed cards look correct in both themes.
  - Done when: Zero broken tokens remain in room files.

## Files Likely Touched

- `client/src/App.jsx`
- `client/src/components/ui/card.tsx`
- `client/src/components/ui/sonner.tsx`
- `client/src/components/Voting/VotingOverlay.jsx`
- `client/src/components/Voting/Card.jsx`
- `client/src/components/Room/PokerTable.jsx`
- `client/src/pages/Room.jsx`
- `client/src/pages/CreateRoom.jsx`
- `client/src/components/JoinSessionModal.jsx`
- `client/src/components/Room/RoomSettingsModal.jsx`
