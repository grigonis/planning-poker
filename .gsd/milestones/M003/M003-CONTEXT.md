# M003: Room UX Restructure — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

Restructure the room UI experience: rebrand from BananaPoker to Keystimate, replace the monolithic settings modal with a host dropdown menu containing three separate dialogs (edit room details, customize cards, settings), lock voting system after creation, and add a collapsible participant panel on the left side showing live voting status with reveal-time reordering.

## Why This Milestone

The room UI has accumulated UX debt: a monolithic settings modal that mixes unrelated concerns (voting system, toggles, danger zone), no room identity beyond a 6-char code, no participant list outside the poker table, and legacy BananaPoker branding. This milestone cleans all of that up in one coherent pass.

## User-Visible Outcome

### When this milestone is complete, the user can:

- See "Keystimate" branding throughout the room UI
- As host, use a dropdown menu to access Edit Room Details, Customize Cards, and Settings as separate dialogs
- Edit room name/description and see changes reflected live for all participants
- Add/remove individual card values from the current voting scale with live preview
- See a collapsible left-side participant panel showing who's in the room, their voting status, and (after reveal) their votes ordered highest-to-lowest with group dividers

### Entry point / environment

- Entry point: `http://localhost:5173/room/:roomId`
- Environment: local dev (Vite dev server + Node.js Socket.io server)
- Live dependencies involved: Socket.io for real-time state broadcast

## Completion Class

- Contract complete means: all components render, dialogs open/close, card customization enforces limits, panel shows/hides correctly
- Integration complete means: room details broadcast live via Socket.io, card customization propagates to all clients, participant panel reflects real-time voting state
- Operational complete means: none (in-memory server, no persistence layer)

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Host creates room → edits room name/description → all participants see it live in navbar
- Host customizes cards (add/remove values) → all participants see updated card deck in VotingOverlay
- Host toggles settings → all participants see effects (instant reveal, fun features, privacy mode)
- Participant panel shows all users with correct status through full voting lifecycle (idle → voting → voted → revealed with reordering)
- Panel never overlaps poker table, hidden on small screens
- Landing page completely untouched

## Risks and Unknowns

- **Panel layout vs poker table** — the absolute-positioned poker table geometry may conflict with a left-side panel. S04 is highest risk because of this layout challenge.
- **DropdownMenu shadcn component** — needs to be added via `npx shadcn@latest add dropdown-menu`. Low risk since shadcn init is already done.
- **Room name/description server storage** — trivial addition to in-memory store, but needs careful broadcast to avoid race conditions with other settings updates.

## Existing Codebase / Prior Art

- `client/src/components/Room/RoomNavbar.jsx` — unified navbar, currently shows "BananaPoker" text (line 46), hosts settings gear button
- `client/src/components/Room/RoomSettingsModal.jsx` — monolithic modal with voting system grid, toggles, and danger zone. Will be split into three dialogs.
- `client/src/pages/Room.jsx` — main room page, manages all state and Socket.io listeners. Has `banana_session_*` and `banana_tasks_open_*` localStorage keys.
- `client/src/context/ThemeContext.jsx` — uses `banana-poker-theme` localStorage key
- `client/src/components/Room/PlayerAvatar.jsx` — imports from `assets/banana-poker/anonymous-monkey.svg`, provides avatar rendering
- `client/src/components/Room/PokerTable.jsx` — elliptical table with absolute-positioned player slots. The participant panel must coexist without overlapping.
- `server/handlers/roomHandlers.js` — `update_room_settings` handler already broadcasts settings changes. Needs room name/description fields added.
- `server/store.js` — in-memory room state, needs `roomName` and `roomDescription` fields.
- `client/src/components/ui/` — shadcn components. No dropdown-menu yet; needs adding.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R201–R202: Branding cleanup
- R203–R205, R209, R217: Dropdown menu, dialogs, server support
- R206–R208: Card customization
- R210–R216: Participant panel

## Scope

### In Scope

- Replace BananaPoker branding with Keystimate in room-facing UI
- Rename all banana_* localStorage keys to keystimate_*
- Add shadcn DropdownMenu component
- Split RoomSettingsModal into three separate dialogs
- Build room details editing with server-side storage and live broadcast
- Build interactive card customization dialog
- Lock voting system type after room creation
- Build collapsible participant panel with reveal-time reordering
- Remove voting system switcher from room (keep it only on CreateRoom page)

### Out of Scope / Non-Goals

- Landing page changes (constraint D011)
- Backend voting logic changes
- Auth/team model
- Database persistence
- Mobile-specific participant panel (hidden below 768px)

## Technical Constraints

- shadcn/ui with Tailwind v3 and OKLCH CSS variables (D015)
- Landing page must remain completely untouched (D011)
- Two design systems coexist: landing (custom) and room (shadcn)
- Server is in-memory only — no database

## Integration Points

- Socket.io `update_room_settings` — extend to handle room name/description
- Socket.io `room_settings_updated` — extend payload to include room name/description
- VotingOverlay — must respect customized card values
- PokerTable — participant panel must not overlap its absolute-positioned layout

## Open Questions

- None — all gray areas resolved during discussion
