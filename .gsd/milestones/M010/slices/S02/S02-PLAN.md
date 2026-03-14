# S02: Code Quality & Refactoring

**Goal:** Refactor `Room.jsx` (QA-12) to improve maintainability and extract reusable logic.

## Tasks

- [x] **T01: Extract Socket Event Handlers into a custom hook (`useRoomSocket`)** `est:45m`
- [x] **T02: Extract Room Modal States and Handlers into `useRoomModals`** `est:30m`
- [x] **T03: Refactor `Room.jsx` to use new hooks and smaller sub-components** `est:30m`

## Verification Plan

- T01-T03: Full regression test of room functionality:
  - Joining room
  - Voting lifecycle (start, vote, reveal, reset)
  - Settings updates
  - Tasks management
  - Identity updates
  - Dashboard history sync
