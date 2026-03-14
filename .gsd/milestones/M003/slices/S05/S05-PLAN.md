# S05: Integration & Polish

**Goal:** Finalize the Room UX Restructure by integrating all components, adding layout animations, and verifying the end-to-end flow.
**Demo:** Host edits room details and cards; participants see changes silently; everyone votes and reveals; participant list reorders with smooth animations; emoji reactions and tasks pane work perfectly.

## Must-Haves
- [x] End-to-end voting lifecycle works with all new UI components
- [x] Participant panel rows animate when reordering during reveal
- [x] Room settings updates (name, description, cards) broadcast silently (no intrusive toasts)
- [x] Visual regression check: landing page, emoji reactions, and tasks pane are healthy
- [x] Participant panel overlaps table on small viewports (no table squeezing)

## Tasks

- [x] **T01: Animation Setup & Dependencies**
  Install `framer-motion` and prepare `ParticipantPanel.jsx` for layout animations.

- [x] **T02: Implement Animated Reordering**
  Update `ParticipantPanel` to use `framer-motion` for smooth row reordering during the REVEALED phase.

- [x] **T03: End-to-End Integration Verification**
  Perform a full walk-through of the room flow, testing host edits, card customization, and real-time broadcasts.

- [x] **T04: Regression Smoke Tests**
  Manually verify that emoji reactions, tasks pane, and the landing page remain functional and visually consistent.

- [x] **T05: Slice & Milestone Wrap-up**
  Write S05 summary, UAT script, and final M003 milestone rollup.

## Files Likely Touched
- `client/src/components/Room/ParticipantPanel.jsx`
- `client/src/pages/Room.jsx`
- `client/src/components/Room/RoomNavbar.jsx`
- `client/src/components/Room/TasksPane.jsx`
- `client/src/components/Room/EmojiReactions.jsx`
- `package.json`
