---
estimated_steps: 5
estimated_files: 2
---

# T01: Add roomName/roomDescription to server state and client listener

**Slice:** S02 — Host Dropdown Menu & Dialogs
**Milestone:** M003

## Description

Add `roomName` and `roomDescription` fields to the server-side room state. Extend the `updateRoomSettingsHandler` to accept and persist these fields. Include them in the `create_room` and `join_room` callback payloads so new/reconnecting clients receive them. On the client, add state variables in Room.jsx and wire the `onRoomSettingsUpdated` listener to update them.

This is pure plumbing — no UI changes. It unblocks T02 and T03 which build the dialogs and display.

## Steps

1. In `server/handlers/roomHandlers.js`, add `roomName: ''` and `roomDescription: ''` to the room object in `createRoomHandler` (around line 22).
2. In `updateRoomSettingsHandler`, add checks for `settings.roomName` and `settings.roomDescription` — same pattern as the existing `funFeatures`/`autoReveal` checks. Use `!== undefined` guard so empty strings are valid.
3. In the `createRoomHandler` callback payload, add `roomName: room.roomName` and `roomDescription: room.roomDescription`.
4. In the `joinRoomHandler` callback payload, add `roomName: room.roomName` and `roomDescription: room.roomDescription`.
5. In `client/src/pages/Room.jsx`:
   - Add `roomName` and `roomDescription` state, initialized from `location.state?.roomName || ''` and `location.state?.roomDescription || ''`.
   - In the `onRoomSettingsUpdated` handler, add: `if (settings.roomName !== undefined) setRoomName(settings.roomName)` and same for `roomDescription`.
   - In the `create_room` callback response handling (where other state is extracted), extract `roomName` and `roomDescription`.

## Must-Haves

- [ ] Room object has `roomName: ''` and `roomDescription: ''` fields
- [ ] `updateRoomSettingsHandler` persists roomName and roomDescription when present in settings
- [ ] `create_room` callback includes roomName and roomDescription
- [ ] `join_room` callback includes roomName and roomDescription
- [ ] Room.jsx has `roomName`/`roomDescription` state updated by socket listener
- [ ] Empty strings are valid values (not treated as falsy/missing)

## Verification

- `rg "roomName" server/handlers/roomHandlers.js` → appears in room creation object, update handler, create callback, join callback (at least 4 distinct locations)
- `rg "roomDescription" server/handlers/roomHandlers.js` → same 4 locations
- `rg "roomName|roomDescription" client/src/pages/Room.jsx` → state declarations and listener updates
- `cd server && node -e "require('./handlers/roomHandlers.js')" 2>&1` → no syntax errors
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors

## Observability Impact

- Signals added/changed: Server `console.log` in `updateRoomSettingsHandler` already logs the full `settings` object — roomName/roomDescription will appear automatically in that log
- How a future agent inspects this: `rg "roomName" server/handlers/roomHandlers.js` confirms the field exists in all required locations; runtime inspection via Socket.io devtools frame inspection
- Failure state exposed: If fields are missing from join callback, navbar will show no description (silent but visible absence); if update handler doesn't persist, the broadcast will contain the new values but they won't survive reconnection

## Inputs

- `server/handlers/roomHandlers.js` — current room handler with `updateRoomSettingsHandler` handling funFeatures, autoReveal, anonymousMode, votingSystem
- `client/src/pages/Room.jsx` — current Room component with `onRoomSettingsUpdated` listener handling 4 settings fields
- S01 summary: localStorage keys already renamed to keystimate_ prefix; no blocking changes to server or Room.jsx state management

## Expected Output

- `server/handlers/roomHandlers.js` — room object includes roomName/roomDescription defaults, update handler persists them, create/join callbacks return them
- `client/src/pages/Room.jsx` — roomName/roomDescription state variables, initialized from location.state, updated by onRoomSettingsUpdated listener
