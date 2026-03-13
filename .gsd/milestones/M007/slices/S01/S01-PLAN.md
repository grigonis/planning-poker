---
estimated_steps: 14
estimated_files: 7
---

# S01: Firebase Setup & Per-Task Firestore Writes

**Milestone:** M007 — Firebase Integration — Persistence & Optional Auth

## Goal

Firebase Admin SDK running on the server. Every time a vote is revealed with an active task, that task result is written to Firestore in real time. Session metadata (room info, participants) is kept in sync throughout the room lifecycle. Server restart loses no voted task data.

## Tasks

- [ ] **T01: Install Firebase Admin SDK & initialize from env vars** `est:30m`
- [ ] **T02: Build `server/firestore.js` service module** `est:45m`
- [ ] **T03: Wire Firestore writes into socket handlers** `est:60m`
- [ ] **T04: Verify end-to-end — vote a task, check Firestore console** `est:20m`

---

## T01: Install Firebase Admin SDK & initialize from env vars

### Steps
1. `cd server && npm install firebase-admin`
2. Create `server/firebase.js` — initialize Admin SDK from `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` env vars
3. Export `db` (Firestore instance) and `admin` singleton
4. Handle `FIREBASE_PRIVATE_KEY` newline escaping (`\\n` → `\n`) that happens when env vars are passed as strings
5. Guard: if env vars missing, log a clear error and throw — don't silently fail
6. Require `server/firebase.js` in `server/index.js` early (before handlers) so initialization errors surface at startup

### Must-Haves
- [ ] `firebase-admin` installed in `server/package.json`
- [ ] `server/firebase.js` exports `db` and `admin`
- [ ] Private key newline issue handled
- [ ] Missing env var throws with a descriptive message at startup
- [ ] `server/.env` in `.gitignore` (verify, add if missing)

### Verification
- `cd server && node -e "const {db} = require('./firebase'); console.log('Firestore ready:', !!db)"` prints `Firestore ready: true`

---

## T02: Build `server/firestore.js` service module

### Steps
1. Create `server/firestore.js` with four async functions:
   - `upsertSession(room)` — set `sessions/{roomId}` with room metadata + participants array; use `{ merge: true }` so repeated calls don't overwrite tasks subcollection
   - `upsertTask(roomId, task, participants)` — set `sessions/{roomId}/tasks/{taskId}` with task result + participant snapshot at reveal time
   - `updateParticipants(roomId, participants)` — update `sessions/{roomId}.participants` array
   - `closeSession(roomId)` — update `sessions/{roomId}.endedAt` to now
2. Document shapes (exact fields):
   - Session: `{ id, roomName, roomDescription, gameMode, votingSystem, hostId, createdAt, updatedAt, endedAt, participants[] }`
   - Task: `{ id, title, votes, status, resolvedAt, participants[] }` — participants is the snapshot of who voted at reveal time
3. All functions: wrap in try/catch, log errors but do NOT throw — write failures must not crash the socket handler
4. Export all four functions

### Must-Haves
- [ ] `upsertSession` uses `merge: true` (safe to call multiple times)
- [ ] `upsertTask` captures participant snapshot at reveal time (who was in the room)
- [ ] All functions swallow errors with `console.error` — never throw
- [ ] Firestore timestamps use `admin.firestore.FieldValue.serverTimestamp()` for `createdAt`

### Verification
- Module loads without error: `node -e "require('./firestore'); console.log('ok')"`
- Shapes match the S01→S02 boundary contract in the roadmap

---

## T03: Wire Firestore writes into socket handlers

### Steps

**`roomHandlers.js`:**
1. Import `{ upsertSession, updateParticipants, closeSession }` from `../firestore`
2. In `createRoomHandler`: after room is created in memory, call `upsertSession(room)` (fire-and-forget with `.catch`)
3. In `joinRoomHandler`: after user added, call `updateParticipants(roomId, participantsArray)` 
4. In `disconnectHandler` and `leaveRoomHandler`: call `updateParticipants` after user removed
5. In `endSessionHandler`: call `closeSession(roomId)` before deleting from memory; remove the old `addHistory()` call

**`voteHandlers.js`:**
1. Import `{ upsertTask }` from `../firestore`
2. In `performReveal`: after task `status` is set to `'COMPLETED'` and `task.votes` is set, call:
   ```js
   upsertTask(roomId, task, participantSnapshot)
   ```
   where `participantSnapshot` is `Array.from(room.users.values()).map(u => ({ id: u.id, name: u.name, role: u.role, avatarSeed: u.avatarSeed }))`
3. The call is fire-and-forget: `upsertTask(...).catch(err => console.error('Firestore upsertTask failed:', err))`
4. Keep all existing in-memory logic unchanged — Firestore write is additive

### Must-Haves
- [ ] `performReveal` writes to Firestore only when `room.activeTaskId` is set (task was selected)
- [ ] `upsertSession` called on room creation
- [ ] `closeSession` called on room end (replaces `addHistory`)
- [ ] All Firestore calls are fire-and-forget — no `await` in socket handlers (non-blocking)
- [ ] Existing in-memory room state untouched — no behavior change for the live room

### Observability Impact
- Signals added: `console.error('Firestore upsertTask failed:', err)` on write failure
- How a future agent inspects this: check Firebase console → Firestore → `sessions` collection; server logs on failure
- Failure state exposed: write failures logged to stdout; room continues normally

---

## T04: Verify end-to-end

### Steps
1. Start server (`npm run dev` in `server/`)
2. Start client (`npm run dev` in `client/`)
3. Create a room, add a task, select it, have participants vote, reveal
4. Open Firebase console → Firestore → `sessions` collection
5. Verify: `sessions/{roomId}` document exists with correct metadata
6. Verify: `sessions/{roomId}/tasks/{taskId}` document exists with `votes`, `status: COMPLETED`, `resolvedAt`
7. Restart server — documents still present in Firestore
8. Vote another task — new document appears without restarting

### Must-Haves
- [ ] Task document visible in Firestore immediately after reveal (before ending session)
- [ ] Server restart does not lose any task documents
- [ ] No errors in server console during normal voting flow
- [ ] Room still functions normally after Firestore write (no latency or crash)

## Branch

`gsd/M007/S01`
