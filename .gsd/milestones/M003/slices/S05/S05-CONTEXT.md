---
id: S05
milestone: M003
status: ready
---

# S05: Integration & Polish — Context

<!-- Slice-scoped context. Milestone-only sections (acceptance criteria, completion class,
     milestone sequence) do not belong here — those live in the milestone context. -->

## Goal

Finalize the room UX restructure by integrating all components, adding polish (animations), and verifying the end-to-end flow with no regressions.

## Why this Slice

It's the final integration point for M003. It ensures that the separate pieces built in S01-S04 work harmoniously and the "polish" (branding, transitions) meets the quality bar. It retires the final risks around layout conflicts and responsive behavior.

## Scope

### In Scope

- **End-to-End Flow**: Verification of full voting lifecycle (create room -> join -> vote -> reveal) with all new UI elements.
- **Animated Reordering**: Implement animated row reordering in the `ParticipantPanel` for the reveal phase (highest-to-lowest).
- **Silent Updates**: Ensure host updates to room details and customized cards broadcast silently to participants without intrusive notifications.
- **Layout Integrity**: Participant panel should overlap the poker table if the viewport is too narrow, rather than squeezing the table geometry.
- **Regression Testing**: Visual smoke tests for emoji reactions, tasks pane, and landing page.

### Out of Scope

- **Mobile Participant Access**: No way to view the participant list below 768px (strictly hidden).
- **Host Notification System**: No toasts or alerts for room setting changes; updates are purely visual.
- **Landing Page Modifications**: Explicitly out of scope per D011.

## Constraints

- **Branding Consistency**: All "BananaPoker" references must be gone from room-facing UI.
- **LocalStorage Prefix**: All persistent room state must use `keystimate_` prefix.
- **Table Geometry**: The elliptical poker table layout is sacred; avoid shrinking it to accommodate side panels.

## Integration Points

### Consumes

- `Room.jsx` — Main state orchestrator.
- `RoomNavbar.jsx` — Branding and host menu.
- `ParticipantPanel.jsx` — Participant status and reveal ordering.
- `EditRoomDetailsDialog.jsx` — Host edits for room name/description.
- `CustomizeCardsDialog.jsx` — Host edits for card deck.
- `SettingsDialog.jsx` — Room-wide toggles.

### Produces

- **Verified Room Flow** — Guaranteed end-to-end functionality.
- **Polished Participant List** — Animated reordering and grouped dividers.
- **Final Milestone Summary** — Rolling up all slice contributions for M003.

## Open Questions

- **Framer Motion Installation** — The requirement for "Animated reordering" likely requires adding `framer-motion` to the project dependencies. This will be addressed during the planning phase.
