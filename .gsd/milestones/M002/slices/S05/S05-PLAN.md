# S05: Navbar Unification + Cleanup

**Goal:** Unify the navigation experience across room creation and active sessions using a single shadcn-based `RoomNavbar` component, and modernize the voting progress indicator.
**Demo:** A consistent navbar is visible on both `/create` and `/room/:id` pages, and the vote progress bar in the `PokerTable` uses the shadcn `Progress` primitive.

## Must-Haves

- `RoomNavbar.jsx` component exists and is used in both `Room.jsx` and `CreateRoom.jsx`.
- All navbar actions use shadcn `Button`.
- `PokerTable.jsx` uses shadcn `Progress` component.
- `npm run build` passes in `client/`.
- Landing page remains untouched (visual check).

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run build` in `client/` exits 0.
- `rg "RoomNavbar" client/src/pages/Room.jsx client/src/pages/CreateRoom.jsx` returns hits in both files.
- Visual verification of `/create`, `/room/:id`, and `/` in the browser.

## Observability / Diagnostics

- Runtime signals: Console logs for `RoomNavbar` initialization mode (full vs minimal).
- Inspection surfaces: UI state check for `RoomNavbar` presence and `Progress` bar rendering.
- Failure visibility: `npm run build` errors for missing components or props.

## Integration Closure

- Upstream surfaces consumed: `client/src/components/ui/button.tsx`, `client/src/components/Room/ThemeToggle.jsx`
- New wiring introduced in this slice: `RoomNavbar` integration in `Room.jsx` and `CreateRoom.jsx`; `Progress` in `PokerTable.jsx`.
- What remains before the milestone is truly usable end-to-end: nothing

## Tasks

- [x] **T01: Progress Primitive & PokerTable Update** `est:30m`
  - Why: Modernize the voting progress bar with a shadcn primitive.
  - Files: `client/src/components/Room/PokerTable.jsx`
  - Do: Add shadcn `progress` component; replace the hand-rolled progress `div` in `PokerTable.jsx` with `<Progress />`.
  - Verify: Visual check of the progress bar during a vote.
  - Done when: `PokerTable.jsx` imports and uses the `Progress` component.
- [x] **T02: Unified RoomNavbar Component** `est:1h`
  - Why: Create a single source of truth for the room navigation UI.
  - Files: `client/src/components/Room/RoomNavbar.jsx`
  - Do: Create the `RoomNavbar` component; implement "minimal" (branding only) and "full" modes; use shadcn `Button` for all icon actions.
  - Verify: `RoomNavbar.jsx` exists and renders correctly in a standalone preview or temporary test mount.
  - Done when: `RoomNavbar.jsx` is functionally complete with all actions from the current `Room.jsx` navbar.
- [x] **T03: Navbar Integration & Cleanup** `est:45m`
  - Why: Apply the unified navbar across the room flow and ensure no regressions.
  - Files: `client/src/pages/Room.jsx`, `client/src/pages/CreateRoom.jsx`
  - Do: Replace existing navbar code in both pages with `<RoomNavbar />`; pass necessary props; perform final visual and build checks.
  - Verify: `npm run build` passes; visual check of `/create`, `/room/:id`, and `/`.
  - Done when: Both room pages use the unified component and the landing page is unchanged.

## Files Likely Touched

- `client/src/components/Room/RoomNavbar.jsx`
- `client/src/components/Room/PokerTable.jsx`
- `client/src/pages/Room.jsx`
- `client/src/pages/CreateRoom.jsx`
- `client/src/components/ui/progress.tsx`
