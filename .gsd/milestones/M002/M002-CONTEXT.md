# M002: shadcn Room UI Migration — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

Planning poker app (Keystimate/BananaPoker) — React + Vite + Tailwind v3 SPA. Backend is Node/Socket.io. The client lives in `client/`. Landing page is fully custom-designed and must not be touched.

## Why This Milestone

The room UI (poker table, modals, forms, side panels, voting overlay) was built with a custom ad-hoc design system that has accumulated visual inconsistencies and a structural breakage: the `banana-*` color token is used 47 times across room components but is not defined anywhere in `tailwind.config.js`, meaning those classes silently resolve to nothing. This milestone replaces all room-facing UI with shadcn/ui components and a consistent semantic token system, without touching the landing page.

## User-Visible Outcome

### When this milestone is complete, the user can:
- Enter a room and see a visually consistent UI — modals, buttons, inputs, side panel, voting overlay — all using the same design system
- Create a room at `/create` with properly styled form inputs and selectors
- Join a room via the GuestJoinModal with a clean, accessible form
- Use the TasksPane slide-over with a proper Sheet component
- Toggle room settings (Fun Features, Auto Reveal, Anonymous Mode) using real Switch components
- Vote using a rebuilt VotingOverlay with shadcn Cards
- See toast notifications instead of blocking `alert()` dialogs
- Confirm destructive actions (end session) via `AlertDialog` instead of `window.confirm()`

### Entry point / environment
- Entry point: `http://localhost:5173/` — navigate to `/create`, then into a room
- Environment: local dev (`npm run dev` in `client/`)
- Live dependencies: Socket.io server running in `server/`

## Completion Class
- Contract complete means: dev build passes with no errors; no undefined Tailwind tokens in room components; all shadcn components imported from `src/components/ui/`
- Integration complete means: full room flow exercised in browser — create room, join, vote, reveal, settings modal, tasks pane, end session — all rendering correctly in both light and dark mode
- Operational complete means: none

## Final Integrated Acceptance
- Navigate to `/create` → form renders with shadcn Input, Select, ToggleGroup — no raw styling
- Create room → enter room → all navbar buttons are shadcn Button variants
- Open TasksPane → Sheet slides in from right with correct title and form
- Open RoomSettings → Dialog opens with Switch toggles, AlertDialog fires on end session
- Start vote → VotingOverlay renders shadcn Cards; select one → visual feedback
- Perform alert()-triggering action (e.g. invalid custom scale) → Sonner toast appears, no browser alert
- Toggle dark mode → all room UI responds via CSS variables, no hardcoded colors

## Risks and Unknowns
- `tailwind.config.js` does not have `cssVariables` wiring for shadcn out of the box — `shadcn init` must patch it correctly for Tailwind v3
- The `banana-*` token is used in 47 places; a missed replacement could cause silent visual regressions
- The "claude blu 2" theme uses OKLCH colors which require Tailwind v3 to be properly wired via `oklch(var(--x) / <alpha-value>)` pattern — verify during S01

## Existing Codebase / Prior Art
- `client/src/index.css` — global CSS, Tailwind directives, glassmorphism utilities (`.glass`, `.glass-silver`, `.aurora`, `.modern-grid`) — preserve for landing page
- `client/tailwind.config.js` — custom tokens: `silver`, `carbon`, `dark`, `champagne` — all landing-page tokens, must be preserved
- `client/src/components/ui/shimmer-button.jsx` — already has local `cn()` — superseded by `src/lib/utils.ts`
- `client/src/components/ui/infinite-grid-integration.jsx` — landing only, do not touch
- `client/src/components/ui/paper-design-shader-background.tsx` — landing only, do not touch
- `client/src/App.css` — stale Vite scaffold styles — remove in S01
- `client/src/context/ThemeContext.jsx` — manages `dark` class on `<html>` — compatible with shadcn, no change needed

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions.

## Relevant Requirements
- R101–R114 — full set defined in REQUIREMENTS.md

## Scope

### In Scope
- `client/src/pages/Room.jsx`
- `client/src/pages/CreateRoom.jsx`
- `client/src/components/Room/` — all 6 components
- `client/src/components/Voting/` — VotingOverlay, Card
- `client/src/components/GuestJoinModal.jsx`
- `client/src/components/InviteModal.jsx`

### Out of Scope / Non-Goals
- `client/src/components/home/` — zero changes
- `client/src/pages/Landing.jsx` — zero changes
- `client/src/components/KeystimateLogo.jsx` — zero changes
- `client/src/components/ScrumkyLogo.jsx` — zero changes
- Backend (`server/`) — zero changes

## Technical Constraints
- Tailwind v3 (not v4) — CSS variables registered in `tailwind.config.js` via `extend.colors` with `oklch(var(--x) / <alpha-value>)` pattern
- shadcn components go to `src/components/ui/`
- `cn()` must live at `src/lib/utils.ts`
- "claude blu 2" primary: blue-indigo (`oklch(0.66 0.12 252)` dark) — replaces broken `banana-*` orange
- Inter font specified by theme — add to `index.html`
- `framer-motion` installed — can be retained inside Sheet/Dialog content

## Integration Points
- `ThemeContext.jsx` → toggles `.dark` on `<html>` → shadcn CSS variables respond automatically
- Socket.io events — not affected
- `localStorage` for session/tasks pane state — not affected
