---
id: S04
parent: M007
milestone: M007
provides:
  - upsertUser extended to store name, avatarSeed, guestUuid (conditional on first linkage)
  - getUserProfile(uid) — reads name, avatarSeed, guestUuid from users/{uid}
  - getHistoryByFirebaseUid(uid) — merges sessions by UID and linked guest UUID, deduped + sorted
  - getUserHistoryHandler uses Firebase UID when socket.firebaseUid is set, falls back to UUID for guests
  - link_guest_uid socket event — stores pre-auth UUID on users/{uid}.guestUuid (first-write-only)
  - load_user_profile socket event — returns stored name+avatarSeed from Firestore
  - save_user_profile socket event — persists profile updates to Firestore when authenticated
  - Dashboard sign-in side-effect: on auth state null→user, links guest UUID + loads Firestore profile + re-fetches history
  - Profile saves from Dashboard synced to Firestore when user is authenticated
requires:
  - slice: S03
    provides: socket.firebaseUid on all handlers, upsertUser baseline, useAuthContext
affects: []
key_files:
  - server/firestore.js
  - server/handlers/roomHandlers.js
  - client/src/pages/Dashboard.jsx
key_decisions:
  - Sign-in side-effects wired in Dashboard (not AuthContext) — avoids circular dependency with SocketContext which consumes AuthContext
  - guestUuid is conditional: read existing doc before write, only set if absent — preserves earliest linkage across devices
  - History merge deduped by session id, sorted by createdAt desc, limit 50 — no pagination needed yet
  - Profile load on sign-in only overwrites local profile if Firestore has non-empty values (name or avatarSeed)
  - save_user_profile fires on every profile update from Dashboard when authenticated — keeps Firestore in sync
patterns_established:
  - Auth state transition detection via ref (prevAuthUserRef) — fire once on null→user, not on every re-render
  - Parallel Firestore queries with Promise.all + Set dedup — efficient merge without compound index
observability_surfaces:
  - "[Auth] Linked guest UUID <uuid> to uid <uid>" — server stdout on first sign-in linkage
  - "[Auth] Profile loaded from Firestore for <uid>" — server stdout when profile exists in Firestore
  - "[Firestore] getHistoryByFirebaseUid failed:" / "[Firestore] getUserProfile failed:" — error path coverage
  - Firestore console → users/{uid}: guestUuid field present after first sign-in
drill_down_paths: []
duration: ~1h
verification_result: passed
completed_at: 2026-03-14
---

# S04: Profile Sync & Identity Linking

**Guest UUID linked on sign-in, Firestore profile synced to local state, history merged by UID + guest UUID. Build clean.**

## What Happened

Extended `upsertUser` on the server to accept `name`, `avatarSeed`, and `guestUuid`. The `guestUuid` field uses a conditional write — it reads the existing doc first and only sets the field if absent, preserving the earliest linkage across devices. Added `getUserProfile(uid)` which returns `{ name, avatarSeed, guestUuid }` or null.

Added `getHistoryByFirebaseUid(uid)` to `firestore.js`: fetches the user profile to get the linked `guestUuid`, runs two Firestore queries in parallel (`participantIds array-contains uid` and `array-contains guestUuid`), flattens and deduplicates by session id, sorts newest-first, returns the merged set. This avoids a compound index by using separate queries.

Three new socket events registered in `roomHandlers.js`: `link_guest_uid` (stores pre-auth UUID on user doc), `load_user_profile` (returns name+avatarSeed from Firestore), `save_user_profile` (persists profile updates for authenticated users). `getUserHistoryHandler` now routes to `getHistoryByFirebaseUid` when `socket.firebaseUid` is set, falling back to the UUID-only query for guests.

On the client, the Dashboard detects the auth state transition from null → user using a ref, then fires three side-effects: link the guest UUID, load Firestore profile and sync it into `useProfile` if the values are non-empty, and re-fetch history to show the merged results immediately. Profile updates from the ProfileSetupDialog are now also saved to Firestore when authenticated, keeping cross-device profile consistent.

## Verification

- `npm run build` exits 0 — no errors (chunk size warnings pre-existing)
- Server handlers registered and guard correctly on `socket.firebaseUid` — guests get no-ops
- `getHistoryByFirebaseUid` dedup logic verified by code inspection — Set dedup + sort by ISO string is correct

## Files Created/Modified

- `server/firestore.js` — upsertUser extended; getUserProfile + getHistoryByFirebaseUid added
- `server/handlers/roomHandlers.js` — getUserHistoryHandler updated; link_guest_uid, load_user_profile, save_user_profile handlers added
- `client/src/pages/Dashboard.jsx` — sign-in side-effect (link UUID, load profile, re-fetch history); handleUpdateProfile syncs to Firestore

## Forward Intelligence

### What the next agent should know
- M007 is now feature-complete. Remaining: Firestore security rules (open — tighten before production), email magic link handler in `SignInDialog.jsx` (`handleEmailSignInLink` exported but not yet called from `App.jsx`)
- `users/{uid}.guestUuid` may be absent for users who sign in on a device that never had a guest session (clean sign-in) — queries gracefully skip the second leg
- The `save_user_profile` event only fires from Dashboard; if profile is updated from within a room, that's a separate `update_profile` event that updates in-memory state only — could be extended to also persist to Firestore

### What's fragile
- Re-fetch history on sign-in adds a brief loading flash — acceptable for now
- If `load_user_profile` returns values and the user had different local values, local is overwritten — intentional (Firestore is source of truth for authenticated users)
