---
estimated_steps: 11
estimated_files: 2
---

# T01: Build ParticipantPanel component

**Slice:** S04 — Participant Panel
**Milestone:** M003

## Description

Build the collapsible left-side participant panel. Fixed position, hidden below 768px, collapsed by default (collapsed state persists in localStorage). Shows all participants with avatar, name, voting status. After reveal, reorders into three groups (numeric voters high→low, non-numeric, spectators) with group dividers and vote values shown.

## Steps

1. Create `client/src/components/Room/ParticipantPanel.jsx`
   - Props: `users`, `votes`, `phase`, `currentUser`, `roomId`, `anonymousMode`

2. Local state: `isExpanded` initialized from `localStorage.getItem('keystimate_panel_open_' + roomId) === 'true'`

3. Toggle handler: flip `isExpanded`, persist to `localStorage.setItem('keystimate_panel_open_' + roomId, next)`

4. Ordered users computation (useMemo on users/votes/phase):
   - If phase !== 'REVEALED': return users as-is
   - If phase === 'REVEALED':
     - Group A: users with votes[user.id] !== undefined && !isNaN(Number(votes[user.id])) → sort by Number(votes[user.id]) desc
     - Group B: users with votes[user.id] !== undefined && isNaN(Number(votes[user.id])) (non-numeric like ☕)
     - Group C: users with role === 'SPECTATOR' || votes[user.id] === undefined
     - Return [groupA, groupB, groupC] with group metadata for dividers

5. Layout structure:
   ```
   <div className="hidden md:flex fixed left-0 top-14 bottom-0 z-30 flex-col transition-all duration-200 ...width...">
     {/* Toggle button */}
     {/* User list (scrollable) */}
   </div>
   ```
   - Width: `w-12` collapsed, `w-60` expanded
   - Background: `bg-white/70 dark:bg-black/50 backdrop-blur-md border-r border-gray-200/50 dark:border-white/10`
   - Top offset: `top-14` (matches navbar height ~56px)

6. Toggle button: small button at the top of the panel with `ChevronRight`/`ChevronLeft` icon depending on state

7. User row (when not REVEALED or REVEALED):
   - Collapsed: just a small avatar (24px)
   - Expanded: avatar (32px) + name (truncated) + status icon + vote value (if REVEALED)
   - Height per row: `h-10` with `items-center gap-2 px-2`

8. Status icons:
   - phase !== REVEALED: votes[user.id] !== undefined → green Check icon; else → `…` muted text or Clock icon
   - SPECTATOR role → Eye icon
   - isHost → Crown icon (small, inline)

9. Vote value after reveal:
   - Show `votes[user.id]` value as a small badge/pill
   - `anonymousMode` → show `?` instead (except for currentUser)
   - Non-voters in REVEALED phase: no badge

10. Group dividers (only when expanded + phase === REVEALED):
    - Small `text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1` label
    - "VOTERS", "OTHER", "SPECTATORS"
    - Only rendered if the group is non-empty

11. Wire in Room.jsx:
    - Import ParticipantPanel
    - Render outside `<main>`, as a sibling to the navbar, passing `users`, `votes`, `phase`, `currentUser`, `roomId={roomId}`, `anonymousMode`
    - Only render when `validUser` is true

## Must-Haves

- [ ] Panel is hidden below 768px
- [ ] Panel is fixed on left side, does not overlap poker table content
- [ ] Collapsed by default, persists state in localStorage
- [ ] Toggle expand/collapse works
- [ ] All participants shown with avatar and name
- [ ] Voting status visible (voted/not voted/spectator)
- [ ] Reveal phase: participants reorder into groups (numeric voters high→low, non-numeric, spectators/non-voters)
- [ ] Reveal phase: vote values shown (anonymousMode=true → "?" except self)
- [ ] Group dividers visible when expanded in REVEALED phase
- [ ] Build passes clean

## Verification

- `rg "ParticipantPanel" client/src/components/Room/ParticipantPanel.jsx` → component defined
- `rg "ParticipantPanel" client/src/pages/Room.jsx` → imported and used
- `rg "REVEALED|phase" client/src/components/Room/ParticipantPanel.jsx` → reordering logic present
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- Browser desktop: panel visible on left, collapsed, expands on toggle
- Browser mobile (≤768px): panel not visible
- Browser after reveal: participants reordered in groups

## Observability Impact

- Signals added/changed: localStorage `keystimate_panel_open_{roomId}` — agent can read this to check panel state
- How a future agent inspects this: React DevTools `ParticipantPanel` component props; localStorage key; visual panel on left side
- Failure state exposed: Panel not visible = check `hidden md:flex` and verify viewport ≥768px; wrong ordering = check useMemo dependency array; votes not shown = check anonymousMode prop and phase value

## Inputs

- Room.jsx: `users`, `votes`, `phase`, `currentUser`, `anonymousMode` — all already in Room.jsx state
- `PlayerAvatar.jsx` — available for avatar rendering (or a simplified inline variant to avoid prop overhead)
- Navbar height ~56px (top-14 = 3.5rem = 56px)

## Expected Output

- `client/src/components/Room/ParticipantPanel.jsx` — new component
- `client/src/pages/Room.jsx` — imports and renders ParticipantPanel with correct props
