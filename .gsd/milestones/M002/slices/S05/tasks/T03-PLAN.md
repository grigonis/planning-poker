---
estimated_steps: 6
estimated_files: 3
---

# T03: Navbar Integration & Cleanup

**Slice:** S05 — Navbar Unification + Cleanup
**Milestone:** M002

## Description

Integrate the new `RoomNavbar` into `Room.jsx` and `CreateRoom.jsx`, remove redundant code, and perform final verification of the milestone requirements.

## Steps

1. Update `client/src/pages/Room.jsx`:
   - Import `RoomNavbar`.
   - Replace the entire navbar section with `<RoomNavbar />`, passing all required props and handlers.
   - Remove any local navbar-specific state or sub-components that are now in `RoomNavbar`.
2. Update `client/src/pages/CreateRoom.jsx`:
   - Import `RoomNavbar`.
   - Replace the dummy navbar with `<RoomNavbar minimal />`.
3. Verify that the landing page (`client/src/pages/Landing.jsx`) is untouched and still functions correctly.
4. Run `npm run build` in `client/` to ensure no broken imports or type errors.
5. Final check of the room flow: Create -> Join -> Vote -> Reveal -> Settings -> Tasks.
6. Verify zero `banana-*` tokens remain in the room scope (one final `rg` check).

## Must-Haves

- [ ] `Room.jsx` and `CreateRoom.jsx` both use `RoomNavbar`.
- [ ] No `banana-*` tokens in `client/src/components/Room/` or `client/src/components/Voting/`.
- [ ] Landing page UI is unchanged.
- [ ] Build passes successfully.

## Verification

- `rg "RoomNavbar" client/src/pages/Room.jsx client/src/pages/CreateRoom.jsx` shows imports and usage.
- `rg "banana-" client/src/components/Room client/src/components/Voting` returns zero hits.
- Browser test: Navigation between pages is seamless.

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: Check page imports for `RoomNavbar`.
- Failure state exposed: Broken pages or failed builds.

## Inputs

- `client/src/components/Room/RoomNavbar.jsx` — Component from T02.
- `client/src/pages/Room.jsx` — Target for integration.
- `client/src/pages/CreateRoom.jsx` — Target for integration.

## Expected Output

- `client/src/pages/Room.jsx` — Cleaned up and using `RoomNavbar`.
- `client/src/pages/CreateRoom.jsx` — Cleaned up and using `RoomNavbar`.
- Milestone M002 complete.
