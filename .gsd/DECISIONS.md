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
| D022 | M002/S03 | arch | TasksPane side-panel | Rebuild with shadcn Sheet | Standardizes side-panel behavior and gains accessibility (focus trap, ARIA) while maintaining the right-side drawer pattern | No |
| D023 | M002/S03 | convention | Role selection | ToggleGroup for all role pickers | Eliminates manual button-state logic and provides accessible toggle semantics | No |
| D024 | M002/S04 | arch | Toast provider | sonner | Modern, rich colors, easy integration with shadcn | No |
| D025 | M002/S04 | convention | Notification placement | Top-center | Standardized placement for all room-facing toasts | Yes |
| D026 | M002/S05 | arch | Navbar unification strategy | Shared `RoomNavbar` with `minimal` prop | Toggles between create-room (branding only) and active-room (full controls) modes | No |
| D027 | M002/S05 | arch | Progress bar styling | shadcn `Progress` component | Replaces custom gradient div; uses theme-aware `primary` indicator | No |
| D028 | M003 | scope | Voting system locking | Lock system type after room creation | Prevents mid-session confusion; only card values customizable in-room | No |
| D029 | M003 | arch | Settings UI split | Three separate dialogs via DropdownMenu | Edit Room Details, Customize Cards, Settings — replaces monolithic RoomSettingsModal | No |
| D030 | M003 | arch | Participant panel position | Left-side floating overlay, never overlaps table | Float/overlay approach; hidden below 768px; collapsed by default | Yes — if layout conflicts arise |
| D031 | M003 | convention | Participant panel reveal ordering | Highest-to-lowest with group dividers | Three groups: numeric voters, non-numeric (☕/?), spectators. Non-numeric pushed to bottom | No |
| D032 | M003 | convention | Card customization limits | Min 2, max 12 cards | User-specified bounds; prevents broken/absurd decks | No |
| D033 | M003 | convention | Room details broadcast | Live via Socket.io room_settings_updated | Room name/description stored server-side, broadcast on change | No |
| D034 | M003 | convention | Branding | Keystimate | Replaces BananaPoker in all room-facing UI; landing page untouched (D011) | No |
| D035 | M003 | convention | localStorage key prefix | keystimate_ | Replaces banana_ prefix; banana-poker-theme → keystimate-theme | No |
| D036 | M003/S02 | arch | Dialog-from-DropdownMenu pattern | State-driven dialogs rendered outside DropdownMenu tree | Radix DropdownMenu and Dialog share focus/portal internals; nesting Dialog inside DropdownMenuItem causes focus trap conflicts. Menu items set state flags, dialogs render as siblings in Room.jsx. | No |
| D037 | M003/S02 | convention | Customize Cards placeholder | Minimal placeholder dialog in S02, replaced by real implementation in S03 | S02 needs a working "Customize Cards" menu item per roadmap boundary map; building a placeholder keeps the dropdown complete while deferring interactive card editing to S03 | Yes — replaced in S03 |
| D038 | M003/S02/T03 | arch | DropdownMenuTrigger must use plain `<button>` not shadcn Button | shadcn Button does not use React.forwardRef; Radix DropdownMenuTrigger uses asChild + Slot.Root which needs a ref-forwarding child to measure trigger position for portal placement. Without forwardRef, the portal transform stays at translate(0,-200%) and the menu renders above the viewport. Fix: replace Button with a raw `<button>` inside DropdownMenuTrigger. | No |
