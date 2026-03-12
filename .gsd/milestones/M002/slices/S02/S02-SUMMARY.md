---
id: S02
parent: M002
milestone: M002
provides:
  - all room modals migrated to shadcn Dialog
  - room settings toggles migrated to shadcn Switch
  - end-session confirmation migrated to shadcn AlertDialog
  - modal form controls (Input, Label, Button) migrated to shadcn primitives
requires:
  - slice: S01
    provides: shadcn scaffold and theme
affects:
  - S04 (for toast replacement)
key_files:
  - client/src/components/Room/RoomSettingsModal.jsx
  - client/src/components/Room/EditProfileModal.jsx
  - client/src/components/InviteModal.jsx
  - client/src/components/GuestJoinModal.jsx
  - client/src/components/JoinSessionModal.jsx
key_decisions:
  - Migrated JoinSessionModal.jsx even though it wasn't explicitly in the roadmap, for consistency across all modals.
  - Used sr-only titles for GuestJoinModal to maintain accessibility while keeping the visual design clean.
  - Nested AlertDialog inside RoomSettingsModal for the termination flow.
patterns_established:
  - Modal migration to Dialog with proper Header/Title/Description.
  - Using Switch for boolean settings with semantic Label pairing.
  - AlertDialog for destructive "Danger Zone" actions.
observability_surfaces:
  - none
drill_down_paths:
  - none
duration: 40m
verification_result: passed
completed_at: 2026-03-12
---

# S02: Modals → Dialog + Switch

**All room-facing modals and settings toggles migrated to accessible shadcn/ui primitives.**

## What Happened

All primary modals in the poker room and joining flow were rebuilt using shadcn `Dialog`. This ensures better accessibility (focus management, keyboard support) and a consistent visual style aligned with the "claude blu 2" theme. Specifically:
- `GuestJoinModal`, `InviteModal`, `EditProfileModal`, `RoomSettingsModal`, and `JoinSessionModal` now use `Dialog`.
- `RoomSettingsModal` settings for Fun Features, Auto Reveal, and Anonymous Mode were replaced with shadcn `Switch` components.
- The browser `window.confirm` for ending a session was replaced with a styled `AlertDialog`.
- Raw `input`, `label`, and `button` tags inside these modals were replaced with shadcn primitives (`Input`, `Label`, `Button`).
- Hand-rolled modal overlays and animations were removed in favor of shadcn's built-in Radix-based transitions.
- All `banana-*` token references were removed from the touched files.

## Verification

- `npm run build` in `client/` passed with no errors.
- Verified that no `banana-` tokens remain in the modified files via `grep`.
- Visually inspected component code for proper `DialogTitle` usage (accessibility requirement).

## Requirements Advanced

- R104 — All room modals now use shadcn Dialog.
- R106 — RoomSettingsModal toggles now use shadcn Switch.
- R107 — Room forms in modals now use shadcn Input / Label.
- R109 — End-session confirm replaced with AlertDialog (partial requirement completion).

## Requirements Validated

- R104 — All listed modals (and JoinSessionModal) now use Dialog/DialogContent/DialogHeader/DialogTitle.
- R106 — Three settings toggles in RoomSettingsModal use shadcn Switch.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Migrated `JoinSessionModal.jsx` to `Dialog` as well. This was not explicitly in the S02 slice title but falls under the "Modals" scope and ensures the join flow from the landing page is consistent.

## Known Limitations

- `alert()` calls for validation errors still remain in `RoomSettingsModal` and `JoinSessionModal`. These are scheduled for replacement with Sonner toasts in S04.

## Follow-ups

- S03 will handle the `TasksPane` (Sheet) and remaining form primitives in `CreateRoom.jsx`.

## Files Created/Modified

- `client/src/components/GuestJoinModal.jsx` — Migrated to Dialog + Button + Input
- `client/src/components/InviteModal.jsx` — Migrated to Dialog + Button
- `client/src/components/Room/EditProfileModal.jsx` — Migrated to Dialog + Button + Input + Label
- `client/src/components/Room/RoomSettingsModal.jsx` — Migrated to Dialog + Switch + AlertDialog + Button + Input
- `client/src/components/JoinSessionModal.jsx` — Migrated to Dialog + Button + Input

## Forward Intelligence

### What the next slice should know
- `DialogContent` with `[&>button]:hidden` was used in `GuestJoinModal` to prevent closing without action.
- The `RoomSettingsModal` has a `max-h-[90vh]` and internal scrolling to handle many settings if added.

### What's fragile
- The `onPointerDownOutside={(e) => e.preventDefault()}` on `GuestJoinModal`'s `DialogContent` is essential to prevent users from accidentally closing the "must-join" gate.

### Authoritative diagnostics
- Check `client/src/components/ui/` to ensure all primitives (dialog, switch, alert-dialog, etc.) are present.
- `grep -r "Dialog" client/src/components` to see migration progress.

### What assumptions changed
- none
