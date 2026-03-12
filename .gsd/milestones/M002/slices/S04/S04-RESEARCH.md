# Slice S04: Voting Overlay + Toasts — Research

## Overview
Slice S04 focuses on rebuilding the most prominent voting UI elements and replacing all browser `alert()` dialogs with a modern toast system. It also ensures the complete elimination of broken `banana-*` tokens from the room scope.

## Requirements Coverage
- **R103 (Broken banana-* replacement):** Supports by cleaning up `VotingOverlay`, `Card`, `Room.jsx`, and `PokerTable.jsx`.
- **R109 (alert()/confirm() replacement):** Primary owner. 10 `alert()` calls identified across 4 files. `confirm()` already replaced by `AlertDialog` in S02.
- **R110 (VotingOverlay card rebuild):** Primary owner. Rebuilding the fullscreen voting picker using shadcn `Card`.
- **R111 (Card.jsx semantic tokens):** Primary owner. Updating the revealed vote cards to use theme-consistent tokens.

## Key Findings

### alert() Locations
There are 10 `alert()` calls that need to be replaced with `toast()` from `sonner`:
1. `client/src/pages/CreateRoom.jsx` (2 calls)
2. `client/src/pages/Room.jsx` (2 calls)
3. `client/src/components/JoinSessionModal.jsx` (2 calls)
4. `client/src/components/Room/RoomSettingsModal.jsx` (4 calls)

### VotingOverlay & Card Analysis
- **VotingOverlay.jsx:** Currently uses manual glassmorphism with `banana-` tokens and hardcoded shadow/glow effects. It will be rebuilt using the shadcn `Card` primitive.
- **Card.jsx (Voting):** Used for face-up/face-down votes on the table. Needs to transition from `orange-500`/`banana-500` to `primary` and `card` semantic tokens.

### banana-* Token Surface Area
The following files still contain broken tokens or `orange-*` tokens that should be unified:
- `client/src/pages/Room.jsx`: `selection:bg-banana-500/30`, `text-banana-500`, etc.
- `client/src/components/Voting/VotingOverlay.jsx`: Entire surface.
- `client/src/components/Voting/Card.jsx`: Borders and rings.
- `client/src/components/Room/PokerTable.jsx`: Center glow, progress bar, result text, and "Quick Start" button.

### New Components Needed
- `card` (shadcn)
- `sonner` (shadcn)

## Implementation Plan

### T01: Add shadcn Components
- Install `card` and `sonner` using `npx shadcn add`.
- Verify they are correctly placed in `src/components/ui/`.

### T02: Implement Sonner Toasts
- Mount `<Toaster />` in `client/src/App.jsx`.
- Replace all 10 `alert()` calls with `toast.error()` or `toast.info()`.
- Ensure `sonner` is imported correctly in each file.

### T03: Rebuild VotingOverlay
- Replace the manual card buttons with shadcn `Card` components.
- Use `ring-primary` for the selected state.
- Remove all `banana-` and `dark-900` tokens.
- Maintain the animations (`animate-in`, `fade-in`, etc.).

### T04: Update Card.jsx
- Migrate to `bg-card`, `text-card-foreground`.
- Replace `ring-orange-500` with `ring-primary`.
- Update face-down pattern to use primary gradients.

### T05: Final Room Token Cleanup
- Sweep `Room.jsx` and `PokerTable.jsx` for any remaining `banana-` or `orange-` tokens.
- Replace with `primary`, `muted`, or `accent` as appropriate.
- Update `confetti` colors in `Room.jsx` to match the "claude blu 2" primary blue.

## Risks & Constraints
- **Animation Continuity:** `VotingOverlay` has custom animations that must be preserved during the transition to shadcn primitives.
- **Glassmorphism:** `PokerTable` uses a specific glass look. Only tokens *inside* the table and its overlays should be updated (per D013), avoiding a full rewrite of the table's CSS unless necessary for token resolution.

## Verification Strategy
- **Contract:** `npm run build` must pass. `rg "banana-"` in room scope must return zero results (excluding assets).
- **Manual UAT:**
    1. Trigger `alert()` conditions (e.g. invalid room code, voting during round) -> Verify Sonner toast.
    2. Start a vote -> Verify new `VotingOverlay` look and feel.
    3. Reveal cards -> Verify `Card.jsx` styling.
    4. Check dark/light mode on all touched surfaces.
