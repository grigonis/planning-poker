# S05: Integration & Polish

**Goal:** Remove the dead `RoomSettingsModal` import/render from Room.jsx, run full milestone end-to-end verification, confirm no regressions across the complete voting lifecycle with all new UI elements.
**Demo:** Full room flow works: create room → edit details → customize cards → toggle settings → start round → vote → reveal → see participant panel reorder. No regressions in tasks pane, emoji reactions, or landing page. Clean bundle with no dead imports.

## Must-Haves

- `RoomSettingsModal` import and dead render removed from Room.jsx
- Build passes clean with no unused import warnings
- Full voting lifecycle verified end-to-end in browser
- All milestone DoD criteria confirmed:
  1. BananaPoker branding gone from room-facing UI (only ThemeContext migration shim remains — intentional)
  2. Host dropdown with 3 functional dialogs
  3. Voting system locked; only card values editable in room
  4. Participant panel on md+, collapsed default, reveal reordering
  5. Room name/description editable + broadcast live
  6. Full voting lifecycle works end-to-end
  7. Landing page untouched
  8. No regressions in tasks pane, emoji reactions

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes — end-to-end verification with running server
- Human/UAT required: no

## Verification

- `rg "RoomSettingsModal" client/src/pages/Room.jsx` → 0 matches
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0
- Browser: complete milestone demo flow passes

## Observability / Diagnostics

- None new — all signals established in prior slices

## Integration Closure

- Upstream surfaces consumed: all prior slice outputs
- New wiring introduced: none (cleanup only)
- What remains: nothing — milestone complete after this slice

## Tasks

- [ ] **T01: Remove dead RoomSettingsModal and run full e2e verification** `est:30m`
  - Why: Completes milestone cleanup and verifies the full feature set works together
  - Files: `client/src/pages/Room.jsx`
  - Do:
    1. Remove `import RoomSettingsModal` from Room.jsx
    2. Remove the dead `<RoomSettingsModal isOpen={false} .../>` block and its comment
    3. Run build, confirm clean
    4. Run full browser e2e: create room → gear dropdown (3 items) → Edit Room Details (set name/desc, save, navbar updates) → Customize Cards (add/remove value, save, VotingOverlay updates) → Settings (3 toggles visible, no voting system section) → start round → vote → reveal (participant panel reorders)
    5. Verify landing page still loads normally
  - Verify: `rg "RoomSettingsModal" client/src/pages/Room.jsx` → 0 matches. Build passes. Browser flow complete.
  - Done when: Dead code removed, build clean, full flow verified in browser.

## Files Likely Touched

- `client/src/pages/Room.jsx`
