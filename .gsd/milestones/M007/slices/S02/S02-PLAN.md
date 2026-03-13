---
estimated_steps: 10
estimated_files: 5
---

# S02: Dashboard Reads from Firestore

**Milestone:** M007 — Firebase Integration — Persistence & Optional Auth

## Goal

Dashboard history loads from Firestore. `get_user_history` socket handler queries `sessions` by `participantIds` array. `store.js` history Map and `addHistory` removed. History survives server restart and is visible in the UI.

## Tasks

- [ ] **T01: Add `getHistoryByUserId` Firestore query to `firestore.js`** `est:30m`
- [ ] **T02: Wire Firestore history query into `roomHandlers.js`; remove store.js dead code** `est:20m`
- [ ] **T03: Verify history appears in dashboard after server restart** `est:20m`

---

## T01: Add `getHistoryByUserId` Firestore query

### Steps
1. Add `getHistoryByUserId(userId)` to `server/firestore.js`:
   - Query: `db.collection('sessions').where('participantIds', 'array-contains', userId).orderBy('createdAt', 'desc').limit(50)`
   - For each session doc, fetch its `tasks` subcollection: `sessionDoc.ref.collection('tasks').get()`
   - Return array shaped to match what the dashboard currently expects:
     ```js
     {
       id, roomName, roomDescription, gameMode, votingSystem,
       participants, // array of { id, name, role, avatarSeed }
       tasks,        // array of { id, title, votes, status, resolvedAt }
       endedAt,      // ISO string or null (Firestore Timestamp → toDate().toISOString())
       createdAt,    // ISO string
     }
     ```
   - Convert Firestore Timestamps to ISO strings before returning (`.toDate().toISOString()`)
   - Wrap in try/catch — on error log and return `[]`
2. Export `getHistoryByUserId` from `firestore.js`

### Must-Haves
- [ ] Query uses `participantIds` array-contains (not participants object array)
- [ ] Tasks subcollection fetched per session
- [ ] Firestore Timestamps converted to ISO strings
- [ ] Returns `[]` on error — never throws

### Verification
- `node -e "require('dotenv').config(); const {getHistoryByUserId} = require('./firestore'); getHistoryByUserId('user-abc').then(r => { console.log('count:', r.length); process.exit(0); })"` runs without error

---

## T02: Wire into roomHandlers + remove store.js dead code

### Steps
1. In `server/handlers/roomHandlers.js`:
   - Import `getHistoryByUserId` from `../firestore`
   - Replace the stub `getUserHistoryHandler` with:
     ```js
     const getUserHistoryHandler = async ({ userId }, callback) => {
         if (!userId) return callback([]);
         const history = await getHistoryByUserId(userId);
         callback(history);
     };
     ```
2. In `server/store.js`:
   - Remove `const history = new Map()`
   - Remove `addHistory` function
   - Remove `getHistoryByUserId` function
   - Keep `rooms`, `createRoom`, `getRoom`, `deleteRoom`, `getActiveRoomsByUserId` — these are still used
3. In `server/handlers/roomHandlers.js` import line — remove `addHistory` and `getHistoryByUserId` from the store import (already removed in S01, verify it's clean)

### Must-Haves
- [ ] `getUserHistoryHandler` is async and awaits the Firestore query
- [ ] `store.js` no longer exports `history`, `addHistory`, or `getHistoryByUserId`
- [ ] No references to removed store exports anywhere in handlers

### Verification
- `grep -r "addHistory\|getHistoryByUserId" server/` returns only `firestore.js` (the new implementation)

---

## T03: End-to-end verification

### Steps
1. Start server + client
2. Create a room, add 2 tasks, vote and reveal each
3. Navigate to `/dashboard` — confirm session appears in history table with correct task count
4. Kill and restart server
5. Reload dashboard — history still shows (loaded from Firestore, not memory)
6. Vote a third task in an existing room — task count in history updates without ending session

### Must-Haves
- [ ] History visible in dashboard without ending session
- [ ] History survives server restart
- [ ] `endedAt` shows null for in-progress sessions (expected — only set on end_session)
- [ ] No errors in server console during history fetch

## Branch

`gsd/M007/S01` (continuing on same branch — will be included in the S01→S02 squash)
