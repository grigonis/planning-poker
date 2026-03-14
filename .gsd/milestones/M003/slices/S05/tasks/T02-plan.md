# T02: Implement Animated Reordering

**Slice:** S05
**Milestone:** M003

## Goal
Update `ParticipantPanel` to use `framer-motion` for smooth row reordering during the REVEALED phase.

## Must-Haves

### Truths
- Rows in the participant panel smoothly glide to their new positions when the phase changes to `REVEALED`.
- Group headers (if any) also participate in the layout transition.

### Artifacts
- `client/src/components/Room/ParticipantPanel.jsx` updated with `motion` components.

### Key Links
- `UserRow` component uses `motion.div` with the `layout` prop.

## Steps
1. In `ParticipantPanel.jsx`, convert the user row containers to `motion.div`.
2. Apply the `layout` prop to the row containers.
3. Ensure each row has a stable `key` (which is already `user.id`).
4. (Optional) Apply `layout` to the group header labels as well.
5. Verify reordering by triggering a reveal in the UI.

## Context
- Reordering is driven by the `orderedGroups` useMemo, which sorts users highest-to-lowest when `phase === 'REVEALED'`.
- `framer-motion`'s `layout` prop automatically handles the FLIP animation for position changes.
