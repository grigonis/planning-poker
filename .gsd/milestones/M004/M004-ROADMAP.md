# M004: Player Groups

**Vision:** Teams can organise participants into named groups within a room and see voting results broken down per group, enabling multi-team estimation in a single session.

## Success Criteria

- A host can create, rename, and delete groups from a "Manage Groups" dialog in Settings.
- Every participant can be assigned to a group by the host (via dialog) or by any user (via Participant Panel action).
- New users joining a room that has groups enabled see a group picker on the join screen.
- Player names show a group tag wherever names appear — only when groups are enabled AND the player has been assigned to a group.
- After reveal, results split into per-group blocks with a combined final result. The task's stored vote is the combined average.
- Groups are included in the join_room response and survive reconnect.

## Key Risks / Unknowns

- **State threading** — groups must flow through join_room, user_joined, room_settings_updated without breaking existing consumers.
- **Assign from Participant Panel** — inserting a context action on a user row in the collapsible panel without a dedicated modal. Needs careful UX composition.

## Proof Strategy

- State threading → retire in S01 by verifying join_room callback and user_joined emission carry groups correctly.
- Assign from panel → retire in S02 by building and manually testing the assign dropdown in ParticipantPanel.

## Verification Classes

- Contract verification: server emits correct group data on reveal (per-group averages correct).
- Integration verification: full create-group → assign → vote → reveal → task-record flow exercised in browser.
- Operational verification: groups survive reconnect (session restore re-emits groups via join_room).
- UAT / human verification: group tag appears only when assigned; join picker appears only when groups enabled.

## Milestone Definition of Done

This milestone is complete only when all are true:

- S01–S04 all delivered and manually verified in browser.
- Host can create/delete groups and assign users.
- Join screen shows group picker when groups are enabled.
- Results board shows per-group split after reveal.
- Task result stored = combined average.
- No regressions on existing features (standard voting, auto-reveal, anonymous mode, tasks).

## Slices

- [x] **S01: Server — Groups data model & socket API** `risk:high` `depends:[]`
  > After this: Server stores groups on room, emits them on join/update/reveal; per-group averages computed on reveal.

- [x] **S02: Manage Groups dialog + host assignment** `risk:medium` `depends:[S01]`
  > After this: Host can open Settings → Manage Groups, enable groups, create/delete groups, and assign any participant to a group from the dialog.

- [x] **S03: Participant panel assign action + group tags** `risk:medium` `depends:[S02]`
  > After this: Any user can click a participant in the panel → Assign Group → pick group; group tags appear on player names in the panel and on the poker table.

- [x] **S04: Join group picker + results group split** `risk:low` `depends:[S02]`
  > After this: New users see a group picker on join (when groups enabled); revealed results split per-group with combined total; full end-to-end scenario passes.

## Boundary Map

### S01 → S02

Produces:
- Socket events: `manage_groups` (create/delete group), `assign_group` (assign user to group)
- `room_settings_updated` payload includes `groups` array and `groupsEnabled` boolean
- `user_joined` payload — each user object has `groupId: string | null`
- `join_room` callback includes `groups` array and `groupsEnabled`
- `revealed` payload includes `groupAverages: { [groupId]: { name, average, count } }`

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- `ManageGroupsDialog` component (open/close, create group, delete group, assign user)
- `groups` state in Room.jsx, `groupsEnabled` state
- `onManageGroups` handler wired in RoomNavbar

Consumes:
- S01 socket events (manage_groups, assign_group)

### S02 → S04

Produces:
- `groups` + `groupsEnabled` in Room state (available for GuestJoinModal and ResultsBoard)

Consumes:
- S01 socket events

### S03 → S04

Produces:
- Group tags on PlayerAvatar / UserRow in ParticipantPanel
- Assign group action in ParticipantPanel user row

Consumes:
- S02 ManageGroupsDialog, groups state

### S04 (final integration)

Produces:
- GuestJoinModal group picker (conditional on groupsEnabled)
- ResultsBoard per-group split blocks
- PokerTable center per-group result lines on reveal

Consumes:
- S01 per-group averages on reveal
- S02 groups state
