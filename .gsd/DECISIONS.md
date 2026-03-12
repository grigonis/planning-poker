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
| D015 | M002/S01 | convention | CSS variable format | Bare OKLCH channel values (e.g. `0.55 0.15 252`) | Tailwind v3 `oklch(var(--X) / <alpha-value>)` wrapper requires bare channels; wrapping in oklch() in the CSS var produces double-nested invalid CSS | No |
| D016 | M002/S01 | convention | Inter font loading | Google Fonts `<link>` in index.html | Landing page already uses this pattern for Outfit/Poppins; avoids adding runtime npm dep (@fontsource-variable/inter) | Yes — can switch to npm package if offline support needed |
| D017 | M002/S01 | arch | body rule in @layer base | Replace existing `bg-slate-50 dark:bg-carbon-950` body rule with `bg-background text-foreground` | shadcn body rule must win for room pages; landing page background handled by page-level wrappers; single body rule is cleaner | Yes — if landing page background regresses |
| D018 | M002/S01 | arch | shadcn init preset | nova (lucide-react icons) | `lucide-react` already installed; nova is the only preset compatible with existing icon library; maia installs conflicting hugeicons packages | No |
| D019 | M002/S02 | convention | Modal accessibility titles | DialogTitle with sr-only for purely visual modals | Ensures screen readers can identify the modal's purpose without cluttering the visual design | Yes |
| D020 | M002/S02 | arch | JoinSessionModal migration | Rebuild using shadcn Dialog | Consistency with room modals; ensures a unified joining experience from landing to room | No |
| D021 | M002/S02 | convention | Destructive actions in modals | Use AlertDialog for Danger Zone actions inside RoomSettingsModal | Provides a standard, high-friction confirmation for irreversible actions | No |
