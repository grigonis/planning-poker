---
id: T02
parent: S03
milestone: M003
provides:
  - RoomSettingsModal.jsx cleaned of voting system section (toggles + danger zone only)
  - Dead code tagged with deprecation comment pointing to SettingsDialog
key_files:
  - client/src/components/Room/RoomSettingsModal.jsx
  - client/src/pages/Room.jsx
key_decisions:
  - RoomSettingsModal kept in codebase with @deprecated JSDoc comment and note to remove in S05 — it's dead code (isOpen=false hardcoded) but removing the import would require more Room.jsx changes; deferred to S05 cleanup pass
patterns_established:
  - none new
observability_surfaces:
  - none
duration: ~15m
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T02: Remove voting system type selector from RoomSettingsModal

**Removed voting system section from RoomSettingsModal; component now contains only the 3 toggles + danger zone; dead code tagged for S05 removal.**

## What Happened

Rewrote `RoomSettingsModal.jsx` removing all voting-system-related code: `PRESETS` constant, `customScaleText` and `isCustomMode` state, `handleVoteSystemChange`, `handleCustomScaleSubmit`, the "Voting System" section JSX, the `<Separator />`, and unused imports (`Input`, `Label`, `LayoutPanelLeft`). Removed `votingSystem` and `phase` props from the component signature.

Updated Room.jsx to remove `votingSystem={votingSystem}` and `phase={phase}` from the dead `<RoomSettingsModal>` usage. Added a JSDoc `@deprecated` comment to the component.

The live settings dialog is `SettingsDialog.jsx` (created in S02/T02) — it never had a voting system section, so no changes needed there.

## Verification

- `rg "Voting System|PRESETS|isCustomMode|handleVoteSystemChange|customScaleText" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches
- `rg "votingSystem" client/src/components/Room/RoomSettingsModal.jsx` → 0 matches
- Build passes clean

## Diagnostics

- Not applicable — this is a removal task with no runtime surface.

## Deviations

- Did not remove `RoomSettingsModal` import from Room.jsx or its `<RoomSettingsModal>` render call — that's a full component removal which is S05 scope. Added deprecation comment instead.

## Known Issues

- `RoomSettingsModal.jsx` is dead code (rendered with `isOpen={false}`) — still in bundle. Tagged for removal in S05.

## Files Created/Modified

- `client/src/components/Room/RoomSettingsModal.jsx` — voting system section removed; @deprecated comment added
- `client/src/pages/Room.jsx` — removed votingSystem/phase props from dead RoomSettingsModal usage
