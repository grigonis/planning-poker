---
id: T01
parent: S03
milestone: M003
provides:
  - CustomizeCardsDialog — full interactive card editor with removable chips, add input, min/max enforcement, live preview
  - Room.jsx wired to pass votingSystem and onSave to CustomizeCardsDialog
  - "Card values updated" toast on save
  - VotingOverlay updates immediately after save via socket broadcast
key_files:
  - client/src/components/Room/CustomizeCardsDialog.jsx
  - client/src/pages/Room.jsx
key_decisions:
  - No new decisions — pattern follows EditRoomDetailsDialog: local state initialized on open, onSave broadcasts via handleUpdateSettings
patterns_established:
  - Card value chips use aria-label="Remove {value}" for accessibility
  - MIN_CARDS=2, MAX_CARDS=12 as named constants at top of file
observability_surfaces:
  - Toast "Card values updated" on save — absence indicates wiring failure
  - VotingOverlay card count/values reflect saved state — mismatch indicates Room.jsx state listener not updating
  - Server logs "Room ${roomId} settings updated:" with votingSystem.values on every save
duration: ~30m
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Build interactive CustomizeCardsDialog with add/remove/preview

**Replaced the placeholder CustomizeCardsDialog with a full interactive card value editor; VotingOverlay updates live after save.**

## What Happened

Rewrote `CustomizeCardsDialog.jsx` from scratch. Accepts `isOpen`, `onClose`, `votingSystem`, `onSave` props. Local state `localValues` initializes from `votingSystem.values` on open. Values render as removable chips; the X button is disabled when `localValues.length <= 2`. Add input + button (Enter triggers add) — duplicate values silently skipped, add disabled at 12. Count indicator shows `X / 12` with color feedback. Live preview section mirrors current localValues as small card-style chips. Cancel resets state and closes; Save calls `onSave({ votingSystem: { ...votingSystem, values: localValues } })`.

In Room.jsx: added `votingSystem` and `onSave` (with `toast.success("Card values updated")`) props to `<CustomizeCardsDialog>`.

Browser-verified the full flow: added "34", removed "0", saved → toast appeared → VotingOverlay showed 10 cards (0.5, 1, 2, 3, 5, 8, 13, 21, ☕, 34).

## Verification

- `rg "localValues|newValueInput" client/src/components/Room/CustomizeCardsDialog.jsx` → present
- `rg "votingSystem" client/src/components/Room/CustomizeCardsDialog.jsx` → prop used
- `cd client && npx vite build --mode development 2>&1 | tail -3` → ✓ built in 5.37s
- Browser: add "34" → remove "0" → Save Changes → toast "Card values updated" → VotingOverlay shows updated deck without 0, with 34

## Diagnostics

- Toast absent after save → check `onSave` in Room.jsx; confirm `handleUpdateSettings` emits `update_room_settings`
- VotingOverlay not updated → check `setVotingSystem` call in Room.jsx `room_settings_updated` listener
- Server log confirms broadcast: `Room ${roomId} settings updated:` with `votingSystem.values`

## Deviations

None — implemented exactly as planned.

## Known Issues

None.

## Files Created/Modified

- `client/src/components/Room/CustomizeCardsDialog.jsx` — full rewrite from placeholder to interactive editor
- `client/src/pages/Room.jsx` — added `votingSystem` and `onSave` props to `<CustomizeCardsDialog>`
