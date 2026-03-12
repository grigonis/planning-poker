# S04: Voting Overlay + Toasts — UAT

**Milestone:** M002
**Written:** 2026-03-12

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: The changes affect the visual interactive layer (cards, toasts) which must be verified in a real browser to ensure tokens resolve and animations are smooth.

## Preconditions

- Server is running (`npm run dev:all`).
- Browser navigated to `http://localhost:5173`.
- A room has been created or joined.

## Smoke Test

Open the voting overlay by clicking on the table. Verify that the cards appear with a subtle blue border/background and the "Skip Vote" button is the primary blue.

## Test Cases

### 1. Toast Notification

1. Go to the "Create Room" page.
2. Select "Custom" scale but leave the input empty.
3. Click "Create Room".
4. **Expected:** A blue error toast appears at the top center saying "Please provide at least one value for the custom scale".

### 2. Voting Overlay Rebuild

1. In a live room, start a voting round.
2. Click the table to open the Voting Overlay.
3. Select a card (e.g., '5').
4. **Expected:** The selected card has a thick blue ring (`ring-primary`) and a blue background. The transition is animated.

### 3. Revealed Card Styling

1. After everyone has voted (or you skip), reveal the cards.
2. Observe the cards on the table.
3. **Expected:** Revealed cards show the value with a blue border and use `bg-card` (white in light mode, dark blue in dark mode).

## Edge Cases

### Theme Switching

1. Open the Voting Overlay.
2. Toggle between Light and Dark mode using the theme toggle.
3. **Expected:** Card backgrounds and text colors update instantly to match the theme tokens (`bg-card`, `text-card-foreground`).

## Failure Signals

- Red `banana-` tokens appearing as unstyled text or transparent backgrounds.
- Blocking browser `alert()` dialogs appearing instead of toasts.
- Cards in the overlay missing the primary blue selection ring.

## Requirements Proved By This UAT

- R103 — Zero banana-* tokens visible in the voting UI.
- R109 — Toasts appear for error conditions instead of browser alerts.
- R110 — VotingOverlay uses Card primitives and responds to selection.
- R111 — Revealed cards use semantic tokens.

## Not Proven By This UAT

- Automated build success (handled by CI/Contract check).
- Navbar unification (handled in S05).

## Notes for Tester

The cards in the Voting Overlay have a slight scale-up animation on hover, which is preserved from the original design but now uses shadcn Card structure.
