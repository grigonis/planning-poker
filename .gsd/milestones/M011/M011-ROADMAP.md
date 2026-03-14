# M011: UX Overhaul & Interaction Polish

**Vision:** Transform the room experience from "feature-complete" to "feels intentional" — every interaction gives clear feedback, the participant panel tells a story through the voting lifecycle, and the host has precise control.

## Success Criteria

- Participant panel groups users by lifecycle state with icons (Waiting → Voting → Voted → checkmark on reveal, Skipped section, Spectating always at bottom)
- On reveal with groups enabled, participants regroup by team name (QA, DEV, etc.)
- Reset returns panel to "Waiting" state
- Post-reveal shows "Next round" + "Revote" as smaller buttons with icons
- When tasks are queued, voting auto-advances to the next pending task
- Table avatars don't animate on hover for current user
- No "Planning Poker" text on the table idle state
- Invite copy closes dialog + shows toast
- Settings menu hover text is always readable
- Host can click a user in the left panel to kick them; kicked user sees a message and goes to dashboard
- Sidebar collapse/expand doesn't warp avatars
- All inputs are one size increment larger
- User dropdown has spectator toggle (clears vote if mid-round) and screen sharing toggle (shows keyboard controls hint)
- Keyboard shortcuts button removed from navbar standalone

## Key Risks / Unknowns

- Spectator toggle mid-round vote clearing requires coordinated client+server change — risk:medium
- Kick functionality is a new server event with authorization checks — risk:medium
- Task auto-advance touches the reset flow — risk:low

## Proof Strategy

- Spectator toggle mid-round → retire in S01 by proving vote is cleared server-side and user moves to Spectating group
- Kick functionality → retire in S02 by proving kicked user navigates to dashboard with message

## Verification Classes

- Contract verification: visual browser verification of all 11 changes
- Integration verification: kick event, spectator toggle, task auto-advance across socket
- Operational verification: none
- UAT / human verification: visual polish check on sidebar animation, input sizes, hover states

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 4 slices are complete
- All 11 issues are addressed and visually verified
- Socket events (kick, spectator toggle, vote clear) work correctly
- Task auto-advance cycles through queued tasks
- No regressions in existing voting flow

## Slices

- [ ] **S01: Participant Panel Lifecycle & Profile Dropdown** `risk:high` `depends:[]`
  > After this: participant panel shows Waiting/Voting/Voted/Revealed/Skipped/Spectating groups with icons; group mode override works on reveal; user dropdown has spectator + screen sharing toggles; keyboard shortcuts button removed from navbar

- [ ] **S02: Host Controls — Kick, Post-Reveal Buttons, Task Auto-Advance** `risk:medium` `depends:[S01]`
  > After this: host sees Next Round + Revote post-reveal; can kick users from left panel; task-based voting auto-advances

- [ ] **S03: UI & CSS Polish** `risk:low` `depends:[]`
  > After this: avatar hover disabled on table, "Planning Poker" removed, invite auto-close + toast, settings hover fix, sidebar animation smooth, inputs larger

- [ ] **S04: Integration Verification** `risk:low` `depends:[S01,S02,S03]`
  > After this: all 11 issues verified end-to-end in browser with running server

## Boundary Map

### S01 → S02

Produces:
- Spectator toggle socket event (`toggle_spectator`) with server-side vote clearing
- Updated participant panel with lifecycle grouping (consumed by kick user flow in S02)

Consumes:
- nothing (first slice)

### S01 → S04

Produces:
- All participant panel state transitions for lifecycle verification

### S02 → S04

Produces:
- Kick socket event (`kick_user`) with dashboard redirect
- Post-reveal button changes
- Task auto-advance on reset

### S03 → S04

Produces:
- All CSS/animation/UI fixes for visual verification
