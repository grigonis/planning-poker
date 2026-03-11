# Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D001 | Modified Fibonacci Default | Requested User Stories | 2026-03-10 |
| D002 | Tasks system as side-pane | Better session tracking without cluttering main UI | 2026-03-10 |
| D003 | Retain Spectator role | Existing logic fits requirements perfectly | 2026-03-10 |
| D004 | Arithmetic Mean Average | Requirement VOTE-02 implies a numeric average, excluding non-numeric cards. | 2026-03-11 |
| D005 | Voting Scale Locking | Prevents session inconsistency and anchoring when scales change mid-vote. | 2026-03-11 |
| D006 | Task Pane Persistence | Persisting `isTasksOpen` in `localStorage` per room improves UX on refresh. | 2026-03-11 |
| D007 | Active Task Auto-Clear | Clearing `activeTaskId` on round reset (if completed) streamlines the transition to the next task. | 2026-03-11 |
| D008 | Host-Only Task Management | Restricted task CRUD operations to hosts for session integrity. | 2026-03-11 |
