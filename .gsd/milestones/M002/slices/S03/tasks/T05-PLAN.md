# Task Plan: T05 — Verification and Build

## Description
Final verification of the slice to ensure all requirements are met and no regressions are introduced.

## Steps
1. Run `npm run build` in `client/` to verify imports and types.
2. Run a global `rg "banana-"` and `rg "orange-"` in the room scope to ensure no tokens were missed in the files touched in this slice.
3. Perform a manual end-to-end walkthrough:
    - Create a room (`/create`).
    - Join as a guest.
    - Open tasks pane, add tasks.
    - Change profile (EditProfileModal).
4. Check both Light and Dark modes.

## Must-haves
- Build passes.
- Zero `banana-` or `orange-` tokens in:
    - `CreateRoom.jsx`
    - `TasksPane.jsx`
    - `GuestJoinModal.jsx`
    - `JoinSessionModal.jsx`
    - `PlayerAvatar.jsx`
    - `EditProfileModal.jsx`

## Verification
- `npm run build` exit code 0.
- `rg` results are empty for the specified files.

## Observability Impact
- Confidence in the migration quality.

## Inputs
- All files modified in S03.

## Expected Output
- Verified and ready-to-merge slice.
