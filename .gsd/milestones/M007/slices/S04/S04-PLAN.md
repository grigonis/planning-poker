# S04: Profile Sync & Identity Linking

**Goal:** Signed-in users' profile (name, avatar) syncs to Firestore and loads on any device. Pre-auth guest UUID is stored on the Firebase user record so past guest sessions appear in history after sign-in. History query uses Firebase UID when authenticated.
**Demo:** Sign in with Google on a device that had prior guest sessions → dashboard shows guest history AND profile name/avatar are loaded from Firestore on any new device.

## Must-Haves

- On sign-in: guest UUID written to `users/{uid}.guestUuid` (fire-and-forget, only if not already set)
- On sign-in: profile name + avatarSeed loaded from Firestore `users/{uid}` and synced into `useProfile` if present
- `getUserHistoryHandler` queries by Firebase UID when `socket.firebaseUid` is set (in addition to UUID)
- `upsertUser` accepts and stores `guestUuid`, `name`, `avatarSeed` fields

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: no (verify via socket response + Firestore console)

## Verification

- Server: `socket.firebaseUid` present → `get_user_history` response includes sessions that only have that UID's guest UUID in `participantIds`
- Client: after sign-in, `useProfile` name/avatarSeed match Firestore `users/{uid}` values
- Firestore: `users/{uid}.guestUuid` set to the pre-sign-in UUID after first sign-in

## Observability / Diagnostics

- Runtime signals: `[Auth] Linked guest UUID <uuid> to uid <uid>` logged on first sign-in linkage; `[Auth] Profile loaded from Firestore for <uid>` on profile sync
- Inspection surfaces: Firestore console → users/{uid} document; dashboard history count before vs after sign-in
- Failure visibility: `[Firestore] upsertUser failed:` already in place; profile load failure logs warn and falls back to existing localStorage profile
- Redaction constraints: no secrets in logs; UIDs and UUIDs are fine to log

## Integration Closure

- Upstream surfaces consumed: `socket.firebaseUid` (set by S03 middleware), `useProfile` hook (userId/name/avatarSeed), `upsertUser` in firestore.js, `getHistoryByUserId` in firestore.js
- New wiring introduced: AuthContext sign-in side-effect calls server `link_guest_uid` and `load_profile` socket events; `getUserHistoryHandler` now merges results from both UUID and UID queries
- What remains before milestone done: Firestore security rules (deferred to post-M007)

## Tasks

- [ ] **T01: Extend upsertUser to store name, avatarSeed, guestUuid** `est:20m`
  - Why: Firestore user doc needs to hold all fields needed for cross-device profile load and guest linkage
  - Files: `server/firestore.js`
  - Do: Update `upsertUser(uid, data)` to write `name`, `avatarSeed`, `guestUuid` via merge when provided (only set `guestUuid` if not already present — use a conditional write so subsequent sign-ins don't overwrite it). Add a new exported `getUserProfile(uid)` function that returns `{ name, avatarSeed, guestUuid }` or null.
  - Verify: `node -e "const {upsertUser,getUserProfile}=require('./firestore'); upsertUser('test-uid',{name:'Alice',avatarSeed:'abc123',guestUuid:'guest-1'}).then(()=>getUserProfile('test-uid')).then(console.log)"` — output contains name, avatarSeed, guestUuid
  - Done when: upsertUser writes all fields; getUserProfile reads them back correctly

- [ ] **T02: Add server socket events for guest linkage and profile load** `est:30m`
  - Why: Client needs two new socket round-trips: (1) on sign-in, send guest UUID to be stored on user doc; (2) on sign-in, fetch stored profile so client can sync name/avatar
  - Files: `server/handlers/roomHandlers.js`, `server/firestore.js`
  - Do: Add two new socket event handlers to roomHandlers: `link_guest_uid` — receives `{ guestUuid }`, requires `socket.firebaseUid`, calls `upsertUser(uid, { guestUuid })` with merge (no-op if already set), logs the linkage; `load_user_profile` — receives no payload, requires `socket.firebaseUid`, calls `getUserProfile(uid)`, returns `{ name, avatarSeed }` or `{}`. Register both with `socket.on`.
  - Verify: With a test socket authenticated (or mock firebaseUid in dev), emit both events and confirm correct Firestore writes/reads via console log output
  - Done when: Both handlers registered and respond correctly; `socket.firebaseUid` guard returns early with `{}` / no-op for guests

- [ ] **T03: Wire sign-in side-effects in AuthContext** `est:30m`
  - Why: When auth state transitions from null → user (sign-in), the client should trigger guest linkage and profile load automatically — no user action needed
  - Files: `client/src/context/AuthContext.jsx`, `client/src/hooks/useAuth.js`
  - Do: In `AuthContext`, add a `useEffect` that watches `user` (the Firebase user). When `user` transitions to non-null and `socket` is available (consume `useSocket` inside AuthContext): (1) emit `link_guest_uid` with `{ guestUuid: userId }` where `userId` comes from `localStorage` (key: `keystimate_user_id` or whatever `useProfile` uses — check the hook); (2) emit `load_user_profile`, and on response if `{ name, avatarSeed }` are non-empty, call `updateProfile({ name, avatarSeed })` from `useProfile`. Log both operations. Guard: only run when user changes from null → non-null (use a ref to track previous value).
  - Verify: Sign in with Google in browser → server logs show `[Auth] Linked guest UUID` → Firestore `users/{uid}.guestUuid` is set → `useProfile` name/avatarSeed update if Firestore had values
  - Done when: Side-effects fire exactly once per sign-in; guest flow unaffected

- [ ] **T04: Extend getUserHistoryHandler to query by Firebase UID** `est:30m`
  - Why: Authenticated users should see history from ALL their sessions — including ones recorded under their guest UUID and any future ones recorded under their UID. Without this, post-sign-in history is incomplete.
  - Files: `server/firestore.js`, `server/handlers/roomHandlers.js`
  - Do: In `firestore.js`, add `getHistoryByFirebaseUid(uid)` — gets the user doc to read `guestUuid`, then runs two parallel Firestore queries: `participantIds array-contains uid` and (if guestUuid exists) `participantIds array-contains guestUuid`. Merge the two arrays, dedup by session `id`, sort by `createdAt` desc, limit 50. Reuse the existing tasks-fetch logic. In `getUserHistoryHandler`: if `socket.firebaseUid` is set, call `getHistoryByFirebaseUid(socket.firebaseUid)` instead of (or in addition to) the UUID query. `userId` param still used for guest fallback.
  - Verify: Firestore has a session with guest UUID in `participantIds`; sign in and call `get_user_history` → response includes that session
  - Done when: Authenticated users see merged history; guests see UUID-only history unchanged

- [ ] **T05: Build and verify** `est:15m`
  - Why: Confirm the client bundle builds clean with the new wiring before committing
  - Files: `client/` (build only)
  - Do: Run `cd client && npm run build`. Check for TypeScript/lint errors. Fix any import issues or undefined references introduced by T03 changes.
  - Verify: Build exits 0 with no errors (warnings acceptable)
  - Done when: `npm run build` exits 0

## Files Likely Touched

- `server/firestore.js`
- `server/handlers/roomHandlers.js`
- `client/src/context/AuthContext.jsx`
- `client/src/hooks/useAuth.js`
- `client/src/context/SocketContext.jsx` (possibly — if socket needed in AuthContext, check for circular dependency first)
