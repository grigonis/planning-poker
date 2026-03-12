---
estimated_steps: 8
estimated_files: 3
---

# T04: Final Card & Room Token Cleanup

**Slice:** S04 — Voting Overlay + Toasts
**Milestone:** M002

## Description

Perform a final sweep of the poker room UI to ensure all remaining `banana-*` and `orange-*` tokens are replaced with semantic ones. This includes updating the revealed vote cards (`Card.jsx`) and the center of the `PokerTable.jsx`.

## Steps

1. Update `client/src/components/Voting/Card.jsx`:
    - Replace `border-banana-500` with `border-primary`.
    - Replace `ring-orange-500` with `ring-primary`.
    - Use `bg-card` and `text-card-foreground`.
2. Sweep `client/src/components/Room/PokerTable.jsx`:
    - Update progress bar tokens (if any remain).
    - Update center glow/text colors to use `primary`.
    - Replace any `banana-` tokens in the "Quick Start" or "Reveal" buttons.
3. Sweep `client/src/pages/Room.jsx`:
    - Replace `selection:bg-banana-500/30` with `selection:bg-primary/30`.
    - Update confetti colors to match primary blue (`#2563eb` approx channel values).
4. Run `rg "banana-" client/src/components/Room client/src/components/Voting client/src/pages/Room.jsx` to confirm zero hits.

## Must-Haves

- [ ] Zero `banana-` tokens in the room scope.
- [ ] `Card.jsx` (revealed) matches the "claude blu 2" theme.
- [ ] Confetti matches the theme.

## Verification

- `rg "banana-"` command returns zero results.
- `npm run build` passes.
- Manual UAT: Reveal votes and verify the look of cards on the table.

## Observability Impact

- Signals added/changed: None.
- How a future agent inspects this: `rg` command.
- Failure state exposed: None.

## Inputs

- `S04-RESEARCH.md` — Token surface area map.

## Expected Output

- `client/src/components/Voting/Card.jsx` — Clean tokens.
- `client/src/components/Room/PokerTable.jsx` — Clean tokens.
- `client/src/pages/Room.jsx` — Clean tokens.
