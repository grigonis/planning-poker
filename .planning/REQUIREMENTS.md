# Requirements

## Core Value
A modernized, intuitive Planning Poker experience with specific features for custom voting scales, streamlined task management, and dedicated room creation flows (replacing archaic split modes and modals).

## v1 Requirements

### Architecture (ARCH)
- [ ] **ARCH-01**: Room creation triggers via dedicated `/create` page instead of a modal.
- [ ] **ARCH-02**: Landing page (`/`) serves exclusively as a marketing/entry index.
- [ ] **ARCH-03**: Remove all legacy "split mode" averages and logic from backend and frontend.
- [ ] **ARCH-04**: Navbar is modernized with additional options mirroring Kollabe functionality.

### Voting Scales (VOTE)
- [ ] **VOTE-01**: Default voting scale is Modified Fibonacci `[0, 0.5, 1, 2, 3, 5, 8, 13, 21, ☕]`.
- [ ] **VOTE-02**: Non-numeric cards (e.g., ☕) must be excluded from average calculations.
- [ ] **VOTE-03**: Facilitators can switch between Standard Presets (Fibonacci, T-Shirt, Powers of 2).
- [ ] **VOTE-04**: Facilitators can create Custom Scales (numbers, letters, emojis) during setup.
- [ ] **VOTE-05**: Changing a scale mid-voting is disabled or prompts a warning.

### Room Experience & Tasks (TASK)
- [ ] **TASK-01**: Right-side expandable/collapsible pane for managing tasks.
- [ ] **TASK-02**: Users can vote strictly without tasks if they choose (legacy flow).
- [ ] **TASK-03**: Facilitators can add a single task manually from the side pane.
- [ ] **TASK-04**: Facilitators can add multiple tasks bulk-action style.
- [ ] **TASK-05**: Modernized UI Settings menu (tailored to current app UI) for room configuration.
- [ ] **TASK-06**: Spectator role retained exactly as is (can observe without participating).

## v2 Requirements (Deferred)
- [ ] VOTE-06: Save custom voting scales to a team profile/workspace for future reuse.

## Out of Scope
- Changes to the Spectator logic mechanism. Existing behavior is retained exactly.

## Traceability
*(To be populated by Roadmap)*
