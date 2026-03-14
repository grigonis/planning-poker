# S01 Plan: Participant Panel Lifecycle & Profile Dropdown

## Tasks

- [ ] **T01: Rewrite participant panel lifecycle grouping** `est:large`
  Rewrite `getOrderedGroups` to group by lifecycle state: Waiting (clock) → Voting (vote icon) → Voted (check) → Revealed (checkmark) → Skipped → Spectating. Remove old `StatusDot` and `StatusIcon` components. Group-mode override on reveal.

- [ ] **T02: User profile dropdown — spectator & screen sharing toggles** `est:medium`
  Add spectator mode toggle to user dropdown (clears vote server-side if mid-round). Add screen sharing toggle (shows keyboard controls hint). Remove keyboard shortcuts button from navbar.

- [ ] **T03: Server-side spectator toggle & vote clearing** `est:medium`
  New `toggle_spectator` socket event: changes user role, clears existing vote, broadcasts updated users. Host-only authorization not needed (user toggles own role).
