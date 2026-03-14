# Keystimate

**Elevator Pitch:** A premium, real-time Planning Poker application designed for remote agile teams who value aesthetics and seamless user experience.

## Core Value
- **Aesthetic Excellence:** Modern UI with smooth animations and dark mode.
- **Real-time Feedback:** Instant voting synchronization and live group management.
- **Team Workspace:** Persistent user identities and session history tracking.

## Current State
Keystimate is fully Firebase-backed, security-hardened, and polished for production use. Eleven milestones shipped:

- **Security & Hardening** — Host-only authorization on all critical socket events, server-side input sanitization/length capping, Firestore security rules, automated room cleanup, and rate limiting on critical events (M008, M010/S01).
- **Identity & Profile** — UUID-based guest identity, custom profile names, uploaded avatars (Firebase Storage), and cross-device profile sync via Firestore (M009).
- **Real-time Rooms** — Create/join/reconnect, full voting lifecycle, groups, spectators.
- **Session History** — Every voted task written to Firestore on reveal; history survives server restarts; dashboard reads from Firestore for both guests and authenticated users.
- **Optional Auth** — Google and GitHub OAuth via Firebase Auth; email magic-link flow; guest flow unchanged.
- **Active Rooms** — Dashboard shows in-progress rooms for rejoining.
- **Room UX** — Keystimate branding, host dropdown menu with three focused dialogs (edit room, customize cards, settings), interactive card customizer, left-side participant panel with animated reordering (M003).
- **Code Quality** — Room.jsx decomposed into focused hooks (useRoomState, useRoomSocket, useRoomHandlers, useRoomModals). Keyboard shortcuts for voting and host controls (M010/S02-S03).
- **UX Overhaul** — Participant panel lifecycle grouping (Waiting→Voting→Voted→Revealed→Skipped→Spectating), host kick functionality, post-reveal Next Round + Revote buttons, task-based auto-advance, spectator/screen-sharing toggles in user dropdown, invite auto-close + toast, settings CSS fix, sidebar animation polish, global input sizing (M011).

Stack: React 18 + Vite client, Node/Express/Socket.io server, Firebase Admin SDK (server), Firebase client SDK (client), Firestore as persistence layer, Firebase Storage for custom assets.

**Pre-production remaining:** Enable OAuth providers in Firebase console for production domain.
