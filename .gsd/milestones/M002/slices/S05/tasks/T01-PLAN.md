---
estimated_steps: 4
estimated_files: 2
---

# T01: Progress Primitive & PokerTable Update

**Slice:** S05 — Navbar Unification + Cleanup
**Milestone:** M002

## Description

Add the shadcn `progress` component and use it to replace the custom-styled vote progress bar in `PokerTable.jsx`.

## Steps

1. Add the shadcn progress primitive: `npx shadcn@latest add progress` in `client/`.
2. Import `Progress` in `client/src/components/Room/PokerTable.jsx`.
3. Locate the `voteProgress` div in `PokerTable.jsx` (inside the `isVotingPhase` check).
4. Replace the custom progress div with the `<Progress />` component, passing `value={voteProgress}` and preserving the surrounding layout.

## Must-Haves

- [ ] `client/src/components/ui/progress.tsx` exists.
- [ ] `PokerTable.jsx` uses the `Progress` component.
- [ ] The progress bar correctly reflects the voting status.

## Verification

- Visual check: Start a session, open the voting overlay, and verify the progress bar updates as players vote.
- Build check: `npm run build` in `client/`.

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: Check `PokerTable.jsx` for the `<Progress />` component.
- Failure state exposed: `npm run build` will fail if the component is missing or incorrectly imported.

## Inputs

- `client/src/components/Room/PokerTable.jsx` — Existing hand-rolled progress bar.

## Expected Output

- `client/src/components/ui/progress.tsx` — New shadcn primitive.
- `client/src/components/Room/PokerTable.jsx` — Updated to use shadcn `Progress`.
