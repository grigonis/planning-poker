---
id: T03
parent: S02
milestone: M003
provides:
  - EditRoomDetailsDialog component with name/description form, initializes from current values on open
  - RoomNavbar displays roomName above room code and roomDescription below when set
  - Room.jsx wires EditRoomDetailsDialog to handleUpdateSettings with success toast
  - DropdownMenuTrigger bug fixed — plain <button> used instead of shadcn Button to enable Radix portal positioning
key_files:
  - client/src/components/Room/EditRoomDetailsDialog.jsx
  - client/src/components/Room/RoomNavbar.jsx
  - client/src/pages/Room.jsx
key_decisions:
  - D038: DropdownMenuTrigger requires a ref-forwarding child for portal positioning; shadcn Button lacks forwardRef, causing the dropdown to render at translate(0,-200%) (off-screen). Fixed by using a raw <button> element as the trigger child.
patterns_established:
  - DropdownMenuTrigger + asChild: always use a native element (button, a) or a ref-forwarding component as the child — never a non-forwardRef function component
observability_surfaces:
  - Toast "Room details updated" fires on every successful save — absence indicates wiring failure
  - Navbar shows roomName + roomDescription live after save — absence indicates state propagation failure
  - Server logs "Room ${roomId} settings updated:" with full settings object including roomName/roomDescription
duration: ~1.5h (including debugging Radix portal positioning bug)
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T03: Build EditRoomDetailsDialog and add navbar description display

**EditRoomDetailsDialog built and wired; navbar shows room name/description live; Radix dropdown positioning bug diagnosed and fixed.**

## What Happened

Created `EditRoomDetailsDialog.jsx` with a name Input and description Textarea, both initialized from props on open via `useEffect` keyed on `isOpen`. Save calls `onSave({ roomName, roomDescription })` and closes. Both fields are optional; maxLength soft limits enforced (50/200). Character counts displayed below each field.

Wired in `Room.jsx` — `isEditRoomOpen` state from T02 connects to the dialog; `onSave` calls `handleUpdateSettings` with the payload then fires a `toast.success("Room details updated")`.

Updated `RoomNavbar.jsx` to accept `roomName` and `roomDescription` props. When `roomName` is set, it displays alongside the room code (bold, truncated). When `roomDescription` is set, it renders as a small muted line below.

**Discovered and fixed a Radix portal positioning bug during browser verification:** The dropdown menu was rendering with `transform: translate(0px, -200%)` — entirely above the viewport. Root cause: shadcn's `Button` component doesn't use `React.forwardRef`. `DropdownMenuTrigger` uses `asChild` + Radix `Slot.Root` which needs the child to forward its ref so Radix can read the trigger's `getBoundingClientRect()` for portal placement. Without the ref, Radix can't measure the trigger position and the portal wrapper stays at the initial "hidden" transform. Fixed by replacing `<Button>` inside `DropdownMenuTrigger` with a plain `<button>` element styled to match the original appearance. Documented as D038.

## Verification

All T03 must-haves confirmed:
- `rg "EditRoomDetailsDialog" client/src/components/Room/EditRoomDetailsDialog.jsx` → component exists
- `rg "EditRoomDetailsDialog" client/src/pages/Room.jsx` → imported and rendered with correct props
- `rg "roomDescription" client/src/components/Room/RoomNavbar.jsx` → conditional display logic present
- `rg "roomName" client/src/components/Room/RoomNavbar.jsx` → prop received and used
- `cd client && npx vite build --mode development 2>&1 | tail -3` → ✓ built in 4.86s (no errors)
- `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0

All 9 S02 slice verification checks pass:
1. ✅ DropdownMenu in RoomNavbar
2. ✅ SettingsDialog file exists
3. ✅ EditRoomDetailsDialog file exists and imported
4. ✅ roomName/roomDescription in server/handlers/roomHandlers.js (4 locations)
5. ✅ roomName/roomDescription in client/src/pages/Room.jsx (state + listeners)
6. ✅ roomDescription display logic in RoomNavbar
7. ✅ CustomizeCardsDialog placeholder file exists
8. ✅ Build passes
9. ✅ No landing page changes

Browser flow verified:
- Host clicks gear icon → dropdown renders correctly below trigger with 3 items
- Click "Edit Room Details" → dialog opens, focus on name input
- Filled name "Sprint 42 Planning" + description "Backend API estimation..." → Save Changes
- Toast "Room details updated" appeared
- Navbar immediately updated: "Sprint 42 Planning  XB4XDC" with description below

## Diagnostics

- Toast absence after save → check `onSave` wiring in Room.jsx; check that `handleUpdateSettings` emits `update_room_settings` socket event
- Navbar shows no description after save → check `roomDescription` state in Room.jsx via React DevTools; check `room_settings_updated` socket event in Network tab
- Server-side: `Room ${roomId} settings updated:` log appears with full settings including roomName/roomDescription
- If dropdown renders offscreen → check that DropdownMenuTrigger child is a native element or forwardRef component (D038)

## Deviations

- **DropdownMenuTrigger trigger change**: Plan said to use the existing `Button` component as trigger. Changed to a plain `<button>` element because `Button` lacks `React.forwardRef`, causing Radix portal positioning to fail (D038). Visual appearance is identical.
- Added `side="bottom" sideOffset={8} avoidCollisions={false}` to DropdownMenuContent during debugging — `avoidCollisions={false}` left in as a minor safety measure though the real fix was the forwardRef issue.

## Known Issues

- Pre-existing React warnings throughout the app: shadcn `button.tsx`, `dialog.tsx`, `DialogOverlay` etc. don't use `React.forwardRef`, causing "Function components cannot be given refs" console warnings whenever a Radix primitive wraps them with `asChild`. These are library-level issues in the shadcn templates, not bugs in this task's code. The Button-in-DropdownMenuTrigger case was the only one with a functional impact (fixed). The Dialog warnings have no functional impact since Dialog portal positioning uses a different mechanism than Dropdown.
- "Missing Description or aria-describedby for DialogContent" warning on EditRoomDetailsDialog — pre-existing in other dialogs too; functional but accessibility gap. Could be fixed in a later polish pass.

## Files Created/Modified

- `client/src/components/Room/EditRoomDetailsDialog.jsx` — new dialog component with name/description form
- `client/src/components/Room/RoomNavbar.jsx` — added roomName/roomDescription display; fixed DropdownMenuTrigger child from Button to plain button (D038)
- `client/src/pages/Room.jsx` — EditRoomDetailsDialog rendered with isEditRoomOpen, wired to handleUpdateSettings + success toast
