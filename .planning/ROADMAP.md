# Roadmap

## Proposed Roadmap

**4 phases** | **15 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation Refactoring | Establish dedicated room creation, separate from landing | ARCH-01, ARCH-02, ARCH-03 | 3 |
| 2 | Modernized Navbar & Room UI | Update layout to match Kollabe-style Navbar and Settings | ARCH-04, TASK-05, TASK-06 | 3 |
| 3 | Voting Scales Implementation | Support default Fibonacci, presets, and custom scales | VOTE-01, VOTE-02, VOTE-03, VOTE-04, VOTE-05 | 4 |
| 4 | Tasks Pane | Implement right-side pane for single/bulk task management | TASK-01, TASK-02, TASK-03, TASK-04 | 3 |

### Phase Details

**Phase 1: Foundation Refactoring**
Goal: Establish dedicated room creation, separate from landing
Requirements: ARCH-01, ARCH-02, ARCH-03
Success criteria:
1. Navigating to `/create` loads the room app environment.
2. Modal dialog is completely removed from the landing page.
3. Split mode logic, averages, and UI are completely removed.

**Phase 2: Modernized Navbar & Room UI**
Goal: Update layout to match Kollabe-style Navbar and Settings
Requirements: ARCH-04, TASK-05, TASK-06
Success criteria:
1. Navbar includes new features matching the referenced modern UI.
2. Room Settings menu allows configuring the room.
3. Spectators can join and observe without affecting active voting averages.

**Phase 3: Voting Scales Implementation**
Goal: Support default Fibonacci, presets, and custom scales
Requirements: VOTE-01, VOTE-02, VOTE-03, VOTE-04, VOTE-05
Success criteria:
1. Room defaults to Modified Fibonacci.
2. Coffee cup `☕` and other non-numeric cards do not break or skew the average string/number.
3. Facilitator can select alternative presets (T-Shirt, Powers of 2).
4. Facilitator can input custom scales with letters and emojis.

**Phase 4: Tasks Pane**
Goal: Implement right-side pane for single/bulk task management
Requirements: TASK-01, TASK-02, TASK-03, TASK-04
Success criteria:
1. Right-side pane opens and collapses successfully.
2. Users can vote without any tasks created.
3. Facilitator can manually add tasks or bulk-add multiple tasks.
