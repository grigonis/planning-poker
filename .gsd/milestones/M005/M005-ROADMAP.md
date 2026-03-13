# M005: Create Room & Join UX Redesign

**Vision:** Replace the current create-room/join flow with a polished, avatar-first identity experience. Room creators configure the room (not themselves) up front; everyone — host and guests alike — enters their name and picks a generated avatar before seeing the room. Joining guests also choose their group when groups exist.

## Success Criteria

- Create Room page asks for room name (not player name) + voting system + collapsed Options panel with spectator toggle
- After creating a room, user lands in the room but sees a profile setup dialog before the room is visible
- Profile dialog shows 12 auto-generated avatars (6 male, 6 female), display name input, Continue CTA
- Joining guests see the same profile dialog + group picker when groups are enabled
- Avatar click in the room toolbar opens the same profile dialog (unified component)
- All three entry points share one `ProfileSetupDialog` component

## Key Risks / Unknowns

- Server decoupling of roomName from playerName — currently `create_room` uses `name` for both — if poorly handled, host gets blank name in participant panel
- dicebear `sex` param + reproducible seeds — needs to generate same 12 every render cycle

## Slices

- [x] **S01: Server & Create Room page** `risk:high` `depends:[]`
  > After this: create_room accepts roomName; CreateRoom.jsx shows room-name field, voting system, and Options collapse with spectator switch; room is created correctly and host is redirected with hostUserId in state
- [x] **S02: ProfileSetupDialog — shared identity component** `risk:medium` `depends:[S01]`
  > After this: ProfileSetupDialog renders 12 generated avatars (6M/6F), name input, Continue CTA; used for host entry, guest entry, and toolbar avatar edit; group picker shown when groups present
- [x] **S03: Wire everything together + polish** `risk:low` `depends:[S02]`
  > After this: full end-to-end flow works — create, profile setup, room view; guest join works; toolbar edit works; all three paths use ProfileSetupDialog

## Milestone Definition of Done

- CreateRoom.jsx shows room name field (not player name), voting system, options collapse
- Server stores roomName on create_room
- Host enters room → sees ProfileSetupDialog before room content → continues → room is visible with correct name
- Guest navigates to /room/:id → sees ProfileSetupDialog → continues → room is visible
- Groups picker appears in guest profile setup when groups are enabled
- Toolbar avatar button opens ProfileSetupDialog in edit mode (same component)
- 12 avatars: 6 with male sex param, 6 with female sex param, all visible and selectable
