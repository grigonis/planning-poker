# S05: Navbar Unification + Cleanup — Research

## Summary
This slice focuses on unifying the navigation experience across the room creation and active session pages, while also modernizing the vote progress indicator in the `PokerTable` component.

## Key Findings

### 1. Existing Navbars
- **`Room.jsx` Navbar**: Complex, contains branding, room ID, socket connection status, player avatar (profile), Tasks toggle (with count), Invite button, Theme toggle, and Settings (host only).
- **`CreateRoom.jsx` Navbar**: Simple, contains branding and Theme toggle. It uses dummy branding layout.
- **Communalities**: Both use the same logo ("BananaPoker"), branding click-to-home behavior, and `ThemeToggle`. Both share the same background effects (`aurora` and `modern-grid`).

### 2. Progress Bar
- **Current**: Hand-rolled `div` with `bg-gradient-to-r` and width controlled by `voteProgress` percentage.
- **Target**: shadcn `Progress` component.
- **Location**: `client/src/components/Room/PokerTable.jsx`, inside the `isVotingPhase` condition.

### 3. shadcn Components Needed
- `button` (already present)
- `progress` (needs to be added: `npx shadcn@latest add progress`)

### 4. Component Extraction: `RoomNavbar.jsx`
- New path: `client/src/components/Room/RoomNavbar.jsx`
- Should be flexible enough to handle:
  - "Minimal mode" (for `CreateRoom.jsx`): Branding + ThemeToggle only.
  - "Full mode" (for `Room.jsx`): Branding + Room Info + Socket Status + All Action Buttons.
- Button migration: All `<button>` tags in the navbar should be replaced with shadcn `<Button>` using appropriate variants (`outline`, `secondary`, `ghost`) and `rounded-full` where consistent with the current design.

## Implementation Plan

### Task 1: Add shadcn Progress
- Run `npx shadcn@latest add progress` in `client/`.

### Task 2: Create `RoomNavbar.jsx`
- Define `RoomNavbar` component.
- Move the navbar JSX from `Room.jsx` into this component.
- Parameterize the data (roomId, socket status, tasks count, etc.) and handlers.
- Use shadcn `Button` for all actions.

### Task 3: Integrate `RoomNavbar` in `Room.jsx`
- Import and use `RoomNavbar`.
- Pass necessary props and state handlers.
- Remove redundant navbar code and styles.

### Task 4: Integrate `RoomNavbar` in `CreateRoom.jsx`
- Import and use `RoomNavbar` in minimal mode (or passing `roomId={null}`).
- Remove dummy navbar code.

### Task 5: Modernize `PokerTable.jsx` Progress
- Import `Progress` from `@/components/ui/progress`.
- Replace custom progress `div` with `<Progress />`.
- Maintain the visual polish (gradient/glow) if possible via `className` or CSS variables, but prioritize the shadcn primitive.

## Risks & Constraints
- **Layout shift**: Ensuring the unified navbar has the same height and sticky behavior to avoid layout shifts when navigating between `/create` and `/room/:id`.
- **Button Styling**: shadcn `Button` has default padding/height that might differ from the custom buttons. Use `size` props and `className` overrides to match the compact navbar look.

## Verification Plan
- **Contract**: `npm run build` passes in `client/`.
- **Visual**: 
  - Compare `/create` and `/room/:id` navbars — branding should be identical.
  - Verify `Progress` bar renders and updates during a live vote.
  - Verify all navbar buttons function correctly (Settings, Tasks, Invite, Profile).
- **Regression**: Landing page (`/`) should still be untouched and look identical.
