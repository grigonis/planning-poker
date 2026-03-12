# S02: Modals → Dialog + Switch — UAT

**Milestone:** M002
**Written:** 2026-03-12

## UAT Type

- UAT mode: human-experience
- Why this mode is sufficient: UI/UX changes to modals and interactive toggles are best verified by experiencing the transitions, focus management, and visual alignment in the browser.

## Preconditions

- shadcn/ui is initialized (S01 complete).
- Dev server is running (`npm run dev` in `client/`).

## Smoke Test

1. Open the room settings modal.
2. **Expected:** A styled shadcn Dialog appears with a blue primary theme, and the toggles are shadcn Switch components.

## Test Cases

### 1. Room Settings Toggle

1. Open a room session.
2. Open Room Settings.
3. Toggle "Celebration Effects".
4. **Expected:** The switch animates smoothly between states and updates the local setting state.

### 2. Session Termination Flow

1. Open Room Settings as a host.
2. Click "Terminate Voting Session".
3. **Expected:** A shadcn AlertDialog appears asking for confirmation. Click "Cancel" to dismiss or "End Session" to trigger the flow.

### 3. Guest Join Force-Modal

1. Navigate to a room URL without an active session (e.g., `/room/ABCD`).
2. **Expected:** The `GuestJoinModal` appears as a Dialog. Clicking outside or pressing Escape should NOT close it.

## Edge Cases

### Long Custom Scale

1. Open Room Settings.
2. Enable Custom Scale.
3. Enter a very long list of comma-separated values.
4. **Expected:** The preview badges wrap correctly within the modal, and the modal remains usable (internal scrolling).

## Failure Signals

- Modals failing to open (check console for missing component imports).
- Modal content missing (check for proper `DialogTitle` and `DialogContent` usage).
- Toggles not updating state (check event handlers for `onCheckedChange`).

## Requirements Proved By This UAT

- R104 — Proves modals use Dialog through visual and behavioral check.
- R106 — Proves toggles use Switch through visual and behavioral check.

## Not Proven By This UAT

- Sonner toasts (deferred to S04).
- TasksPane migration (deferred to S03).

## Notes for Tester

- The close button (X) in the `GuestJoinModal` is intentionally hidden because joining is a required step to see the room.
- The "claude blu 2" theme should be evident in the primary button colors and switch active states.
