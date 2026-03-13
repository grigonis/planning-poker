# S01: Server — Groups data model & socket API

**Goal:** Server stores groups on the room, exposes socket events for CRUD and assignment, threads groups through all existing join/update/reveal payloads, and computes per-group averages on reveal.
**Demo:** After S01, a Socket.IO client can create a group, assign users, start a vote, and receive per-group averages in the revealed payload — no UI needed yet.

## Must-Haves

- `room.groups` (Map<groupId, {id, name, color}>) and `room.groupsEnabled` (boolean, default false) on all rooms.
- `user.groupId` (string | null) on all user objects.
- `manage_groups` event: host can create or delete a group. Broadcasts updated groups to room.
- `assign_group` event: any connected user (or host on behalf of another) can set a user's groupId. Broadcasts updated users list.
- `join_room` callback includes `groups` array and `groupsEnabled`.
- `user_joined` broadcast includes updated user objects (already includes groupId via full user list).
- `room_settings_updated` — `update_room_settings` handler forwards `groupsEnabled` toggle.
- `revealed` payload includes `groupAverages: Array<{groupId, name, average, count}>` when groupsEnabled.

## Proof Level

- This slice proves: integration (real socket server running)
- Real runtime required: yes (server must be running)
- Human/UAT required: no

## Verification

- Server restarts cleanly after changes: `bg_shell highlights` shows no crash.
- Manual socket trace via browser dev tools or server log confirms `manage_groups`, `assign_group`, `revealed` payloads are correct.

## Observability / Diagnostics

- Runtime signals: `console.log` on group create/delete/assign with roomId, groupId, userId.
- Inspection surfaces: server stdout via `bg_shell output`.
- Failure visibility: socket callback returns `{ error: string }` on permission or not-found failures.
- Redaction constraints: none (no secrets in group data).

## Integration Closure

- Upstream surfaces consumed: `server/store.js`, `server/handlers/roomHandlers.js`, `server/handlers/voteHandlers.js`, `server/index.js`.
- New wiring introduced: `server/handlers/groupHandlers.js` registered in `server/index.js`.
- What remains before milestone is usable end-to-end: S02 (UI to trigger events), S03 (tags), S04 (join picker + results split).

## Tasks

- [x] **T01: Add groups fields to room and user objects** `est:20m`
  - Why: All downstream code depends on `room.groups`, `room.groupsEnabled`, and `user.groupId` existing.
  - Files: `server/store.js`, `server/handlers/roomHandlers.js`
  - Do: In `store.js` createRoom, add `groups: new Map()` and `groupsEnabled: false`. In `roomHandlers.js` createRoomHandler, add same defaults. In joinRoomHandler NEW JOIN block, add `groupId: null` to new user object. In join_room callback and reconnect path, include `groups: Array.from(room.groups.values())` and `groupsEnabled: room.groupsEnabled`. In `update_room_settings` handler, forward `groupsEnabled` alongside existing settings.
  - Verify: Restart server, join room via browser, confirm console shows no errors. Check join_room response in browser Network tab has `groups: []` and `groupsEnabled: false`.
  - Done when: join_room callback includes groups/groupsEnabled fields without error.

- [x] **T02: Add groupHandlers — manage_groups and assign_group events** `est:30m`
  - Why: These are the two new mutation events the host/users will emit.
  - Files: `server/handlers/groupHandlers.js` (new), `server/index.js`
  - Do: Create `groupHandlers.js`. Export a function `(io, socket) => { ... }`. Implement `manage_groups` handler: accepts `{ roomId, action: 'CREATE'|'DELETE', groupId?, name? }`. For CREATE: generate uuid, pick color from palette (`['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4']`, cycle by groups.size % 6), add to room.groups, emit `room_groups_updated` to room with `{ groups: Array.from(room.groups.values()), groupsEnabled: room.groupsEnabled }`. For DELETE: remove from room.groups, clear groupId from any users who had it, emit `room_groups_updated` + `user_joined` (full users list). Implement `assign_group` handler: accepts `{ roomId, targetUserId, groupId }` (groupId null = unassign). Sets `user.groupId = groupId`, emits `user_joined` with full users list. Register both in `server/index.js` alongside existing handlers.
  - Verify: Server restarts cleanly. `bg_shell highlights` shows no crash.
  - Done when: Handler file exists, registered in index.js, server running with no errors.

- [x] **T03: Per-group averages in performReveal** `est:25m`
  - Why: The reveal payload must include per-group breakdown for the results UI.
  - Files: `server/handlers/voteHandlers.js`
  - Do: In `performReveal`, after computing the existing overall average, add per-group computation: iterate `room.groups.values()`, for each group find users with `user.groupId === group.id` and role !== SPECTATOR, collect their numeric votes, compute average (same rounding logic). Build `groupAverages: Array<{groupId, name, color, average, count}>`. Include in the `revealed` emit payload alongside existing `votes` and `averages`. If `!room.groupsEnabled` or `room.groups.size === 0`, emit `groupAverages: []`. Also include `groupsEnabled: room.groupsEnabled` in the `revealed` payload.
  - Verify: Server runs cleanly. On reveal, check server stdout logs (add a single `console.log('groupAverages:', JSON.stringify(groupAverages))` for debug — remove before S04 done).
  - Done when: `revealed` payload includes `groupAverages` array (empty when groups disabled, populated when enabled and assigned).

## Files Likely Touched

- `server/store.js`
- `server/handlers/roomHandlers.js`
- `server/handlers/voteHandlers.js`
- `server/handlers/groupHandlers.js` (new)
- `server/index.js`
