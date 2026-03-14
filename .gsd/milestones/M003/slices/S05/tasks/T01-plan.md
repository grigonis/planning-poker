# T01: Animation Setup & Dependencies

**Slice:** S05
**Milestone:** M003

## Goal
Install `framer-motion` and prepare `ParticipantPanel.jsx` for layout animations.

## Must-Haves

### Truths
- `framer-motion` is present in `package.json` dependencies.
- `ParticipantPanel.jsx` imports `motion` and `AnimatePresence` from `framer-motion`.

### Artifacts
- `package.json` updated with `framer-motion`.

### Key Links
- `ParticipantPanel.jsx` -> `framer-motion` via import.

## Steps
1. Install `framer-motion` using `npm install framer-motion`.
2. Open `client/src/components/Room/ParticipantPanel.jsx`.
3. Add imports for `motion` and `AnimatePresence`.
4. Wrap the user rows container with `AnimatePresence` if needed (though `layout` on individual rows might be sufficient for reordering).

## Context
- The user confirmed "Animated reordering (e.g., Framer Motion)" in the discussion phase.
- Reordering happens during the `REVEALED` phase based on the `orderedGroups` memo.
