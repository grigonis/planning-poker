# Planning Poker Refactoring

## Goal
Completely refactor the room creation and joining experience to match a modern, dedicated-page approach (similar to Kollabe). The landing page should remain strictly a landing page, while `/create` will serve as the dedicated room creation environment featuring the app's navbar and layout.

## Requirements

### Validated
*(Capabilities carried over from the existing codebase)*
- ✓ Real-time voting sync via Socket.io
- ✓ Displaying connected users in a room
- ✓ Revealing votes to all players simultaneously
- ✓ Basic room state management
- ✓ Spectator mode (retain logic and naming exactly as is)

### Active (New/Changed)
- [ ] **Dedicated Create Room Page (`/create`)**:
  - Replaces the current modal dialog. Loads the playing room environment with a modernized navbar.
  - Options: Display Name, Voting System selector.
- [ ] **Voting Systems & Scales**:
  - Default: Modified Fibonacci `[0, 0.5, 1, 2, 3, 5, 8, 13, 21, ☕]`.
  - Presets: Standard Fibonacci, T-Shirt Sizing, Powers of 2.
  - Custom: Input mechanism (comma-separated/builder) supporting numbers, text, emojis, and optional item descriptions.
  - Averages calculation must exclude non-numeric cards (like ☕).
  - Changing scale mid-vote prompts a warning or reset.
- [ ] **Tasks Feature**:
  - Right-side expandable/collapsible pane in the room.
  - Voting without tasks is still supported.
  - Add tasks manually (one-click) or in bulk.
- [ ] **Modernize UI & Settings**:
  - Update Navbar features inspired by Kollabe.
  - Integrate new Room Settings based on provided design references for current functionality.
- [ ] **Remove Split Mode**:
  - Strip out split mode logic, labels, and average calculation differences entirely.
- [ ] **Robust Testing**:
  - Create new automation tests to cover all introduced workflows.

### Out of Scope
- Spectator logic changes (Spectator already exists and fits the needs perfectly).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Voting Systems | Requested User Stories | — Modified Fibonacci Default, Support Customs |
| Tasks system | requested feature for better session tracking | — Right-side expandable pane |
| Spectator role | Already implemented | — Keep as is |

---
*Last updated: 2026-03-10*
