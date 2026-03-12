# M003: Room UX Restructure

**Vision:** Restructure the room UI with Keystimate branding, a host dropdown menu splitting settings into three focused dialogs (room details, card customization, settings), an interactive card customizer, and a collapsible left-side participant panel with real-time voting status and reveal-time reordering.

## Success Criteria

- "BananaPoker" text no longer appears in any room-facing UI
- All localStorage keys use `keystimate_` prefix
- Host sees a dropdown menu in the navbar with three options that each open a dedicated dialog
- Room name and description are editable by host and broadcast live to all participants
- Card values are customizable (add/remove individual values) with min 2 / max 12 enforced
- Voting system type cannot be switched after room creation
- Participant panel shows all users with live voting status, reorders on reveal, hidden below 768px
- Participant panel never overlaps the poker table
- Landing page is completely untouched

## Key Risks / Unknowns

- **Panel layout vs poker table** — the absolute-positioned elliptical table geometry may conflict with a left-side floating panel. Need to ensure the panel stays in its lane.
- **Responsive panel behavior** — panel must hide on small screens and never overlap table even when expanded on medium screens.

## Proof Strategy

- Panel layout conflict → retire in S04 by building the panel with proper responsive constraints and verifying visually at multiple breakpoints
- Responsive behavior → retire in S05 by testing full flow at md and lg breakpoints

## Verification Classes

- Contract verification: component rendering, dialog open/close, card count limits, panel collapse/expand
- Integration verification: Socket.io broadcast of room details, card customization propagation, participant status tracking
- Operational verification: none (in-memory server)
- UAT / human verification: visual check of panel not overlapping table, branding consistency

## Milestone Definition of Done

This milestone is complete only when all are true:

- BananaPoker branding fully removed from room-facing UI
- Host dropdown menu with three functional dialogs (edit room, customize cards, settings)
- Voting system locked after creation; only card values customizable within the chosen system
- Participant panel visible on md+ screens, collapsed by default, with reveal reordering and group dividers
- Room name/description editable and broadcast live
- Full voting lifecycle works end-to-end with all new UI elements
- Landing page completely untouched
- No regressions in voting flow, tasks pane, or emoji reactions

## Requirement Coverage

- Covers: R201, R202, R203, R204, R205, R206, R207, R208, R209, R210, R211, R212, R213, R214, R215, R216, R217
- Partially covers: none
- Leaves for later: VOTE-06
- Orphan risks: none

## Slices

- [x] **S01: Branding & Cleanup** `risk:low` `depends:[]`
  > After this: navbar says "Keystimate", all banana_* localStorage keys renamed to keystimate_*, BananaPoker text gone from room-facing UI.

- [ ] **S02: Host Dropdown Menu & Dialogs** `risk:medium` `depends:[S01]`
  > After this: host clicks gear icon → dropdown with 3 options. Edit Room Details saves name/description and broadcasts live. Settings dialog has 3 toggles + end session. Room description shows under room ID in navbar. Server stores and broadcasts room name/description.

- [ ] **S03: Customize Cards Dialog** `risk:medium` `depends:[S02]`
  > After this: host opens Customize Cards → interactive add/remove of individual card values with live preview, min 2 / max 12 enforced. Voting system type selector removed from room. Changes broadcast to all participants.

- [ ] **S04: Participant Panel** `risk:high` `depends:[S01]`
  > After this: left-side transparent panel shows all room participants with avatar + voting status. Collapsible (collapsed default) / expandable. After reveal, reorders highest-to-lowest with group dividers (voters / non-numeric / spectators). Shows vote values after reveal. Hidden below 768px. Never overlaps poker table.

- [ ] **S05: Integration & Polish** `risk:low` `depends:[S01,S02,S03,S04]`
  > After this: full room flow works end-to-end — create room, edit details, customize cards, toggle settings, see participants through full voting lifecycle. No regressions in tasks pane, emoji reactions, or landing page.

## Boundary Map

### S01 → S02

Produces:
- `RoomNavbar.jsx` — "Keystimate" branding text, room info section ready for description display
- All localStorage keys using `keystimate_` prefix consistently

Consumes: nothing (first slice)

### S01 → S04

Produces:
- Clean branding baseline — no BananaPoker references in room components
- `PlayerAvatar.jsx` — unchanged component, available for use in participant panel

Consumes: nothing (first slice)

### S02 → S03

Produces:
- `RoomNavbar.jsx` — DropdownMenu with "Customize Cards" menu item wired to open a dialog
- `SettingsDialog.jsx` — standalone settings dialog (toggles + end session) extracted from RoomSettingsModal
- `EditRoomDetailsDialog.jsx` — room name/description dialog
- Server: `roomName` and `roomDescription` fields in room state, broadcast via `room_settings_updated`
- `Room.jsx` — `roomName` and `roomDescription` state, passed through to navbar

Consumes from S01:
- `RoomNavbar.jsx` — Keystimate branding, localStorage keys renamed

### S02 → S05

Produces:
- All three dialogs functional: EditRoomDetails, Settings, and Customize Cards placeholder trigger
- Server room name/description storage and broadcast

Consumes from S01:
- Clean branding baseline

### S03 → S05

Produces:
- `CustomizeCardsDialog.jsx` — interactive card add/remove with preview, min 2 / max 12
- Voting system type switching removed from room UI
- Card customization broadcasts to all clients via existing `update_room_settings`

Consumes from S02:
- DropdownMenu with "Customize Cards" menu item
- `Room.jsx` votingSystem state management

### S04 → S05

Produces:
- `ParticipantPanel.jsx` — left-side collapsible panel with avatar, name, status, reveal reordering, group dividers
- Responsive: hidden below 768px, never overlaps poker table

Consumes from S01:
- `PlayerAvatar.jsx` for avatar rendering
- Clean branding baseline
