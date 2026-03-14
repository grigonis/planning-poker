---
milestone: M011
title: UX Overhaul & Interaction Polish
status: complete
---

# M011: UX Overhaul & Interaction Polish — Summary

## What Shipped

All 11 issues addressed in a single implementation pass across 12 files:

1. **Participant Panel Lifecycle** — Complete rewrite of `getOrderedGroups` → `getLifecycleGroups`. Groups users by state: Waiting (clock) → Voting (vote icon) → Voted (check) → Results (checkmark) → Skipped (hidden if 0) → Spectating (always bottom). Group-mode override on reveal regroups by team names. Old `StatusDot`/`StatusIcon` removed.

2. **Host Controls Post-Reveal** — "New Round" replaced with side-by-side "Next Round" + "Revote" buttons with smaller sizing and icons (ArrowRight, RefreshCw).

3. **Task-Based Voting Logic** — `start_vote` auto-selects first pending task if none active. Reset auto-advances to next pending task. Revote keeps same task and resets its status.

4. **Avatar Hover** — Removed click handler, hover:scale, hover:border-primary, and RefreshCw overlay from `PlayerAvatar`.

5. **Table Cleanup** — "Planning Poker" text replaced with "Ready" label in idle state.

6. **Invite Dialog** — Copy triggers `toast.success("Link copied to clipboard")` and auto-closes dialog after 400ms.

7. **Settings Menu CSS** — Fixed `hsl()` → `oklch()` in custom `.dropdown-item` CSS to match the project's OKLCH color space. Added explicit `color: oklch(var(--foreground))` default.

8. **Host Kick** — New `kick_user` server event (host-only auth). Target receives `kicked` event → navigated to dashboard with toast message. Left panel dropdown shows "Remove from room" for non-host users.

9. **Sidebar Animation** — Changed `transition-all` → `transition-[width]` on panel container. Added `minWidth` to `SmallAvatar` to prevent dimension warping during collapse/expand.

10. **Global Input Sizing** — Input: h-8→h-10, px-2.5→px-3. Textarea: min-h-16→min-h-20, px-2.5→px-3.

11. **User Profile Dropdown** — Added spectator mode toggle (clears vote server-side if mid-round) and keyboard controls toggle. Removed standalone keyboard shortcuts button from navbar.

## Server Changes

- `toggle_spectator` event — switches user role DEV↔SPECTATOR, clears vote if becoming spectator
- `kick_user` event — host-only, removes user from room, emits `kicked` to target socket
- `revote` event — resets round keeping same active task
- `start_vote` — auto-selects first pending task
- `reset` — auto-advances to next pending task, sends updated tasks array

## Key Artifacts

- `client/src/components/Room/ParticipantPanel.jsx` — Complete rewrite with lifecycle grouping
- `client/src/components/Room/PokerTable.jsx` — Post-reveal buttons, table text cleanup
- `client/src/components/Room/RoomNavbar.jsx` — User dropdown toggles, CSS fix, keyboard button removal
- `client/src/components/Room/PlayerAvatar.jsx` — Hover animation removal
- `client/src/components/InviteModal.jsx` — Auto-close + toast
- `client/src/components/ui/input.tsx` — Global sizing
- `client/src/components/ui/textarea.tsx` — Global sizing
- `client/src/hooks/useRoomHandlers.js` — revote, toggleSpectator, kickUser handlers
- `client/src/hooks/useRoomSocket.js` — kicked event listener, tasks in reset
- `server/handlers/roomHandlers.js` — toggle_spectator, kick_user
- `server/handlers/voteHandlers.js` — revote, task auto-advance
