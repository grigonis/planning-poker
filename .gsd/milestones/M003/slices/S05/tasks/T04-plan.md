# T04: Regression Smoke Tests

**Slice:** S05
**Milestone:** M003

## Goal
Manually verify that emoji reactions, tasks pane, and the landing page remain functional and visually consistent.

## Must-Haves

### Truths
- Emoji reactions can be sent and are visible to all participants.
- Tasks pane can be opened/closed, and tasks can be managed by the host.
- Landing page (`/`) is visually unchanged and the "Create Room" flow still works.
- Participant panel does not overlap the Tasks pane when both are open (they are on opposite sides).
- Participant panel overlaps the poker table as requested, without breaking the elliptical layout.

### Artifacts
- None (verification task).

### Key Links
- `Room` -> `EmojiReactions`.
- `Room` -> `TasksPane`.
- `Landing` page -> `CreateRoom`.

## Steps
1. Navigate to the landing page. Verify "Keystimate" branding is NOT present (D011: landing page untouched).
2. Create a room.
3. Open the Tasks pane (right side). Open the Participant panel (left side).
4. Verify they don't fight for space on a medium viewport (1280px+).
5. Send emoji reactions. Verify they appear.
6. Check Tasks pane CRUD operations as host.

## Context
- Constraint D011: Zero changes to src/components/home/ and src/pages/Landing.jsx.
- The Participant Panel is hidden below 768px.
