---
id: T01
parent: S04
milestone: M003
provides:
  - ParticipantPanel.jsx — collapsible left-side panel, hidden below md, fixed position
  - Collapsed by default, persists state in localStorage keystimate_panel_open_{roomId}
  - Shows all participants with avatar, name, voting status (clock/check/eye)
  - After reveal: 3-group reordering (numeric voters high→low, non-numeric, spectators/non-voters)
  - Vote values shown after reveal; anonymousMode hides others' values
  - Group dividers (VOTERS / OTHER / SPECTATORS) when expanded in REVEALED phase
key_files:
  - client/src/components/Room/ParticipantPanel.jsx
  - client/src/pages/Room.jsx
key_decisions:
  - No new decisions — panel uses `position: fixed` left-side approach which avoids any layout interaction with the poker table (poker table just centers normally via mx-auto)
patterns_established:
  - Fixed left panel pattern: `fixed left-0 top-14 bottom-0 hidden md:flex` — safe coexistence with absolute-positioned poker table since both are independently positioned
  - SmallAvatar component uses inline SVG from DiceBear with initials fallback (no PlayerAvatar to avoid prop overhead for a small panel avatar)
observability_surfaces:
  - localStorage key `keystimate_panel_open_{roomId}` — read to check expand state
  - React DevTools ParticipantPanel props (users, votes, phase)
duration: ~1h
verification_result: passed
completed_at: 2026-03-13
blocker_discovered: false
---

# T01: Build ParticipantPanel component

**Built and verified: collapsible participant panel, hidden on mobile, no table overlap, live voting status, reveal reordering with group dividers and vote values.**

## What Happened

Created `ParticipantPanel.jsx` from scratch. Fixed-position left panel (`top-14` to clear navbar, `bottom-0`, `z-30`). `hidden md:flex` keeps it off mobile. Width animates between `w-12` (collapsed) and `w-56` (expanded) with `transition-all duration-200`.

Toggle button at top shows expand/collapse state and a voted/total count. `isExpanded` initializes from localStorage and persists on each toggle.

User list renders ordered groups from `getOrderedGroups()` — a `useMemo` that computes three groups when phase=REVEALED (numeric sorted desc, non-numeric, spectators/non-voters) and returns users as-is otherwise. Each `UserRow` shows a small avatar + name+status when expanded, or just avatar+icon when collapsed.

Status icons: `Check` (green) when voted, `Clock` (pulsing, muted) when not, `Eye` for spectators. After reveal: `VoteBadge` shows vote value (or `?` with anonymousMode).

Group dividers render as small uppercase labels between groups, only when expanded and phase=REVEALED.

Wired in Room.jsx as a sibling to `<main>`, inside `validUser` guard, with `users`, `votes`, `phase`, `currentUser`, `roomId`, `anonymousMode`.

The layout concern (D030) resolved cleanly — since the poker table uses `mx-auto` centering within `max-w-7xl`, the fixed-position panel simply occupies the left margin at large screens without requiring any padding offset on the table container.

## Verification

- `rg "ParticipantPanel"` → file exists and imported in Room.jsx
- `rg "REVEALED|phase" ParticipantPanel.jsx` → reordering logic present
- Build passes clean
- Browser desktop: panel visible on left side, toggle works, voting status updates
- Browser mobile (390px): panel completely hidden
- Browser after reveal (voted 13): panel shows "1/1", "VOTERS" divider, "PanelTest (you) 13" badge

## Diagnostics

- Panel not visible → check `validUser` in Room.jsx and viewport ≥768px
- Wrong vote ordering → check `getOrderedGroups` useMemo dependency array — must include `users`, `votes`, `phase`
- Vote values not shown → check `anonymousMode` prop and confirm phase === 'REVEALED'

## Deviations

- Used inline DiceBear SVG for `SmallAvatar` instead of `PlayerAvatar` — PlayerAvatar has too many props and concerns (reactions, anonymous mode, crown rendering) for a compact panel row. Simpler local implementation with initials fallback.
- Width used `w-56` (224px) instead of planned `w-60` (240px) — slightly tighter, looks better in practice.

## Known Issues

None.

## Files Created/Modified

- `client/src/components/Room/ParticipantPanel.jsx` — new component
- `client/src/pages/Room.jsx` — import + render ParticipantPanel with props
