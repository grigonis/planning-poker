---
id: S02
parent: M007
milestone: M007
provides:
  - getHistoryByUserId Firestore query (participantIds array-contains + createdAt desc, limit 50)
  - getUserHistoryHandler replaced stub with live Firestore query
  - store.js history Map, addHistory, getHistoryByUserId removed — Firestore is sole history source
  - Dashboard date column falls back to createdAt when endedAt is null (in-progress sessions)
  - Dashboard resolved tasks filter handles both t.resolved and t.status === 'COMPLETED'
requires:
  - slice: S01
    provides: Firestore session + task write path, participantIds flat array on session doc
affects:
  - S03
key_files:
  - server/firestore.js
  - server/store.js
  - server/handlers/roomHandlers.js
  - client/src/pages/Dashboard.jsx
key_decisions:
  - createdAt stored as ISO string (not Firestore serverTimestamp) — immediate read consistency, no epoch-0 bug
  - Firestore composite index required: participantIds (Arrays) + createdAt (Descending) — created via Firebase console
  - Dashboard date uses endedAt || createdAt — in-progress sessions show creation date
patterns_established:
  - Firestore query pattern for user history: array-contains on flat participantIds field
  - ISO string timestamps throughout — no Firestore Timestamp objects in application code
observability_surfaces:
  - Write failures: console.error('[Firestore] getHistoryByUserId failed:', err.message)
  - Diagnostic: node -e "require('./firestore').getHistoryByUserId('userId').then(r=>console.log(r.length))"
drill_down_paths:
  - .gsd/milestones/M007/slices/S02/S02-PLAN.md
duration: ~1h
verification_result: passed
completed_at: 2026-03-13
---

# S02: Dashboard Reads from Firestore

**Dashboard history loads from Firestore; store.js history Map removed; history persists across server restarts and appears in dashboard without ending the session.**

## What Happened

Added `getHistoryByUserId` to `firestore.js` — queries `sessions` collection with `participantIds array-contains userId`, ordered by `createdAt` desc, limit 50. For each session, fetches the `tasks` subcollection. Replaced the S01 stub in `getUserHistoryHandler` with the live async query. Stripped `history` Map, `addHistory`, and the old `getHistoryByUserId` from `store.js` entirely.

Two client bugs surfaced during verification: (1) Dashboard date column used `session.endedAt` which is null for in-progress sessions → `new Date(null)` → epoch "Jan 1, 1970". Fixed to `endedAt || createdAt`. (2) Resolved tasks filter used `t.resolved` but Firestore stores `status: 'COMPLETED'` — fixed filter to check both. Switched `createdAt`/`updatedAt`/`endedAt` from Firestore `serverTimestamp()` to ISO strings to avoid read-before-write returning null.

Required creating a Firestore composite index (`participantIds` Arrays + `createdAt` Descending) — error message from Firestore included the exact creation URL.

## Verification

- Firestore round-trip test: write session + task, query back, confirm shape matches — PASS
- Live UI test: created room FU5YHH, voted task "Implement login flow", navigated to dashboard without ending session — session appeared with 1/1 resolved tasks and correct date
- Server restart: killed and restarted server, reloaded dashboard — session still present (Firestore, not memory)
- No errors in server console during history fetch

## Deviations

- `serverTimestamp()` removed entirely from firestore.js — switched to ISO strings throughout. Simpler and avoids async consistency issues on immediate reads.
- `admin` import removed from firestore.js (only `db` needed now)

## Known Limitations

- History query limit is 50 sessions — sufficient for now; pagination not implemented
- Firestore security rules still open — tighten before production
- The ordering query uses `createdAt` as an ISO string; lexicographic ordering works correctly for ISO 8601 strings

## Files Created/Modified

- `server/firestore.js` — added getHistoryByUserId; switched all timestamps to ISO strings; removed serverTimestamp import
- `server/store.js` — removed history Map, addHistory, getHistoryByUserId
- `server/handlers/roomHandlers.js` — imported getHistoryByUserId from firestore; replaced stub handler with async Firestore query
- `client/src/pages/Dashboard.jsx` — fixed date (endedAt || createdAt); fixed resolved filter (status === 'COMPLETED')

## Forward Intelligence

### What the next slice should know
- Firebase client SDK config (not Admin SDK) needed for S03 auth — different package: `firebase` (not `firebase-admin`), configured with web API key from Firebase console
- The existing `useProfile` hook stores userId as a UUID in localStorage — S03 must preserve this for guests; authenticated users get a Firebase UID that replaces it for Firestore queries
- Firestore security rules should be tightened in S03/S04: users should only read sessions where their UID or UUID is in participantIds

### What's fragile
- The `participantIds` array on session docs is updated on every join/leave — if a user joins late after the session was created, they get added. This is correct behavior but worth noting for auth linkage in S04.

### Authoritative diagnostics
- Firestore console → sessions collection is the source of truth
- Server stdout `[Firestore]` prefix catches all write/read failures
- Dashboard network tab: socket `get_user_history` event response contains the raw history array
