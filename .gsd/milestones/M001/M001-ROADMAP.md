# M001: Migration

**Vision:** Modernize the room creation flow, UI, and voting system to provide a premium, flexible Planning Poker experience.

## Success Criteria
- [x] Dedicated `/create` page functional
- [x] Modernized Navbar and Settings UI implemented
- [ ] Voting scales (Fibonacci, Presets, Custom) functional
- [ ] Tasks pane for session management implemented

## Slices

- [x] **S01: Foundation Refactoring** `risk:medium` `depends:[]`
  > After this: Room creation moved to `/create`, legacy split mode removed.
- [x] **S02: Modernized Navbar Room UI** `risk:medium` `depends:[S01]`
  > After this: Layout matches modern design, Spectator role preserved.
- [x] **S03: Voting Scales Implementation** `risk:medium` `depends:[S02]`
  > After this: Support for Fibonacci, presets, and custom scales with correct averaging.
- [ ] **S04: Tasks Pane** `risk:medium` `depends:[S03]`
  > After this: Right-side pane for single/bulk task management.
