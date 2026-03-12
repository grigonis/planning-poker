---
estimated_steps: 10
estimated_files: 4
---

# T02: Migrate all alert() to Sonner toasts

**Slice:** S04 — Voting Overlay + Toasts
**Milestone:** M002

## Description

Replace all 10 identified `alert()` calls in the room and joining flow with `toast()` from `sonner`. This makes the error/info messages non-blocking and visually consistent with the theme.

## Steps

1. Replace 2 `alert()` in `client/src/pages/CreateRoom.jsx` with `toast.error()`.
2. Replace 2 `alert()` in `client/src/pages/Room.jsx` with `toast.error()`.
3. Replace 2 `alert()` in `client/src/components/JoinSessionModal.jsx` with `toast.error()`.
4. Replace 4 `alert()` in `client/src/components/Room/RoomSettingsModal.jsx` with `toast.error()`.
5. Ensure `import { toast } from "sonner"` is added to each file.

## Must-Haves

- [ ] All `alert()` calls removed from identified files.
- [ ] No browser-native blocking dialogs trigger on error conditions.

## Verification

- `grep -r "alert(" client/src` should show zero hits in the touched files.
- Manual UAT:
    - Attempt to create a room without a name -> Verify toast.
    - Attempt to join a room with invalid code -> Verify toast.
    - Host settings errors -> Verify toast.

## Observability Impact

- Signals added/changed: `toast` calls provide better visibility into UI error paths than `alert()`.
- How a future agent inspects this: Monitor `sonner` internal state or console logs if toast triggers are logged.
- Failure state exposed: UI remains responsive during error states.

## Inputs

- `T01` — `sonner` must be installed.
- `S04-RESEARCH.md` — List of `alert()` locations.

## Expected Output

- `client/src/pages/CreateRoom.jsx` — No `alert()`.
- `client/src/pages/Room.jsx` — No `alert()`.
- `client/src/components/JoinSessionModal.jsx` — No `alert()`.
- `client/src/components/Room/RoomSettingsModal.jsx` — No `alert()`.
