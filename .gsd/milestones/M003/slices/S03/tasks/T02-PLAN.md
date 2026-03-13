---
estimated_steps: 4
estimated_files: 2
---

# T02: Remove voting system type selector from RoomSettingsModal

**Slice:** S03 — Customize Cards Dialog
**Milestone:** M003

## Description

The voting system type selector in RoomSettingsModal contradicts D028 (voting system locked after creation). Remove the entire "Voting System" section cleanly — PRESETS grid, custom scale input, separator, associated state and handlers. Clean up unused props in RoomSettingsModal and their passing in Room.jsx.

## Steps

1. In `client/src/components/Room/RoomSettingsModal.jsx`:
   - Remove `customScaleText` state, `isCustomMode` state
   - Remove `handleVoteSystemChange` function
   - Remove `handleCustomScaleSubmit` function
   - Remove the entire "Voting System" section from JSX (the div with `<LayoutPanelLeft>` heading, PRESETS grid, custom scale conditional block)
   - Remove the `<Separator />` that follows it
   - Remove `votingSystem` and `phase` from the component props destructuring
   - Remove `PRESETS` constant
   - Remove unused imports: `Input`, `Label`, `LayoutPanelLeft`, `AlertTriangle` (check each — `AlertTriangle` is used in Danger Zone so keep it; `Input` and `Label` are only in voting system section)
   - Keep: all three Switch settings rows (funFeatures, autoReveal, anonymousMode) and the full Danger Zone section

2. In `client/src/pages/Room.jsx`:
   - Remove `votingSystem={votingSystem}` and `phase={phase}` props from `<RoomSettingsModal>` (or `<SettingsDialog>` — check which is rendered)

3. Run `cd client && npx vite build --mode development 2>&1 | tail -3` → must be clean

4. Browser verify: open Settings from dropdown → 3 toggle rows + End Session, no voting system section

## Must-Haves

- [ ] No "Voting System" heading or preset grid in RoomSettingsModal
- [ ] No custom scale input in RoomSettingsModal
- [ ] RoomSettingsModal compiles without unused variable warnings
- [ ] Settings dialog still shows 3 toggles + danger zone
- [ ] Build passes clean

## Verification

- `rg "Voting System\|PRESETS\|isCustomMode\|handleVoteSystemChange\|customScaleText" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches
- `rg "votingSystem" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches (prop removed)
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- Browser: Settings dialog shows only toggles + end session

## Observability Impact

- Signals added/changed: None — this is a removal task
- How a future agent inspects this: Open Settings dialog and confirm voting system section is absent
- Failure state exposed: If SettingsDialog still has voting system UI, the removal was incomplete

## Inputs

- S02 output: `SettingsDialog.jsx` — the extracted settings dialog (note: T02 in S02 created `SettingsDialog.jsx`, check if `RoomSettingsModal` is still used or if `SettingsDialog` is the one rendered)
- `Room.jsx` passes settings props to the open settings dialog component

## Expected Output

- `client/src/components/Room/RoomSettingsModal.jsx` — voting system section removed, only toggles + danger zone remain
- `client/src/pages/Room.jsx` — votingSystem/phase props removed from SettingsDialog/RoomSettingsModal usage
