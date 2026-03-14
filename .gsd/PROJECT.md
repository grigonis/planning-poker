# Keystimate

**Elevator Pitch:** A premium, real-time Planning Poker application designed for remote agile teams who value aesthetics and seamless user experience.

## Core Value
- **Aesthetic Excellence:** Modern UI with smooth animations and dark mode.
- **Real-time Feedback:** Instant voting synchronization and live group management.
- **Team Workspace:** Persistent user identities and session history tracking.

## Current State
Keystimate is fully Firebase-backed (M007 complete). All seven milestones shipped:

- **Identity & profile** — UUID-based guest identity, named avatars, cross-device profile sync via Firestore
- **Real-time rooms** — create/join/reconnect, full voting lifecycle, groups, spectators
- **Session history** — every voted task written to Firestore on reveal; history survives server restarts; dashboard reads from Firestore for both guests (by UUID) and authenticated users (by Firebase UID + linked guest UUID)
- **Optional auth** — Google and GitHub OAuth via Firebase Auth; email magic-link flow; guest flow completely unchanged; signed-in users get cross-device profile and history
- **Active rooms** — dashboard shows in-progress rooms for rejoining

Stack: React 18 + Vite client, Node/Express/Socket.io server, Firebase Admin SDK (server), Firebase client SDK (client), Firestore as persistence layer.

**Pre-production remaining:** Tighten Firestore security rules (currently open); enable OAuth providers in Firebase console for production domain.
