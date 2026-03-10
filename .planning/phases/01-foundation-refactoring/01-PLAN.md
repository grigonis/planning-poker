# Phase 1: Foundation Refactoring - Execution Plan

**Status:** Ready for execution

## Phase Goal
Establish dedicated `/create` page with the app environment, removing the modal from the landing, and completely removing legacy split-mode code.

## Requirements Covered
- **ARCH-01**: Room creation triggers via dedicated `/create` page instead of a modal.
- **ARCH-02**: Landing page (`/`) serves exclusively as a marketing/entry index.
- **ARCH-03**: Remove all legacy "split mode" averages and logic from backend and frontend.

## Step-by-step Implementation

1. **Delete Existing Modal**
   - File: `client/src/components/home/CreateRoomModal.jsx`
   - Action: Delete this file completely. Update `Landing.jsx` to remove imports and usage.

2. **Update Landing Page (`/`) Transition**
   - File: `client/src/pages/Landing.jsx`
   - Action: Modify the "Create Room" actions to smoothly navigate (via Framer Motion fade) to `/create`, entirely dropping modal logic.

3. **Create the `/create` Route & Page**
   - File: `client/src/pages/CreateRoom.jsx`
   - Action: Implement the new page. The UI should display the "empty" `Room` environment in the background (dimmed or heavily blurred using Tailwind backdrops), while the foreground provides the setup form:
     - User Display Name
     - Voting System selector (Modified Fibonacci default, Presets, Custom options with labels)
     - Spectator Option

4. **Update App Router**
   - File: `client/src/App.jsx`
   - Action: Add the `/create` route correctly to load the new `CreateRoom` page.

5. **Nuke Split Mode from Backend**
   - File: `server/handlers/voteHandlers.js` & `server/handlers/roomHandlers.js`
   - Action: Delete all arrays, metric objects, and variables specifically scoped to `split mode`. Refactor average calculations to only calculate a single global average from the players table, ignoring non-numerical inputs (like ☕ or text labels). 

6. **Nuke Split Mode from Frontend**
   - File: `client/src/pages/Room.jsx` (and potentially related Room child components)
   - Action: Strip all UI labels and switches (like toggling visual metrics) that were scoped to the dual-metrics design.

7. **Verify Redirection**
   - Ensure the new `/create` page correctly initializes the room via existing sockets and handles graceful redirection to `/room/:id` automatically on success.
