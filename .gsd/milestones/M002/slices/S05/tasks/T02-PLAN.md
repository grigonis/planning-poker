---
estimated_steps: 5
estimated_files: 1
---

# T02: Unified RoomNavbar Component

**Slice:** S05 — Navbar Unification + Cleanup
**Milestone:** M002

## Description

Create the `RoomNavbar.jsx` component that will be shared by `Room.jsx` and `CreateRoom.jsx`. This component will support a "minimal" mode for room creation and a "full" mode for active sessions.

## Steps

1. Create `client/src/components/Room/RoomNavbar.jsx`.
2. Extract the navbar structure from `client/src/pages/Room.jsx`.
3. Implement props to handle:
   - `roomId`: The room ID to display (or null for minimal mode).
   - `socketStatus`: Connection status indicator.
   - `tasksCount`: Number of tasks to show in the badge.
   - `isHost`: To toggle visibility of settings button.
   - `onToggleTasks`, `onOpenSettings`, `onOpenInvite`, `onOpenProfile`: Handlers for all actions.
4. Replace all `<button>` tags with shadcn `<Button />` components.
   - Use `variant="ghost"` or `variant="outline"` as appropriate.
   - Use `size="icon"` for pure icon buttons.
   - Ensure `rounded-full` is used where consistent with the design.
5. Add a `minimal` boolean prop to hide everything except the branding and `ThemeToggle`.

## Must-Haves

- [ ] `RoomNavbar.jsx` component created.
- [ ] Uses shadcn `Button` for all interactive elements.
- [ ] Supports both minimal and full display modes.
- [ ] Properly handles the "BananaPoker" branding and click-to-home behavior.

## Verification

- Inspect `RoomNavbar.jsx` to ensure all actions are parameterized and use shadcn buttons.
- (Manual) Temporarily import and render `RoomNavbar` in a dummy page to check styles.

## Observability Impact

- Signals added/changed: Props for `socketStatus` and `tasksCount` are passed through.
- How a future agent inspects this: Check `RoomNavbar.jsx` for shadcn `Button` usage and prop definitions.
- Failure state exposed: Missing handlers or props will cause runtime errors or visual bugs.

## Inputs

- `client/src/pages/Room.jsx` — Source for the current navbar JSX and logic.

## Expected Output

- `client/src/components/Room/RoomNavbar.jsx` — New unified navbar component.
