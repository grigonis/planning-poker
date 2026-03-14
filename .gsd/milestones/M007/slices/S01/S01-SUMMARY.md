---
id: S01
parent: M007
milestone: M007
provides:
  - Firebase Admin SDK initialized on server from env vars (server/firebase.js)
  - Firestore service module with upsertSession, upsertTask, updateParticipants, closeSession (server/firestore.js)
  - Per-task Firestore write in performReveal — fires immediately on vote reveal with active task
  - Session document created on room creation; participants updated on join/leave; endedAt set on room end
requires: []
affects:
  - S02
key_files:
  - server/firebase.js
  - server/firestore.js
  - server/handlers/roomHandlers.js
  - server/handlers/voteHandlers.js
  - server/index.js
  - server/.env
key_decisions:
  - All Firestore writes are fire-and-forget (.catch only) — write failures log but never crash socket handlers
  - upsertSession uses merge:true — safe to call multiple times without overwriting tasks subcollection
  - Private key stored double-quoted in .env; dotenv handles newline unescaping; firebase.js has fallback for externally-set vars
  - Service account JSON deleted from repo after extraction; credentials live only in server/.env
patterns_established:
  - Firestore write pattern: call async function, chain .catch(err => console.error(...)), never await in socket handler
  - All Firestore functions swallow errors internally — callers never need try/catch
observability_surfaces:
  - Write failures: console.error('[Firestore] <function> failed: <message>') on stdout
  - Startup failure: throws with descriptive message listing missing env vars
  - Diagnostic: node -e "require('dotenv').config(); const {db}=require('./firebase'); console.log(!!db)"
drill_down_paths:
  - .gsd/milestones/M007/slices/S01/S01-PLAN.md
duration: ~1h
verification_result: passed
completed_at: 2026-03-13
---

# S01: Firebase Setup & Per-Task Firestore Writes

**Firebase Admin SDK wired into the server; every completed task vote is written to Firestore in real time without ending the session.**

## What Happened

Installed `firebase-admin` in the server. Built `server/firebase.js` as a singleton initializer — reads `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from env, handles the double-quote/newline edge case for the private key, and throws loudly at startup if any var is missing. Built `server/firestore.js` with four functions (`upsertSession`, `upsertTask`, `updateParticipants`, `closeSession`), all fire-and-forget with internal error swallowing.

Wired into handlers: `roomHandlers.js` calls `upsertSession` on create, `updateParticipants` on join/disconnect, `closeSession` on end (replacing the old `addHistory` in-memory call). `voteHandlers.js` calls `upsertTask` inside `performReveal` immediately after the task is marked COMPLETED — this is the core write, fires per task, not per session end.

The service account JSON was dropped into the project root for extraction then immediately deleted. Credentials now live only in `server/.env`.

## Verification

- `node -e "require('./firebase'); console.log('ok')"` → `ok`
- Integration script wrote `sessions/TEST01` + `sessions/TEST01/tasks/task-001` + `endedAt` to Firestore successfully
- All three operations confirmed via Firebase console
- Test documents cleaned up after verification
- Server starts cleanly on port 5000 with no errors

## Deviations

- `getUserHistoryHandler` in roomHandlers.js now returns `[]` (stub) — S02 replaces it with a Firestore query. The old `getHistoryByUserId` from store.js is no longer called.
- `addHistory` import removed from roomHandlers.js; `store.js` history Map still exists but is no longer written to (will be fully removed in S02).

## Known Limitations

- Dashboard history shows empty until S02 ships — `get_user_history` returns `[]` stub
- `store.js` still exports `addHistory` and `history` Map — dead code until S02 removes it
- Firestore security rules are in default "allow all authenticated" state — tighten before production

## Follow-ups

- S02: implement `getHistoryByUserId` querying Firestore `sessions` collection by `participants[].id`
- S02: remove `history` Map and `addHistory` from store.js entirely
- Pre-production: set Firestore security rules to restrict reads/writes

## Files Created/Modified

- `server/firebase.js` — Firebase Admin SDK singleton, env var validation, private key normalization
- `server/firestore.js` — Firestore service: upsertSession, upsertTask, updateParticipants, closeSession
- `server/handlers/roomHandlers.js` — wired upsertSession/updateParticipants/closeSession; removed addHistory; stubbed getUserHistoryHandler
- `server/handlers/voteHandlers.js` — wired upsertTask in performReveal after task COMPLETED
- `server/index.js` — require('./firebase') at top before handlers
- `server/.env` — FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

## Forward Intelligence

### What the next slice should know
- Firestore document path for sessions: `sessions/{roomId}`, tasks subcollection: `sessions/{roomId}/tasks/{taskId}`
- Participants array on the session doc is updated on every join/leave — it's a running snapshot, not a final list
- `getUserHistoryHandler` is a stub returning `[]` — S02 must replace it with a real Firestore query
- The query for history needs `array-contains` on `participants` field: `where('participants', 'array-contains', { id: userId, ... })` — **Firestore array-contains only matches exact objects**, so querying by nested field won't work. Use a flat `participantIds` string array on the session doc for efficient querying.

### What's fragile
- `participantIds` array is not yet on the session document — S02 needs to add it to `upsertSession` and `updateParticipants` in firestore.js, otherwise the history query will require a full collection scan
- Private key env var handling has a fallback for external env (non-dotenv) — test this if deploying to a platform that injects env vars differently (Railway, Render, etc.)

### Authoritative diagnostics
- Server startup logs: Firebase init errors throw before `Server running on port 5000` — if you see the port log, Firebase is up
- Write failures: grep server stdout for `[Firestore]` prefix
- Firestore console: `sessions` collection should populate as rooms are used

### What assumptions changed
- Originally planned to query history by `participants[].id` — discovered Firestore array-contains only matches exact objects, not nested fields. Solution: add a flat `participantIds: string[]` array to session docs for O(1) indexed queries. This is a S02 task.
