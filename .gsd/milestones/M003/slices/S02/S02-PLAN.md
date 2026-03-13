# S02: Host Dropdown Menu & Dialogs

**Goal:** Replace the monolithic settings gear button with a host-only dropdown menu containing three options, each opening a focused dialog — Edit Room Details, Settings, and Customize Cards (placeholder). Server stores and broadcasts room name/description. Room description shows under room ID in navbar.
**Demo:** Host clicks gear icon → dropdown appears with 3 items. "Edit Room Details" opens a dialog to set name/description, which broadcasts live. "Settings" opens the extracted toggles + end session. "Customize Cards" opens a placeholder dialog. Room description appears under the room ID in the navbar when set.

## Must-Haves

- Host-only DropdownMenu replaces the settings gear button in RoomNavbar (R203)
- DropdownMenu has three items: Edit Room Details, Customize Cards, Settings (R203)
- EditRoomDetailsDialog with name and description fields, saves and broadcasts via `update_room_settings` (R204)
- Room description displays as subtle text under room ID in navbar when set (R205)
- SettingsDialog with 3 beautified toggles (Celebration Effects, Instant Reveal, Privacy Mode) + End Session danger zone (R209)
- Server stores `roomName` and `roomDescription` in room state, broadcasts via `room_settings_updated`, includes in `create_room` and `join_room` callbacks (R217)
- Non-host users do not see the dropdown trigger at all
- Dialogs render outside the DropdownMenu (state-driven) to avoid Radix focus/portal conflicts
- RoomSettingsModal.jsx preserved (S03 will replace the voting system section)
- No changes to landing page components (D011)

## Proof Level

- This slice proves: integration
- Real runtime required: yes — Socket.io broadcast of room name/description must be verified with running server
- Human/UAT required: no — structural verification via grep + runtime startup confirms behavior

## Verification

- `rg "DropdownMenu" client/src/components/Room/RoomNavbar.jsx` → matches present (dropdown installed and used)
- `rg "SettingsDialog" client/src/components/Room/` → file exists and is imported
- `rg "EditRoomDetailsDialog" client/src/components/Room/` → file exists and is imported
- `rg "roomName|roomDescription" server/handlers/roomHandlers.js` → both fields in room state, update handler, and join/create callbacks
- `rg "roomName|roomDescription" client/src/pages/Room.jsx` → state variables and listener handlers present
- `rg "roomDescription" client/src/components/Room/RoomNavbar.jsx` → description display logic present
- `rg "CustomizeCardsDialog" client/src/components/Room/` → placeholder file exists
- Dev server starts without errors: `cd client && npx vite build --mode development 2>&1 | tail -5` → no errors
- No changes to landing page: `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0

## Observability / Diagnostics

- Runtime signals: Server logs `Room ${roomId} settings updated:` on every `update_room_settings` — now includes roomName/roomDescription in the logged settings object
- Inspection surfaces: Browser DevTools → Network tab → filter `room_settings_updated` Socket.io frames to verify roomName/roomDescription propagation
- Failure visibility: If roomName/roomDescription don't appear in join callback, the navbar will show no description — visually obvious. If dropdown doesn't render, the gear icon is simply missing for hosts.
- Redaction constraints: none — room names/descriptions are not sensitive

## Integration Closure

- Upstream surfaces consumed: `RoomNavbar.jsx` (S01 branding), `Room.jsx` state management, `roomHandlers.js` server handlers, `RoomSettingsModal.jsx` (toggles + danger zone extracted)
- New wiring introduced in this slice: DropdownMenu → state flags → Dialog components; server `roomName`/`roomDescription` in room state → `room_settings_updated` broadcast → client listener → Room.jsx state → RoomNavbar display
- What remains before the milestone is truly usable end-to-end: S03 (Customize Cards real implementation replacing placeholder), S04 (Participant Panel), S05 (Integration & Polish)

## Tasks

- [x] **T01: Add roomName/roomDescription to server state and client listener** `est:30m`
  - Why: Foundation for all room details features — server must store, broadcast, and return these fields before any dialog can use them
  - Files: `server/handlers/roomHandlers.js`, `client/src/pages/Room.jsx`
  - Do: Add `roomName: ''` and `roomDescription: ''` to room object in `createRoomHandler`. Add field checks in `updateRoomSettingsHandler`. Include both fields in `create_room` and `join_room` callback payloads. In Room.jsx, add `roomName`/`roomDescription` state, initialize from `location.state`, update in `onRoomSettingsUpdated` listener, include in `create_room` callback state extraction.
  - Verify: `rg "roomName|roomDescription" server/handlers/roomHandlers.js` shows fields in room creation, update handler, create callback, and join callback. `rg "roomName|roomDescription" client/src/pages/Room.jsx` shows state vars and listener.
  - Done when: Server stores roomName/roomDescription, broadcasts them via `room_settings_updated`, and returns them in create/join callbacks. Client Room.jsx has state for both and updates them from socket events.

- [x] **T02: Install DropdownMenu, build host dropdown, and extract SettingsDialog** `est:1h`
  - Why: Core UI restructure — replaces single gear button with organized dropdown menu, extracts the settings toggles + danger zone into a standalone dialog (R203, R209)
  - Files: `client/src/components/Room/RoomNavbar.jsx`, `client/src/components/Room/SettingsDialog.jsx` (new), `client/src/components/Room/CustomizeCardsDialog.jsx` (new placeholder), `client/src/pages/Room.jsx`
  - Do: Install `dropdown-menu` via shadcn CLI. In RoomNavbar, replace the gear icon Button with a DropdownMenu containing 3 items (Edit Room Details, Customize Cards, Settings). Menu items set state flags via callback props — dialogs render outside the dropdown to avoid Radix focus conflicts (research pitfall). Create `SettingsDialog.jsx` by extracting the toggles grid and danger zone from RoomSettingsModal — same 3 switches (Celebration Effects, Instant Reveal, Privacy Mode) plus the AlertDialog end-session button. Create `CustomizeCardsDialog.jsx` as a minimal placeholder dialog stating cards customization is coming in the next update. In Room.jsx, replace `isSettingsOpen` with three separate dialog states, pass open/onClose handlers to new components and RoomNavbar.
  - Verify: `rg "DropdownMenu" client/src/components/Room/RoomNavbar.jsx` → present. `SettingsDialog.jsx` exists with Switch components. `CustomizeCardsDialog.jsx` exists. Room.jsx has three dialog open states. `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors.
  - Done when: Host sees dropdown with 3 items. Settings dialog opens with 3 toggles + end session. Customize Cards opens placeholder. Non-hosts see no dropdown trigger.

- [x] **T03: Build EditRoomDetailsDialog and add navbar description display** `est:45m`
  - Why: Closes the loop — host can edit room name/description via dialog (R204), and description shows under room ID in navbar (R205). Wires the server foundation from T01 to the UI from T02.
  - Files: `client/src/components/Room/EditRoomDetailsDialog.jsx` (new), `client/src/components/Room/RoomNavbar.jsx`, `client/src/pages/Room.jsx`
  - Do: Create `EditRoomDetailsDialog.jsx` with two fields (name via Input, description via Textarea), save button calls `onUpdateSettings({ roomName, roomDescription })`. Initialize fields from current values on open. In RoomNavbar, add `roomDescription` prop and display it as a truncated muted line under the room ID when set. Also add `roomName` display — if set, show it alongside or replacing the Room: code display. In Room.jsx, pass `roomName`/`roomDescription` state and the `handleUpdateSettings` function to the new dialog and navbar.
  - Verify: `rg "EditRoomDetailsDialog" client/src/components/Room/` → file exists and imported. `rg "roomDescription" client/src/components/Room/RoomNavbar.jsx` → display logic present. `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors. Full slice verification: all 9 checks from Verification section pass.
  - Done when: Host opens Edit Room Details from dropdown, sets name/description, saves, other participants see updated description in navbar. Empty description shows nothing. All slice verification checks pass.

## Files Likely Touched

- `server/handlers/roomHandlers.js`
- `client/src/pages/Room.jsx`
- `client/src/components/Room/RoomNavbar.jsx`
- `client/src/components/Room/SettingsDialog.jsx` (new)
- `client/src/components/Room/CustomizeCardsDialog.jsx` (new)
- `client/src/components/Room/EditRoomDetailsDialog.jsx` (new)
- `client/src/components/ui/dropdown-menu.tsx` (generated by shadcn CLI)
