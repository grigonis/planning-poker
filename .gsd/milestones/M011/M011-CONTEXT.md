# M011: UX Overhaul & Interaction Polish — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

Keystimate is a real-time Planning Poker app (React + Vite, Node/Express/Socket.io, Firebase). All 10 prior milestones shipped. This milestone addresses 11 UX/interaction issues spanning the participant panel, host controls, voting lifecycle, and UI polish.

## Why This Milestone

The app is feature-complete but has accumulated UX friction: the participant panel doesn't reflect voting lifecycle states, host post-reveal controls are limited, task-based voting doesn't auto-advance, and several small CSS/interaction issues degrade polish. These are the kind of details that separate "works" from "feels great."

## User-Visible Outcome

### When this milestone is complete, the user can:

- See participants grouped by voting lifecycle state (Waiting → Voting → Voted → Revealed) with appropriate icons
- See spectators always at the bottom; see group-mode override on reveal
- Use "Next round" and "Revote" buttons after vote reveal
- Experience automatic task advancement when tasks are queued
- No longer see distracting hover animation on table avatars
- No longer see redundant "Planning Poker" text on table
- Get toast confirmation and auto-close when copying invite link
- See readable hover states in settings menu (no white-on-white)
- Host can kick users from the left panel
- Sidebar collapse/expand animation is smooth (no avatar warping)
- All inputs are slightly larger globally
- User profile dropdown has spectator mode toggle and screen-sharing toggle (keyboard controls hint)

### Entry point / environment

- Entry point: `http://localhost:5173/room/:id`
- Environment: local dev (Vite + Node server)
- Live dependencies involved: Socket.io (real-time), Firebase (optional, can be mocked)

## Completion Class

- Contract complete means: all 11 issues addressed, visually verified in browser
- Integration complete means: socket events (kick, spectator toggle, vote clear) work across multiple clients
- Operational complete means: none (dev environment)

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Full voting lifecycle (Waiting → Voting → Voted → Revealed → Reset) reflects correctly in participant panel grouping
- Host can kick a user, and that user is routed to dashboard with a message
- Task-based voting auto-advances to the next pending task after reveal+reset
- All 11 UI/CSS fixes are visually verified

## Risks and Unknowns

- Participant panel lifecycle grouping touches the core `getOrderedGroups` function and `ParticipantPanel` — needs careful state management
- Kick functionality requires a new server-side socket event and client-side handling
- Spectator mode toggle mid-round requires clearing an existing vote server-side
- Task auto-advance needs server-side logic changes in the reset handler

## Existing Codebase / Prior Art

- `client/src/components/Room/ParticipantPanel.jsx` — participant list, `getOrderedGroups`, `StatusDot`, `StatusIcon`
- `client/src/components/Room/PokerTable.jsx` — table surface, "New Round" button, "Planning Poker" text
- `client/src/components/Room/RoomNavbar.jsx` — settings dropdown, keyboard shortcuts button, user dropdown
- `client/src/components/Room/PlayerAvatar.jsx` — avatar click handler, hover animation
- `client/src/components/InviteModal.jsx` — copy link flow
- `client/src/components/Room/SettingsDialog.jsx` — settings toggle list
- `client/src/components/Room/KeyboardShortcutsDialog.jsx` — keyboard shortcuts dialog
- `client/src/pages/Room.jsx` — main room orchestrator
- `client/src/hooks/useRoomHandlers.js` — socket emission handlers
- `client/src/hooks/useRoomSocket.js` — socket event listeners
- `server/handlers/voteHandlers.js` — vote start, cast, reveal, reset
- `server/handlers/roomHandlers.js` — join, disconnect, end session
- `server/handlers/taskHandlers.js` — task CRUD, select

## Scope

### In Scope

1. Left-panel user grouping & lifecycle states (Waiting/Voting/Voted/Revealed/Skipped/Spectating)
2. Group mode override on reveal
3. Host controls post-reveal (Next round + Revote buttons)
4. Task-based voting auto-advance
5. Disable avatar hover animation on table
6. Remove "Planning Poker" text from table
7. Invite dialog auto-close + toast on copy
8. Settings menu hover CSS fix
9. Host kick functionality
10. Sidebar collapse/expand animation fix
11. Global input sizing increase
12. User profile dropdown: spectator toggle + screen sharing toggle (keyboard controls hint)

### Out of Scope / Non-Goals

- Firebase production deployment
- OAuth provider setup
- New voting systems or card types
- Mobile responsive overhaul

## Technical Constraints

- React 18 + Vite, no TypeScript
- Socket.io for real-time events
- shadcn/ui component library (Radix primitives)
- Tailwind CSS
- Must maintain existing security hardening (host-only authorization, rate limiting)

## Open Questions

- None — all 11 issues are clearly specified
