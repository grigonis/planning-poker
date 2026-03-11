# S03: Voting Scales Implementation

**Goal:** Support default Fibonacci, presets, and custom scales with accurate averaging.
**Demo:** Facilitator changes scales; non-numeric cards like ☕ are excluded from averages.

## Must-Haves
- Default scale: Modified Fibonacci
- Preset options (T-Shirt, Powers of 2)
- Custom scale input
- Average calculation excluding non-numeric values

## Tasks
- [ ] Implement Modified Fibonacci default scale logic
- [ ] Update average calculation to exclude non-numeric cards (e.g., ☕)
- [ ] Add preset selection UI for Facilitators
- [ ] Implement custom scale input (comma-separated or builder)
- [ ] Add warning/reset when changing scales mid-vote
- [ ] Verify persistence of selected scale within a session

## Files Likely Touched
- client/src/pages/CreateRoom.jsx
- client/src/pages/Room.jsx
- server/handlers/voteHandlers.js
- server/handlers/roomHandlers.js
