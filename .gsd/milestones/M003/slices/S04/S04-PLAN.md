# S04: Participant Panel

**Goal:** Build a collapsible left-side participant panel that shows all room participants with their avatar, name, voting status (idle/voted/spectator), and — after reveal — their vote values reordered highest-to-lowest with group dividers. Hidden below 768px (md breakpoint). Never overlaps the poker table. Collapsed by default.
**Demo:** On md+ screens, a translucent panel sits fixed on the left side, collapsed to a narrow icon strip by default. Clicking the toggle expands it to ~240px showing all participants. During voting, each participant shows a ✓ or waiting indicator. After reveal, participants reorder: numeric voters (highest→lowest) then non-numeric (☕, ?) then spectators, with a divider between groups. Each participant shows their actual vote value after reveal.

## Must-Haves

- `ParticipantPanel.jsx` component with collapsed (icon strip ~48px) and expanded (~240px) states
- Toggle button to expand/collapse
- Hidden entirely on screens below 768px (`hidden md:block` or `hidden md:flex`)
- Never overlaps the poker table — uses `position: fixed` left-side with appropriate top/left offsets
- Shows all users from the `users` array passed from Room.jsx
- Shows avatar (using PlayerAvatar or a small variant), name, role badge
- Voting status: checkmark icon when voted, waiting dots or clock icon when hasn't voted, crown for host, SPECTATOR badge for spectators
- After reveal (phase === 'REVEALED'): reorders users highest-to-lowest with group dividers:
  - Group 1: numeric voters (sorted by vote value desc)
  - Group 2: non-numeric voters (☕, ?, etc.)
  - Group 3: spectators
  - Vote value shown on each numeric/non-numeric voter row
- Collapsed state persists in localStorage (`keystimate_panel_open_${roomId}`)
- Panel is transparent/glassmorphic matching the room design language
- `anonymousMode` prop: when true, hide vote values even after reveal (same semantics as PokerTable)

## Proof Level

- This slice proves: integration
- Real runtime required: yes — panel must show live user list from socket events
- Human/UAT required: no — structural + runtime verification confirms layout and behavior

## Verification

- `rg "ParticipantPanel" client/src/components/Room/ParticipantPanel.jsx` → file exists
- `rg "ParticipantPanel" client/src/pages/Room.jsx` → imported and rendered
- `rg "REVEALED\|phase" client/src/components/Room/ParticipantPanel.jsx` → reveal reordering logic present
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors
- `git diff --name-only | grep -c "home/\|Landing.jsx"` → 0
- Browser: panel visible on desktop, hidden on mobile viewport, toggle expand/collapse works, voting status updates, reveal reorders participants

## Observability / Diagnostics

- Runtime signals: Panel visible/hidden state persisted in localStorage — check `keystimate_panel_open_*` key
- Inspection surfaces: React DevTools — `ParticipantPanel` props show `users`, `votes`, `phase`
- Failure visibility: If panel overlaps poker table, visible immediately at md breakpoint. If users don't show, check `users` prop from Room.jsx
- Redaction constraints: When `anonymousMode=true`, do not show vote values (same as PokerTable)

## Integration Closure

- Upstream surfaces consumed: `Room.jsx` — `users`, `votes`, `phase`, `currentUser`, `anonymousMode` state; `PlayerAvatar.jsx` for avatar rendering
- New wiring introduced: `ParticipantPanel` rendered in Room.jsx alongside PokerTable; receives live state
- What remains: S05 (Integration & Polish — remove dead code, final e2e verification)

## Tasks

- [x] **T01: Build ParticipantPanel component** `est:1.5h`
  - Why: The entire S04 goal — all the panel UI and logic lives here
  - Files: `client/src/components/Room/ParticipantPanel.jsx` (new), `client/src/pages/Room.jsx`
  - Do:
    1. Create `ParticipantPanel.jsx`. Props: `users`, `votes`, `phase`, `currentUser`, `roomId`, `anonymousMode`.
    2. Local state: `isExpanded` (boolean, default false). Initialize from `localStorage.getItem('keystimate_panel_open_' + roomId) === 'true'` on mount. Persist to localStorage on toggle.
    3. Layout: `position: fixed; left: 0; top: [navbar-height]; bottom: 0; z-index: 30`. Width: `w-12` (collapsed) or `w-60` (expanded). `hidden md:flex` to hide below 768px. `flex-col` with `transition-all duration-200`.
    4. Toggle button at top of panel: chevron icon, flips direction with expand state.
    5. User list: map over the ordered user array (see step 6). Each row: small avatar (size 32), name (truncated, hidden when collapsed), status icon, vote value (after reveal, hidden when collapsed).
    6. Ordering logic (computed when phase === 'REVEALED'):
       - Determine if a vote value is numeric: `!isNaN(Number(val))` (handles "0", "0.5", numbers)
       - Group A: users who voted with numeric values → sort by value desc
       - Group B: users who voted with non-numeric values (☕, ?, etc.)
       - Group C: spectators (role === 'SPECTATOR') and users who didn't vote
       - In non-REVEALED phases: maintain original order from `users` array
    7. Group dividers: small label ("Voters" / "Non-Numeric" / "Spectators") shown when expanded, only when phase=REVEALED and the group is non-empty.
    8. Status indicators (when not REVEALED):
       - Voted: `✓` green checkmark
       - Not voted + DEV role: waiting dots or clock icon (muted)
       - SPECTATOR: eye icon
    9. After REVEALED: show vote value badge on each row. `anonymousMode` → show `?` instead.
    10. Style: `bg-white/60 dark:bg-black/40 backdrop-blur-md border-r border-white/10` — glassy, matches room aesthetic. Panel should NOT cast a shadow onto the poker table area.
    11. In `Room.jsx`: import and render `<ParticipantPanel>` as a sibling to the `<main>` element (not inside it), passing `users`, `votes`, `phase`, `currentUser`, `roomId`, `anonymousMode`.
  - Verify: Build passes. Browser at desktop width: panel visible on left, collapsed by default, expands on click. At mobile (<768px): panel hidden. After reveal: users reorder.
  - Done when: Panel renders, toggle works, all three viewport/state conditions verified in browser.

## Files Likely Touched

- `client/src/components/Room/ParticipantPanel.jsx` (new)
- `client/src/pages/Room.jsx`
