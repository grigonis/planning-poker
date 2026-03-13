# M004: Player Groups — Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

## Project Description

Keystimate is a real-time planning poker app. Rooms have users, votes, tasks, and results. Backend is Node.js + Socket.IO (in-memory store). Frontend is React + shadcn/ui.

## Why This Milestone

Teams often have sub-groups (e.g., frontend vs backend devs, or two squads) who need to see their voting results separately while still sharing a single room. Currently all voters are treated as a flat list with one aggregate result. This milestone adds a first-class group concept that spans the full stack.

## User-Visible Outcome

### When this milestone is complete, the user can:

- (Host) Open Settings → "Manage Groups" → enable groups, create named groups, see group list.
- (Host) Assign any participant to a group from the Manage Groups dialog.
- (Any user) Click a participant in the Participant Panel → "Assign Group" action → pick a group from a list.
- (Joining user) Select a group on the join screen when groups are enabled in the room.
- See a group tag next to each player name (only when groups are enabled AND they are assigned).
- After reveal: results board splits into per-group blocks (Group A: 5 · Group B: 3) with a combined final result; the task's recorded vote reflects the combined result.

### Entry point / environment

- Entry point: http://localhost:5173 (Room page)
- Environment: local dev, browser
- Live dependencies: Socket.IO server on :5000

## Completion Class

- Contract complete means: server correctly stores groups, emits them on all relevant events, and computes per-group averages on reveal.
- Integration complete means: host can create groups; participants can be assigned; join flow shows group picker; revealed results split per group; task records combined result.
- Operational complete means: groups survive reconnect (existing session restore path sends groups back).

## Final Integrated Acceptance

- Host creates two groups "Alpha" and "Beta", assigns three players each, starts vote, all vote, reveals — results show "Alpha: X · Beta: Y · Combined: Z".
- A new user joins the room, sees the group picker, selects "Alpha", and appears with the Alpha tag in the participant panel.
- A player with no group assigned shows no group tag at all.
- Task result stored = combined average.

## Risks and Unknowns

- **Socket event proliferation** — groups must be included in join_room response, room_settings_updated, and user_joined payloads without breaking existing consumers.
- **Participant panel assign UX** — clicking a user in the panel needs a popup/dropdown without a full modal. Need to verify shadcn DropdownMenu can be composed cleanly inside the panel.

## Existing Codebase / Prior Art

- `server/store.js` — room object shape; groups map needs to be added here.
- `server/handlers/roomHandlers.js` — join/create/settings handlers; groups must be threaded through.
- `server/handlers/voteHandlers.js` — `performReveal` computes averages; needs per-group split.
- `client/src/components/Room/SettingsDialog.jsx` — receives settings props; "Manage Groups" item links here.
- `client/src/components/Room/RoomNavbar.jsx` — host dropdown (Edit Room / Customize Cards / Settings) — add "Manage Groups".
- `client/src/components/Room/ParticipantPanel.jsx` — renders user rows; needs group tag + assign action.
- `client/src/components/Results/ResultsBoard.jsx` — per-group result blocks already exist for SPLIT mode — model new group blocks on this pattern.
- `client/src/components/GuestJoinModal.jsx` — join form; add group picker step when groups enabled.
- `client/src/pages/Room.jsx` — orchestrates all state; needs groups state + socket handlers.

## Scope

### In Scope

- Group CRUD (create, list, delete) — host only.
- Assign user to group — host via Manage Groups dialog OR any user via Participant Panel action.
- Group picker on join screen (when groups are enabled).
- Group tag on player names (everywhere names are shown: ParticipantPanel, PlayerAvatar tooltip if any).
- Per-group result split in revealed state (PokerTable center + ResultsBoard).
- Combined result stored to task.
- Groups survive reconnect.

### Out of Scope / Non-Goals

- Persistent storage (groups are in-memory, lost when server restarts — same as all other state).
- Group-level re-vote (future milestone).
- Spectators can belong to a group (they don't vote, so group display is moot).
- Importing groups from external tools.

## Technical Constraints

- No new npm packages unless strictly necessary.
- All new socket events follow existing naming pattern: snake_case verbs.
- Group IDs: uuid v4 (already in use).
- Groups stored on the room object: `room.groups = Map<groupId, { id, name, color }>`.
- Group membership stored on user object: `user.groupId = string | null`.
