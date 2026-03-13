# S03: Customize Cards Dialog

**Goal:** Replace the CustomizeCardsDialog placeholder with a real interactive card value editor. Host can add/remove individual values from the current voting scale with live preview. Min 2 / max 12 enforced. Changes broadcast to all participants via `update_room_settings`. Voting system type switching removed from RoomSettingsModal (locked after room creation per D028).
**Demo:** Host opens Customize Cards from dropdown → sees current card values as removable chips. Can click a chip to remove it (disabled if only 2 remain). Can type a new value in an input and press Enter/Add to add it (disabled if at 12). Live preview shows the card deck. Save broadcasts new values to all clients — VotingOverlay updates immediately for all participants.

## Must-Haves

- CustomizeCardsDialog shows current card values as interactive chips (remove on click)
- Add new value via input + Add button (Enter submits)
- Min 2 cards enforced (remove disabled when 2 remain)
- Max 12 cards enforced (add disabled when at 12)
- Live preview of card deck (the values rendered as mini card chips)
- Save calls onUpdateSettings with `{ votingSystem: { ...current, values: localValues } }`
- Cancel discards local changes (state resets to current values on open)
- Changes broadcast via `update_room_settings` → `room_settings_updated` → all clients update VotingOverlay
- Voting system type selector section removed from RoomSettingsModal (R208 / D028)
- No changes to CreateRoom voting system selector (type is chosen at creation only)
- Success toast on save ("Card values updated")

## Proof Level

- This slice proves: integration
- Real runtime required: yes — card customization must broadcast via Socket.io and update VotingOverlay for all clients
- Human/UAT required: no — structural + runtime verification confirms behavior

## Verification

- `rg "localValues\|addValue\|removeValue" client/src/components/Room/CustomizeCardsDialog.jsx` → add/remove logic present
- `rg "votingSystem" client/src/components/Room/CustomizeCardsDialog.jsx` → receives votingSystem prop and emits update
- `rg "Voting System" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches (section removed)
- `rg "votingSystem" client/src/pages/Room.jsx | grep CustomizeCardsDialog` → votingSystem prop passed to dialog
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0
- Browser: open Customize Cards → add a value → remove a value → Save → VotingOverlay shows updated deck

## Observability / Diagnostics

- Runtime signals: Server logs `Room ${roomId} settings updated:` with updated `votingSystem.values` array on every save — confirms broadcast
- Inspection surfaces: Browser DevTools → Network → Socket.io `room_settings_updated` frame shows new values array
- Failure visibility: If VotingOverlay doesn't update after save, check that `votingSystem` state in Room.jsx updates on `room_settings_updated` — `rg "setVotingSystem" client/src/pages/Room.jsx` confirms listener
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `Room.jsx` `votingSystem` state and `handleUpdateSettings`; `RoomNavbar.jsx` dropdown "Customize Cards" item → `isCustomizeCardsOpen` state flag
- New wiring introduced: CustomizeCardsDialog receives `votingSystem` prop from Room.jsx; onSave calls handleUpdateSettings with updated values
- What remains: S04 (Participant Panel), S05 (Integration & Polish)

## Tasks

- [x] **T01: Build interactive CustomizeCardsDialog with add/remove/preview** `est:1h`
  - Why: Replaces the placeholder with the real feature — the entire slice goal lives in this dialog
  - Files: `client/src/components/Room/CustomizeCardsDialog.jsx`, `client/src/pages/Room.jsx`
  - Do:
    1. Rewrite `CustomizeCardsDialog.jsx` — accept props: `isOpen`, `onClose`, `votingSystem`, `onSave`. Local state `localValues` initialized from `votingSystem.values` on open (useEffect keyed on isOpen).
    2. Render current values as removable chips: each chip shows the value + an X button. X disabled when `localValues.length <= 2`. Clicking X removes that value.
    3. Add new value: Input + "Add" button (also triggered by Enter). Trim whitespace. Skip if empty or duplicate. Disabled when `localValues.length >= 12`. 
    4. Show count indicator: "X / 12 values" with color hint when at min (red) or max (orange).
    5. Live preview section: render `localValues` as mini card-style chips in a flex-wrap layout — same visual style as VotingOverlay cards (small, bordered, font-bold).
    6. Footer: Cancel (resets local state, closes) + Save Changes (calls `onSave({ votingSystem: { ...votingSystem, values: localValues } })` then closes).
    7. In `Room.jsx`: add `votingSystem` and `onSave` props to `<CustomizeCardsDialog>`. Wire `onSave` to call `handleUpdateSettings` + `toast.success("Card values updated")`.
  - Verify: `rg "localValues\|removeValue\|addValue" client/src/components/Room/CustomizeCardsDialog.jsx` → present. Build passes. Browser: open dialog, add/remove values, save — VotingOverlay updates.
  - Done when: Dialog shows current values as chips, add/remove works with limits enforced, save broadcasts via socket and VotingOverlay updates for all participants.

- [x] **T02: Remove voting system type selector from RoomSettingsModal** `est:30m`
  - Why: Per D028 and R208, voting system type is locked after room creation. The type-switching grid in RoomSettingsModal is dead UI that contradicts this constraint. Remove it cleanly.
  - Files: `client/src/components/Room/RoomSettingsModal.jsx`, `client/src/pages/Room.jsx`
  - Do:
    1. Remove the entire "Voting System" section from `RoomSettingsModal` (the PRESETS grid, custom scale input, `handleVoteSystemChange`, `handleCustomScaleSubmit`, `isCustomMode` state, and the `<Separator />` following it).
    2. Remove unused `votingSystem` and `phase` props from `RoomSettingsModal` (only needed for the removed section). Remove corresponding `Input`, `Label`, `LayoutPanelLeft`, `AlertTriangle` imports if they become unused.
    3. In `Room.jsx`: remove `votingSystem` and `phase` props from the `<RoomSettingsModal>` usage (they're no longer needed there).
    4. Verify RoomSettingsModal still renders correctly with just the 3 toggles + danger zone.
  - Verify: `rg "Voting System\|PRESETS\|isCustomMode\|handleVoteSystemChange" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches. Build passes. Open Settings dialog → shows 3 toggles + End Session only.
  - Done when: Settings dialog has no voting system section. RoomSettingsModal compiles cleanly. Build passes.

## Files Likely Touched

- `client/src/components/Room/CustomizeCardsDialog.jsx`
- `client/src/components/Room/RoomSettingsModal.jsx`
- `client/src/pages/Room.jsx`
