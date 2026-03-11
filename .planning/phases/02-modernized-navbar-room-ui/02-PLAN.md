# Phase 2: Modernized Navbar & Room UI - Execution Plan

**Status:** Ready for execution

## Phase Goal
Update layout to match a Kollabe-style modern Navbar and Room Settings menu, while ensuring the Spectator role functions seamlessly.

## Requirements Covered
- **ARCH-04**: Navbar is modernized with additional options mirroring Kollabe functionality.
- **TASK-05**: Modernized UI Settings menu (tailored to current app UI) for room configuration.
- **TASK-06**: Spectator role retained exactly as is (can observe without participating).

## Step-by-step Implementation

1. **Modernize the Room Navbar Layout**
   - File: `client/src/pages/Room.jsx`
   - Action: Rework the top navigation bar to look like a modern productivity tool's header. Consolidate branding, room information (like the Room ID copying mechanics, possibly a dedicated "Invite" button style), and user/settings controls onto a sleek, consistent glass/solid bar depending on theming. Use cleaner typography and spacing.

2. **Refine User and Spectator Badges**
   - File: `client/src/pages/Room.jsx` (and child components if applicable)
   - Action: Ensure the current user's role (Estimator vs Spectator) is cleanly displayed.
   - Verify that logic related to Spectator remains untouched (they do not participate in voting, do not skew averages).

3. **Overhaul the Room Settings Menu**
   - File: `client/src/components/Room/RoomSettingsModal.jsx`
   - Action: Redesign the modal UI. Improve the layout of the form controls for switching game modes, toggling fun features, auto-reveal, and anonymous mode. Add better descriptions or tooltips, and ensure it follows the "premium" aesthetics standard.
   - Separate dangerous actions (like "End Session") visually.

4. **Verify Spectator Invariance**
   - Action: Add or review client-side handling to confirm that Spectators joining the room only increment the `users` array but do not factor into the active voters expected array logic.

5. **Test Overall Responsive Design**
   - Action: Ensure the modernized Navbar gracefully adapts on mobile screens (e.g., hiding text labels for buttons, condensing information).
