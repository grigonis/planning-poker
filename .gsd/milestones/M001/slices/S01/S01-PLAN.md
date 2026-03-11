# S01: Foundation Refactoring

**Goal:** Establish dedicated `/create` page and remove legacy split-mode code.
**Demo:** Navigating to `/create` loads the room setup; landing page has no modal.

## Must-Haves
- `/create` route and page
- Removal of `CreateRoomModal.jsx`
- Removal of split-mode logic from backend/frontend

## Tasks
- [x] Delete `client/src/components/home/CreateRoomModal.jsx` and update `Landing.jsx`
- [x] Update Landing Page (`/`) transition to navigate to `/create`
- [x] Create `/create` route and page in `App.jsx` and `CreateRoom.jsx`
- [x] Nuke split mode from backend (`voteHandlers.js`, `roomHandlers.js`)
- [x] Nuke split mode from frontend (`Room.jsx`)
- [x] Verify redirection to `/room/:id` after creation

## Files Likely Touched
- client/src/components/home/CreateRoomModal.jsx
- client/src/pages/Landing.jsx
- client/src/pages/CreateRoom.jsx
- client/src/App.jsx
- server/handlers/voteHandlers.js
- server/handlers/roomHandlers.js
- client/src/pages/Room.jsx
