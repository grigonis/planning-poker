# Task Plan: T04 — Update Role Pickers and Avatars

## Description
Unify role selection and display by updating `GuestJoinModal`, `JoinSessionModal`, and `PlayerAvatar`. Use `ToggleGroup` for selection and `Badge` for display.

## Steps
1. **GuestJoinModal.jsx**:
    - Replace manual role buttons with `ToggleGroup`.
    - Ensure it handles both `STANDARD` and `SPLIT` modes correctly (though SPLIT is legacy, it's still in the code).
    - Replace any remaining legacy tokens.
2. **JoinSessionModal.jsx**:
    - Replace manual role buttons with `ToggleGroup`.
    - Replace any remaining legacy tokens.
3. **PlayerAvatar.jsx**:
    - Replace the role `span` with shadcn `Badge`.
    - Define appropriate variants for different roles if needed (or use custom styles on Badge).
    - Replace `banana-` tokens.

## Must-haves
- `ToggleGroup` used for role selection in modals.
- `Badge` used for role display in `PlayerAvatar`.
- Zero `banana-` tokens in these files.

## Verification
- Manual check: Join a room as guest, check role selection.
- Manual check: Open `JoinSessionModal` from landing page (if applicable).
- Manual check: Check role display on avatars in the room.
- `rg "banana-"` on these three files.

## Observability Impact
- Consistent role selection UI across different modals.

## Inputs
- `client/src/components/GuestJoinModal.jsx`
- `client/src/components/JoinSessionModal.jsx`
- `client/src/components/Room/PlayerAvatar.jsx`

## Expected Output
- Unified role-related UI components.
