---
slice: S01
title: Server — Groups data model & socket API
status: complete
completed: 2026-03-13
---

## What Was Built

- `room.groups` (Map<groupId, {id, name, color}>) and `room.groupsEnabled: false` added to room object in both `store.js` and `roomHandlers.js` createRoomHandler.
- `user.groupId: null` added to all user objects (host on create, new users on join).
- `groups` and `groupsEnabled` threaded into: `join_room` callback, `create_room` callback, `update_room_settings` handler (forwards `groupsEnabled`).
- `server/handlers/groupHandlers.js` (new): implements `manage_groups` (CREATE/DELETE with color palette) and `assign_group` (host assigns anyone, user self-assigns). Both emit `room_groups_updated` + `user_joined` on change.
- `performReveal` in `voteHandlers.js` now computes `groupAverages: Array<{groupId, name, color, average, count}>` when `groupsEnabled && groups.size > 0`, included in `revealed` payload alongside existing `averages`. Combined average unchanged = task stored value.
- `groupHandlers` registered in `server/index.js`.

## Verification

- Server starts clean on port 5000 ✓
- `join_room` callback confirmed to include `groups: []` and `groupsEnabled: false` via live socket test ✓
- No regressions: existing room creation, join, settings, vote, reveal flows all unchanged ✓

## Contracts Produced for S02

- Socket events: `manage_groups { roomId, action, groupId?, name? }` → callback `{ ok, groups }` or `{ error }`
- Socket events: `assign_group { roomId, targetUserId, groupId }` → callback `{ ok }` or `{ error }`
- Socket broadcast: `room_groups_updated { groups, groupsEnabled }`
- `join_room` response: `{ ...existing, groups: Group[], groupsEnabled: boolean }`
- `revealed` payload: `{ ...existing, groupAverages: GroupAverage[], groupsEnabled: boolean }`
- Group color palette: `['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4']` (index by groups.size % 6)
