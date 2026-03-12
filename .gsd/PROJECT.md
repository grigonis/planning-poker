# Project: Keystimate — Online Planning Poker

## What This Is

A real-time planning poker app for engineering teams. Teams create a room, share a link, and vote on story point estimates simultaneously. The host controls voting rounds; results are revealed once all participants have voted. Built with React + Vite (client) and Node.js + Socket.io (server).

## Core Value

Frictionless real-time estimation — no signup, join by link, vote together, see results instantly.

## Current State

- M001 complete: dedicated `/create` page, modernized room navbar, voting systems (Fibonacci presets + custom scales), tasks side-pane, room settings (fun features, auto-reveal, anonymous mode)
- M002 complete: migrated all room-facing UI to shadcn/ui with "claude blu 2" theme. Modals, forms, sheets, and voting overlay now use shadcn. All banana-* tokens replaced. Room navigation unified.
- Landing page (/) is a full marketing page with a distinct custom design system — preserved as-is.
- M003 in progress: Room UX restructure — rebranding to Keystimate, host dropdown menu with split dialogs, card customization, and participant panel.

## Architecture / Key Patterns

- **Client:** React 18 + Vite + Tailwind v3 + `darkMode: "class"`. ThemeContext toggles `.dark` on `<html>`. Lives in `client/`.
- **Server:** Node.js + Socket.io. Lives in `server/`. No database — in-memory room state.
- **Routing:** React Router v7. Routes: `/` (Landing), `/create` (CreateRoom), `/room/:roomId` (Room).
- **Design systems (two, intentionally separate):**
  - Landing: custom carbon/silver/champagne tokens, glassmorphism CSS utilities in `index.css`
  - Room: shadcn/ui with "claude blu 2" theme (M002 complete)
- **Components:** Landing in `src/components/home/`. Room in `src/components/Room/`, `src/components/Voting/`. Shared modals at `src/components/`.
- **shadcn:** `src/components/ui/` for generated components, `src/lib/utils.ts` for `cn()`. Sonner for toasts. DropdownMenu added in M003.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Migration — Dedicated create page, voting systems, tasks pane, modernized room UI
- [x] M002: shadcn Room UI Migration — Consistent shadcn component system for all room-facing surfaces
- [ ] M003: Room UX Restructure — Keystimate branding, host dropdown menu, card customization, participant panel
