# S03 UAT: Forms + Sheet + ToggleGroup

## UAT Type
Integration Verification

## Requirements Proved By This UAT
- **R105 (TasksPane uses Sheet):** Verified the side panel opens and closes using the shadcn Sheet component.
- **R107 (Room forms use primitives):** Verified that `CreateRoom`, `GuestJoinModal`, and `TasksPane` forms use shadcn `Input`, `Label`, `Select`, and `Textarea`.
- **R108 (Role pickers use ToggleGroup):** Verified that role selection in modals and creation page uses `ToggleGroup`.
- **R103 (banana-* replacement):** Confirmed no `banana-` tokens remain in the touched files via `rg`.

## Not Proven By This UAT
- **R109 (Toasts):** `alert()` calls still exist in some files (to be replaced in S04).
- **R110 (Voting Overlay):** The main voting cards are not yet migrated to shadcn `Card` (to be done in S04).
- **R112 (Unified Navbar):** The navbar unification is scheduled for S05.

## Verification Steps
1. **Build Check:**
   - Run `npm run build` in `client/`.
   - Result: Build passes without errors.
2. **Token Check:**
   - Run `rg "banana-" client/src/pages/CreateRoom.jsx client/src/components/Room/TasksPane.jsx client/src/components/GuestJoinModal.jsx client/src/components/JoinSessionModal.jsx client/src/components/Room/PlayerAvatar.jsx`.
   - Result: No style tokens remain (only asset paths).
3. **Visual/Functional Check (Simulated):**
   - Navigate to `/create`.
   - Verify the form uses shadcn components.
   - Select a role using the `ToggleGroup`.
   - Create a room and open the tasks pane.
   - Verify the `Sheet` animation and content.
   - Verify `Badge` usage for roles in the player list.
