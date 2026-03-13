---
estimated_steps: 5
estimated_files: 3
---

# T03: Build EditRoomDetailsDialog and add navbar description display

**Slice:** S02 — Host Dropdown Menu & Dialogs
**Milestone:** M003

## Description

Build the EditRoomDetailsDialog — a simple form dialog where the host sets room name and description. Wire it to `handleUpdateSettings` so changes broadcast via the existing `update_room_settings` Socket.io event. Add room description display in the navbar under the room ID. This task closes the loop: T01 provided server storage, T02 provided the dropdown trigger, T03 provides the edit interface and the display surface.

## Steps

1. Create `client/src/components/Room/EditRoomDetailsDialog.jsx`:
   - shadcn Dialog with header (Pencil icon + "Edit Room Details" title)
   - Props: `isOpen`, `onClose`, `roomName`, `roomDescription`, `onSave`
   - Two fields: Input for room name (label "Room Name", placeholder "Give your room a name..."), Textarea for description (label "Description", placeholder "What's this session about?")
   - Local state for both fields, initialized from props on open (use `useEffect` keyed on `isOpen` to reset local state when dialog opens)
   - Save button calls `onSave({ roomName: localName, roomDescription: localDesc })` then closes
   - Both fields are optional — empty strings are valid
   - Add character limits as guidance: name max ~50 chars, description max ~200 chars (soft limits via maxLength on inputs, not hard validation)
2. In `client/src/pages/Room.jsx`:
   - Import EditRoomDetailsDialog
   - Render it with `isOpen={isEditRoomOpen}`, `onClose`, `roomName`, `roomDescription`
   - Wire `onSave` to call `handleUpdateSettings` with the roomName/roomDescription payload
   - Show a success toast on save ("Room details updated")
3. In `client/src/components/Room/RoomNavbar.jsx`:
   - Add `roomName` and `roomDescription` props
   - Under the existing room ID display, conditionally show the room description when set (non-empty string)
   - Style: `text-xs text-muted-foreground truncate max-w-[200px]` — subtle, doesn't disrupt layout
   - If roomName is set, display it as a label above or alongside the room code
4. Wire Room.jsx to pass `roomName` and `roomDescription` to RoomNavbar.
5. Run full slice verification — all 9 checks from S02-PLAN.md Verification section.

## Must-Haves

- [ ] EditRoomDetailsDialog has name Input and description Textarea
- [ ] Dialog fields initialize from current values when opened
- [ ] Save calls onUpdateSettings with roomName and roomDescription
- [ ] Empty values are accepted (fields are optional)
- [ ] Room description shows under room ID in navbar when set
- [ ] Room description is hidden when empty/not set
- [ ] RoomNavbar receives and displays roomName/roomDescription props
- [ ] Success toast on save
- [ ] No changes to landing page components

## Verification

- `rg "EditRoomDetailsDialog" client/src/components/Room/EditRoomDetailsDialog.jsx` → file exists with component
- `rg "EditRoomDetailsDialog" client/src/pages/Room.jsx` → imported and rendered
- `rg "roomDescription" client/src/components/Room/RoomNavbar.jsx` → conditional display logic
- `rg "roomName" client/src/components/Room/RoomNavbar.jsx` → prop received and used
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0
- Full slice verification: all checks from S02-PLAN.md pass

## Observability Impact

- Signals added/changed: Toast notification "Room details updated" on successful save — gives user feedback and serves as observable signal in browser testing
- How a future agent inspects this: Check navbar for description text presence; check Room.jsx state via React DevTools; check Socket.io frames for roomName/roomDescription in settings payload
- Failure state exposed: If save fails silently, no toast appears — absence of toast indicates wiring issue. If roomDescription doesn't display, navbar shows only room code — visible absence

## Inputs

- T01 output: `server/handlers/roomHandlers.js` accepts and broadcasts roomName/roomDescription; `Room.jsx` has roomName/roomDescription state
- T02 output: `RoomNavbar.jsx` has DropdownMenu with "Edit Room Details" item calling `onOpenEditRoom`; `Room.jsx` has `isEditRoomOpen` state
- Existing components: shadcn Dialog, Input, Textarea, Label, Button (all already installed)

## Expected Output

- `client/src/components/Room/EditRoomDetailsDialog.jsx` — new dialog with name/description form
- `client/src/components/Room/RoomNavbar.jsx` — updated with roomName/roomDescription display
- `client/src/pages/Room.jsx` — EditRoomDetailsDialog imported, rendered, wired to handleUpdateSettings with toast feedback
