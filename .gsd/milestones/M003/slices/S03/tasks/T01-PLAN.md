---
estimated_steps: 7
estimated_files: 2
---

# T01: Build interactive CustomizeCardsDialog with add/remove/preview

**Slice:** S03 — Customize Cards Dialog
**Milestone:** M003

## Description

Replace the placeholder CustomizeCardsDialog with a real interactive card value editor. Host sees current card values as removable chips, can add new values via input, and gets a live preview. Min 2 / max 12 enforced. Save broadcasts via `update_room_settings`. Wire Room.jsx to pass votingSystem and handle save with toast.

## Steps

1. Rewrite `client/src/components/Room/CustomizeCardsDialog.jsx`:
   - Props: `isOpen`, `onClose`, `votingSystem`, `onSave`
   - Local state: `localValues` (array, initialized from `votingSystem?.values || []` on open via useEffect keyed on isOpen), `newValueInput` (string, empty)
   - Header: Layers icon + "Customize Cards" title + subtitle showing current system name (`votingSystem?.name`)
   - Values section: flex-wrap of chips. Each chip: value text + X button (disabled when `localValues.length <= 2`). Click X removes that value from localValues.
   - Add value: Input (controlled by `newValueInput`) + "Add" button. On submit: trim, skip if empty or already in localValues (case-insensitive for string values, strict equality for numbers), append to localValues, clear input. Button + input disabled when `localValues.length >= 12`. Enter key on input triggers add.
   - Count indicator: `{localValues.length} / 12` — red text when ≤ 2, amber when at 12, normal otherwise.
   - Live preview: a section below showing `localValues` rendered as small bordered card chips (flex-wrap, font-bold, similar to poker card style).
   - Footer: "Cancel" button (reset localValues to votingSystem.values, clear input, close) and "Save Changes" button (calls `onSave({ votingSystem: { ...votingSystem, values: localValues } })` then closes). Save disabled when localValues.length < 2.

2. In `client/src/pages/Room.jsx`:
   - Add `votingSystem` prop to `<CustomizeCardsDialog>`
   - Add `onSave` prop: `(settings) => { handleUpdateSettings(settings); toast.success("Card values updated"); }`

3. Run build check: `cd client && npx vite build --mode development 2>&1 | tail -3`

4. Browser verify: open Customize Cards from dropdown → add a value → remove a value → Save → VotingOverlay shows updated deck

## Must-Haves

- [ ] CustomizeCardsDialog accepts votingSystem prop and initializes from it on open
- [ ] Values displayed as removable chips
- [ ] Remove disabled when localValues.length <= 2
- [ ] Add input + button, Enter submits
- [ ] Add disabled (input + button) when localValues.length >= 12
- [ ] Duplicate prevention on add
- [ ] Count indicator shows X / 12
- [ ] Live preview of current localValues as card chips
- [ ] Cancel resets local state and closes
- [ ] Save calls onSave with full votingSystem object (type, name, values updated)
- [ ] Success toast "Card values updated" on save
- [ ] VotingOverlay updates after save (socket broadcast → Room.jsx state update → VotingOverlay re-renders)

## Verification

- `rg "localValues\|newValueInput" client/src/components/Room/CustomizeCardsDialog.jsx` → state present
- `rg "votingSystem" client/src/components/Room/CustomizeCardsDialog.jsx` → prop used
- `rg "votingSystem" client/src/pages/Room.jsx | grep CustomizeCardsDialog` → prop passed
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- Browser: full add/remove/save flow confirmed

## Observability Impact

- Signals added/changed: Toast "Card values updated" on save — absence indicates wiring failure. Server log `Room ${roomId} settings updated:` includes new `votingSystem.values` array.
- How a future agent inspects this: Check VotingOverlay card count after save; check Socket.io `room_settings_updated` frame in browser DevTools Network tab.
- Failure state exposed: If VotingOverlay doesn't update, `votingSystem` state in Room.jsx is stale — check `room_settings_updated` listener in Room.jsx.

## Inputs

- S02 output: `CustomizeCardsDialog.jsx` placeholder, `Room.jsx` has `isCustomizeCardsOpen` state and `handleUpdateSettings`
- S02 output: `RoomNavbar.jsx` has "Customize Cards" menu item wired to `onOpenCustomizeCards`

## Expected Output

- `client/src/components/Room/CustomizeCardsDialog.jsx` — full interactive card editor
- `client/src/pages/Room.jsx` — votingSystem and onSave props wired to CustomizeCardsDialog
