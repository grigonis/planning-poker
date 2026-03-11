# S04: Tasks Pane

**Goal:** Implement right-side pane for single/bulk task management.
**Demo:** Pane opens/closes; tasks can be added manually or in bulk; voting works with/without tasks.

## Must-Haves
- Expandable/collapsible right-side pane
- Single task addition
- Bulk task addition
- Voting compatibility with tasks

## Tasks
- [ ] Implement right-side pane UI component
- [ ] Add open/collapse functionality with state persistence
- [ ] Implement single task addition form
- [ ] Implement bulk task addition logic
- [ ] Sync tasks via Socket.io to all players
- [ ] Ensure voting flow works when no tasks are present
- [ ] Link voting results to the active task (optional but recommended)

## Files Likely Touched
- client/src/pages/Room.jsx
- client/src/components/Room/TasksPane.jsx
- server/handlers/taskHandlers.js
