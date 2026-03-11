---
id: S04
parent: M001
milestone: M001
provides:
  - Task management system with right-side pane
requires:
  - slice: S03
    provides: Voting scales implementation
affects:
  - M002
key_files:
  - client/src/pages/Room.jsx
  - client/src/components/Room/TasksPane.jsx
  - server/handlers/taskHandlers.js
  - server/handlers/voteHandlers.js
key_decisions:
  - Task pane state persistence in localStorage
  - Linking voting results to active tasks with auto-completion
  - Host-only task management controls
patterns_established:
  - Expandable/collapsible side pane with persistence
  - Task-aware voting flow
observability_surfaces:
  - tasks_updated socket event
  - room.tasks property in join_room/create_room response
drill_down_paths:
  - none
duration: 45m
verification_result: passed
completed_at: 2026-03-11
---

# S04: Tasks Pane

**Implement right-side pane for single/bulk task management and linked voting.**

## What Happened

The right-side tasks pane was implemented as a core feature for session management. It supports single task addition, bulk task addition via a multi-line text input, and selection of tasks for active voting. The pane's visibility is persisted in `localStorage` per room, ensuring a consistent user experience upon page refreshes.

On the backend, task handlers were added to manage the task list and active task ID. The voting flow was enhanced to automatically update the active task's status to `COMPLETED` and record the voting average when a round is revealed. For session integrity, task management controls (add, delete, select) are restricted to the room host.

## Verification

- Verified that the task pane expands and collapses correctly.
- Verified that refreshing the page preserves the task pane's open/closed state.
- Verified that adding a task (single or bulk) syncs across all connected clients.
- Verified that selecting a task updates its status to `VOTING` and highlights it for all users.
- Verified that revealing a vote when a task is active marks the task as `COMPLETED` and records the average.
- Verified that host-only controls are correctly hidden from non-host users.

## Requirements Advanced

- TASK-01 — Implemented the right-side expandable/collapsible pane.
- TASK-03 — Added single task addition form.
- TASK-04 — Added bulk task addition logic.

## Requirements Validated

- TASK-01 — Right-side pane is functional and stateful.
- TASK-02 — Voting flow remains fully functional even without any tasks selected.
- TASK-03 — Facilitators can add single tasks.
- TASK-04 — Facilitators can add bulk tasks.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- none

## Known Limitations

- Tasks are currently stored in-memory on the server and lost if the server restarts (Standard behavior for this MVP).

## Follow-ups

- none

## Files Created/Modified

- `client/src/pages/Room.jsx` — Integrated TasksPane and handled persistence.
- `client/src/components/Room/TasksPane.jsx` — Implemented the task list UI and forms.
- `server/handlers/taskHandlers.js` — Added backend logic for task management.
- `server/handlers/voteHandlers.js` — Linked voting results to active tasks.
- `client/src/components/Room/PokerTable.jsx` — Updated center table UI to display the active task.

## Forward Intelligence

### What the next slice should know
- The task system is tightly coupled with the `activeTaskId` in the room state. Any future features involving multiple active tasks or task sequences should respect this link.

### What's fragile
- The `isMeHost` check in `Room.jsx` relies on the `users` list and `currentUser.id`. Ensure these are populated before rendering `TasksPane`.

### Authoritative diagnostics
- Monitor `tasks_updated` socket events for real-time task sync issues.
- Check `room.tasks` in the server `store.js` for the source of truth.

### What assumptions changed
- Originally, `activeTaskId` was going to be cleared immediately on reveal. It was decided to keep it until the round is reset to allow users to see what task was just voted on in the `REVEALED` UI.
