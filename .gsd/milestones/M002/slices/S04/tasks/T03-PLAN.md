---
estimated_steps: 6
estimated_files: 1
---

# T03: Rebuild VotingOverlay with shadcn Card

**Slice:** S04 — Voting Overlay + Toasts
**Milestone:** M002

## Description

The `VotingOverlay` is the most prominent room UI element. It currently uses manual glassmorphism with broken `banana-` tokens. This task rebuilds it using shadcn `Card` primitives and semantic tokens.

## Steps

1. Import `Card`, `CardContent` from `src/components/ui/card`.
2. Replace the card selection button loop with `Card` components.
3. Update the layout to use semantic tokens (`bg-card`, `text-card-foreground`).
4. Apply `ring-2 ring-primary` to the selected card.
5. Remove all `banana-` and `dark-900` tokens.
6. Ensure the "Skip Vote" button also uses the shadcn `Button` primitive (if not already done).
7. Preserve existing `framer-motion` animations for the overlay and cards.

## Must-Haves

- [ ] Rebuilt UI uses shadcn `Card`.
- [ ] No `banana-` tokens in `VotingOverlay.jsx`.
- [ ] Selection state is visually distinct using `primary` color.

## Verification

- Manual UAT:
    - Start a vote.
    - Verify cards are styled correctly.
    - Verify selection ring is blue (primary).
    - Check dark mode compatibility.

## Observability Impact

- Signals added/changed: None.
- How a future agent inspects this: Check `VotingOverlay.jsx` for `Card` imports.
- Failure state exposed: None.

## Inputs

- `T01` — `card` primitive available.
- `client/src/components/Voting/VotingOverlay.jsx` — Existing implementation.

## Expected Output

- `client/src/components/Voting/VotingOverlay.jsx` — Fully modernized using shadcn.
