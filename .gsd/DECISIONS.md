# Decisions

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| ID | When | Scope | Decision | Choice | Rationale | Revisable? |
|----|------|-------|----------|--------|-----------|------------|
| D001 | M001 | convention | Default voting scale | Modified Fibonacci | Requested User Stories | No |
| D002 | M001 | arch | Tasks UI pattern | Right-side expandable pane | Better session tracking without cluttering main UI | No |
| D003 | M001 | scope | Spectator role | Retain as-is | Existing logic fits requirements perfectly | No |
| D004 | M001/S03 | convention | Average calculation | Arithmetic mean, exclude non-numeric | VOTE-02 requires numeric average; ☕ and ? are non-numeric | No |
| D005 | M001/S03 | arch | Voting scale locking | Lock during active round | Prevents session inconsistency and anchoring | Yes — if per-user scale becomes a requirement |
| D006 | M001/S04 | convention | Task pane state | Persist isTasksOpen in localStorage per room | Improves UX on refresh | Yes |
| D007 | M001/S04 | convention | Active task on reset | Auto-clear if completed | Streamlines transition to next task | Yes |
| D008 | M001/S04 | arch | Task CRUD access | Host-only | Session integrity — prevents conflicting task management | Yes — if collaborative editing becomes a requirement |
| D009 | M002 | arch | shadcn theme | claude blu 2 (blue-indigo OKLCH, Inter font) | User selected; replaces broken banana-* orange tokens | No |
| D010 | M002 | arch | Room UI design system | shadcn/ui via shadcn init in client/ | User requirement; provides accessible primitives and consistent tokens | No |
| D011 | M002 | scope | Landing page isolation | Zero changes to src/components/home/ and src/pages/Landing.jsx | User requirement; landing uses a distinct custom design system | No |
| D012 | M002 | arch | VotingOverlay migration | Full shadcn Card rebuild | User preference; eliminates broken tokens on most prominent room surface | No |
| D013 | M002 | arch | PokerTable surface | Keep custom glassmorphism CSS | User preference; unique visual element; only fix tokens inside it | Yes — if full design system unification is requested |
| D014 | M002 | convention | cn() location | src/lib/utils.ts | shadcn canonical path; all generated components import from here | No |
