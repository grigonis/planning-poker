# M006: Team Management & Dashboard

**Vision:** Transform Keystimate from a one-off room tool into a persistent team workspace. Introduce a Dashboard where users can manage their global identity (avatar/settings), view their session history (complete with task outcomes and participants), and manage multiple rooms from a single interface.

## Success Criteria

- User lands on `/dashboard` (or redirected from `/` if profile exists)
- Dashboard shows:
  - **Profile Section:** Editable name and persistent avatar selection
  - **Active Rooms:** List of rooms the user is currently hosting/participating in
  - **Session History:** List of past rooms with detailed voting results and task history
- Room history view shows:
  - All tasks voted on in that session
  - Final consensus or average for each task
  - List of participants who were in the room
- Users can create new rooms directly from the dashboard
- No database for now — storage handled by a combination of `localStorage` (client) and enhanced in-memory `store.js` (server)

## Slices

- [ ] **S01: Dashboard Foundation & Profile Persistence** `risk:medium` `depends:[]`
  > After this: `/dashboard` route exists; Global profile (name/avatar) persisted in `localStorage` and synchronized with Dashboard UI.
- [ ] **S02: In-Memory History Store & Session Recording** `risk:medium` `depends:[S01]`
  > After this: Server `store.js` expanded to archive completed sessions; `room_ended` event triggers history snapshotting.
- [ ] **S03: Room Management & History UI** `risk:high` `depends:[S02]`
  > After this: Dashboard lists previous rooms; clicking a history item reveals a detailed "Post-Mortem" view of the session (tasks/members).
- [ ] **S04: Multi-Room Navigation & Polish** `risk:low` `depends:[S03]`
  > After this: Users can seamlessly switch between dashboard and active rooms; logo/nav updated for dashboard-first navigation.

## Milestone Definition of Done

- `/dashboard` is the primary hub for returning users
- Profiles (name, avatar, settings) survive page refreshes and browser restarts (via `localStorage`)
- A "Room History" feature exists showing at least the last 10 sessions
- History items include: Room name, Date, Participant count, and Task breakdown
- Detailed history view shows the specific vote outcome for every task in that session
- Dashboard includes a "Create New Room" button that bypasses the manual `/create` if desired
- UI maintains high aesthetic standards (shadcn/ui consistency)
