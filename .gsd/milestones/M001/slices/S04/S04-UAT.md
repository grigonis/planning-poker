# S04: Tasks Pane — UAT

**Milestone:** M001
**Written:** 2026-03-11

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The changes are primarily UI components and socket handlers that have been verified through code review and established patterns in previous slices.

## Preconditions

- Server is running (`npm start` in `server/`)
- Client is running (`npm run dev` in `client/`)
- A room has been created via `/create`

## Smoke Test

Open the room, click the "Tasks" button in the navbar. The pane should slide in from the right. Add a task "Test Task". It should appear in the list.

## Test Cases

### 1. Task Management Persistence

1. Open the Tasks pane.
2. Refresh the browser page.
3. **Expected:** The Tasks pane should still be open after the page reloads.

### 2. Bulk Task Addition

1. Click "Bulk Add Tasks" in the Tasks pane.
2. Enter three tasks separated by newlines:
   - Task A
   - Task B
   - Task C
3. Click "Import Tasks".
4. **Expected:** All three tasks should appear in the list as `PENDING`.

### 3. Voting with Task

1. As a host, click the "Play" icon (ChevronRight) next to "Task A".
2. **Expected:** "Task A" should now show "Currently Voting" and appear in the center of the poker table.
3. Cast votes and reveal.
4. **Expected:** "Task A" should be marked as `COMPLETED` and show the average score in the Tasks pane.

### 4. Host-Only Controls

1. Join the same room as a second user (non-host).
2. Open the Tasks pane.
3. **Expected:** The forms for adding tasks and the buttons for deleting/selecting tasks should NOT be visible.

## Edge Cases

### Deleting Active Task

1. Select a task for voting.
2. Delete the task while it's in the `VOTING` state.
3. **Expected:** the task is removed from the list, and the poker table reverts to "Planning Poker" or "Waiting for round...".

## Failure Signals

- Task pane doesn't open.
- Tasks added by one user don't appear for others.
- Voting results don't save to the task.
- Non-hosts can see "Delete" buttons.

## Requirements Proved By This UAT

- TASK-01 — Task pane exists and is stateful.
- TASK-02 — Voting works without tasks.
- TASK-03 — Single task addition works.
- TASK-04 — Bulk task addition works.

## Not Proven By This UAT

- Long-term persistence (beyond session memory).

## Notes for Tester

- The "Tasks" count badge in the navbar should update in real-time as tasks are added or removed.
