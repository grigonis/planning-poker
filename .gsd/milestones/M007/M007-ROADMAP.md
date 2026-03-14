# M007: Firebase Integration — Persistence & Optional Auth

**Vision:** Replace ephemeral in-memory history and localStorage-only profiles with Firebase-backed persistence. Session history is written task-by-task as votes complete (not on room termination). Authentication is optional — guests continue working exactly as today; signed-in users get cross-device profile sync and persistent history tied to a real account.

## Success Criteria

- A completed task vote (reveal with active task) is immediately written to Firestore — visible in the dashboard without ending the session
- Session history survives a full server restart — no data lost
- A guest user can use the entire app with no login prompt
- A user can sign in with Google or GitHub and have their profile and history accessible on any device
- Signed-in users who previously used the app as a guest can continue without disruption
- Dashboard history loads from Firestore, not in-memory store
- Active rooms still come from in-memory (unchanged — correct for low-latency socket state)

## Key Risks / Unknowns

- Firebase Admin SDK on server alongside Socket.io — Firestore writes in socket event handlers need to be async without blocking the event loop — write failures must not crash the room
- Guest ↔ authenticated user identity merge — a guest UUID and a Firebase UID are two different identities; history linkage strategy must be decided before S03 so dashboard queries are correct
- Firebase project setup (credentials, env vars) — must work in both local dev and production without committing secrets

## Proof Strategy

- Firestore write path → retire in S01 by showing a voted task appears in Firestore console without ending the session
- Guest ↔ auth identity → retire in S03 by verifying a guest's in-progress session history is visible on dashboard after signing in (linked by pre-auth UUID stored on Firebase user record)

## Verification Classes

- Contract verification: Firestore document shape matches expected schema for sessions and users
- Integration verification: performReveal writes to Firestore; dashboard reads from Firestore; server restart doesn't lose completed task votes
- Operational verification: Firebase Admin initialized correctly from env vars; write failures logged but don't crash socket handler
- UAT / human verification: full guest flow unchanged; OAuth sign-in flow works end-to-end; history visible on dashboard after sign-in

## Milestone Definition of Done

This milestone is complete only when all are true:

- All completed task votes are written to Firestore in real time (not on room end)
- Server restart does not lose any voted task data
- Dashboard history reads from Firestore for both guests (by UUID) and authenticated users (by Firebase UID)
- Guest users experience zero friction change — no forced login
- Google and GitHub OAuth sign-in works end-to-end in the browser
- Firebase credentials are in `.env` — no secrets committed to git
- `store.js` history Map and `addHistory` are removed (Firestore is the single source of truth for history)
- Active room state remains in-memory (unchanged)

## Requirement Coverage

- Covers: persistent session history, per-task vote persistence, optional OAuth auth, cross-device profile sync
- Leaves for later: account deletion, session sharing/export, team/org accounts

## Slices

- [ ] **S01: Firebase Setup & Per-Task Firestore Writes** `risk:high` `depends:[]`
  > After this: When a vote is revealed with an active task, the task result is immediately written to Firestore `sessions/{roomId}/tasks/{taskId}` — visible in Firebase console without ending the session. Server restart loses no voted task data.

- [ ] **S02: Dashboard Reads from Firestore** `risk:medium` `depends:[S01]`
  > After this: Dashboard session history loads from Firestore (not in-memory). Guest users see their history by UUID. `store.js` history Map and `addHistory` removed. History survives server restart end-to-end visible in the UI.

- [x] **S03: Optional Firebase Auth (Google + GitHub OAuth)** `risk:medium` `depends:[S02]`
  > After this: Users can sign in with Google or GitHub from the dashboard. Signed-in users have profile stored in Firestore `users/{uid}` and history queryable by Firebase UID. Guest flow is completely unchanged.

- [x] **S04: Profile Sync & Identity Linking** `risk:low` `depends:[S03]`
  > After this: Signed-in users' profile (name, avatar) syncs to Firestore and loads on any device. Pre-auth guest UUID is stored on the Firebase user record so past guest sessions appear in history after sign-in.

## Boundary Map

### S01 → S02

Produces:
- Firestore `sessions/{roomId}` document: `{ id, roomName, roomDescription, gameMode, votingSystem, hostId, createdAt, endedAt? }`
- Firestore `sessions/{roomId}/tasks/{taskId}` document: `{ id, title, votes, status, resolvedAt, participants[] }`
- `sessions/{roomId}.participants[]` updated on user join/leave
- Firebase Admin SDK initialized on server, credentials via env vars
- `firestore.js` service module on server exposing: `upsertSession`, `upsertTask`, `updateParticipants`, `closeSession`

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- Server socket handlers `get_user_history` and `get_active_rooms` read from Firestore by `userId` (UUID)
- `store.js` `history` Map and `addHistory` / `getHistoryByUserId` removed
- Firestore query: `sessions` where `participants[].id == userId`, ordered by `createdAt desc`

Consumes:
- S01: Firestore session + task write path

### S03 → S04

Produces:
- Firebase Auth initialized in React client (`firebase.js` config module)
- `useAuth` hook: `{ user, signInWithGoogle, signInWithGithub, signOut, loading }`
- Dashboard sign-in UI: subtle "Sign in" button, Google + GitHub options, dismissible
- Server socket auth middleware: optional — if client sends Firebase ID token, server verifies and attaches `firebaseUid` to socket
- Firestore `users/{firebaseUid}` document: `{ uid, name, avatarSeed, guestUuid, createdAt }`

Consumes:
- S02: Firestore as history source of truth

### S04 → done

Produces:
- Profile loaded from Firestore on sign-in (name, avatar written back to `useProfile`)
- Guest UUID stored in `users/{firebaseUid}.guestUuid` on first sign-in
- History query uses Firebase UID when authenticated, UUID when guest
- Dashboard profile section shows sign-in state (avatar, name, sign-out option)

Consumes:
- S03: `useAuth` hook, Firebase UID on server socket
