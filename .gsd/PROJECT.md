# Keystimate

**Elevator Pitch:** A premium, real-time Planning Poker application designed for remote agile teams who value aesthetics and seamless user experience.

## Core Value
- **Aesthetic Excellence:** Modern UI with smooth animations and dark mode.
- **Real-time Feedback:** Instant voting synchronization and live group management.
- **Team Workspace:** Persistent user identities and session history tracking.

## Current State
Keystimate is fully Firebase-backed and hardened for production use. Nine milestones shipped:

- **Security & Hardening** — Host-only authorization on all critical socket events, server-side input sanitization/length capping, Firestore security rules, and automated room cleanup (M008).
- **Identity & Profile** — UUID-based guest identity, custom profile names, uploaded avatars (Firebase Storage), and cross-device profile sync via Firestore (M009).
- **Real-time Rooms** — Create/join/reconnect, full voting lifecycle, groups, spectators.
- **Session History** — Every voted task written to Firestore on reveal; history survives server restarts; dashboard reads from Firestore for both guests (by UUID) and authenticated users (by Firebase UID + linked guest UUID).
- **Optional Auth** — Google and GitHub OAuth via Firebase Auth; email magic-link flow; guest flow completely unchanged.
- **Active Rooms** — Dashboard shows in-progress rooms for rejoining.

Stack: React 18 + Vite client, Node/Express/Socket.io server, Firebase Admin SDK (server), Firebase client SDK (client), Firestore as persistence layer, Firebase Storage for custom assets.

**Pre-production remaining:** Enable OAuth providers in Firebase console for production domain.
