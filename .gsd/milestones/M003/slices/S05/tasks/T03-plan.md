# T03: End-to-End Integration Verification

**Slice:** S05
**Milestone:** M003

## Goal
Perform a full walk-through of the room flow, testing host edits, card customization, and real-time broadcasts.

## Must-Haves

### Truths
- Host edits room name/description -> Participants see it updated in navbar.
- Host customizes cards -> Participants see new card values in VotingOverlay.
- Host toggles settings (e.g., anonymous mode) -> Participants see effects (e.g., votes hidden/revealed).
- Voting lifecycle (start -> vote -> reveal -> reset) works perfectly across all new UI components.
- Participant panel reflects correct voting status in real-time.

### Artifacts
- None (verification task).

### Key Links
- `RoomNavbar` -> `EditRoomDetailsDialog`.
- `Room` state -> `CustomizeCardsDialog`.
- `ParticipantPanel` -> `room.phase` and `room.votes`.

## Steps
1. Launch the dev server and open two browser windows (Host and Participant).
2. Host: Create a room and edit details (name/description). Verify Participant sees it.
3. Host: Customize card values (add/remove). Verify Participant's card deck updates.
4. Both: Participate in a voting round. Verify `ParticipantPanel` shows status (voted/voting).
5. Host: Reveal votes. Verify reordering animation in `ParticipantPanel`.
6. Host: Reset room. Verify all UI returns to IDLE state.

## Context
- This task validates that all slices (S01-S04) integrate correctly.
- Silent updates are a requirement confirmed in the discussion phase.
