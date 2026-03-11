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

### Validated
- ✓ **Dedicated Create Room Page (`/create`)**: Replaces modal with a full-page setup.
- ✓ **Voting Systems & Scales**: Support for Modified Fibonacci, Presets, and Custom scales.
- ✓ **Tasks Feature**: Right-side pane for single/bulk task management.
- ✓ **Modernized UI**: Updated Navbar and Settings menu.
- ✓ **Average Logic**: Excludes non-numeric cards (☕).
- ✓ **Split Mode Removal**: Legacy split-mode logic completely purged.

### Out of Scope
- Spectator logic changes (Spectator already exists and fits the needs perfectly).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Voting Systems | Requested User Stories | — Modified Fibonacci Default, Support Customs |
| Tasks system | requested feature for better session tracking | — Right-side expandable pane |
| Spectator role | Already implemented | — Keep as is |

---
*Last updated: 2026-03-11*
