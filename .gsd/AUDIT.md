# Keystimate — Security & Code Quality Audit

_Generated: 2026-03-14_

---

## Executive Summary

Seven milestones shipped. App is functional and reasonably structured for a v1. Before any public/production use, address the HIGH items below — they are exploitable with basic socket knowledge. MEDIUM items should land in the next sprint. LOW items are polish.

**Competitor features to consider are listed at the end of this document.**

---

## Security Findings

### 🔴 CRITICAL

None that are exploitable without codebase access.

---

### 🟠 HIGH

#### SEC-02 — `update_room_settings` has no host authorization check
**File:** `server/handlers/roomHandlers.js:93`

Any connected socket can call `update_room_settings` with any valid `roomId` and mutate `votingSystem`, `roomName`, `anonymousMode`, `funFeatures`, `autoReveal`, `groupsEnabled`. The handler never calls `getUser()`.

**Fix:**
```js
const updateRoomSettingsHandler = ({ roomId, settings }) => {
    const result = getUser(socket);
    if (!result || !result.user.isHost) return;
    const { room } = result;
    // ... rest of handler
};
```

#### SEC-03 — `cast_vote` stores unvalidated arbitrary values
**File:** `server/handlers/voteHandlers.js:29`

`value` is stored directly without checking it against the room's `votingSystem.values`. A client can store any string (XSS payload, multi-MB string) into `room.votes`. The value is then broadcast to all room participants.

**Fix:**
```js
const SPECIAL_VALUES = ['☕', '?', '∞'];
const castVoteHandler = ({ roomId, value }) => {
    // ... getUser, spectator check ...
    const allowed = [...room.votingSystem.values.map(String), ...SPECIAL_VALUES];
    if (!allowed.includes(String(value))) return; // reject unknown values
    room.votes.set(userId, value);
    // ...
};
```

#### SEC-04 — `join_room` allows userId spoofing / host takeover
**File:** `server/handlers/roomHandlers.js:117–143`

If a client sends a `join_room` with another user's `userId`, they reconnect as that user — including inheriting `isHost: true` if the userId belongs to the host. No token links a `userId` to a socket.

**Mitigation (without full auth):** At minimum, refuse reconnect if the existing user has a different `name` and `connected: true`. Long-term: issue a signed reconnect token on `create_room`/`join_room` and require it on reconnect.

#### QA-07 — `bulk_create_tasks` has no input length cap
**File:** `server/handlers/taskHandlers.js:30`

`titles.split('\n')` with no limit. A 10,000-newline payload creates 10,000 task objects in memory and broadcasts them to all participants.

**Fix:** Add a cap before splitting:
```js
const MAX_BULK_TASKS = 200;
const MAX_TITLE_LEN = 500;
const newTasks = titles.slice(0, 20_000).split('\n')
    .map(t => t.trim().slice(0, MAX_TITLE_LEN))
    .filter(Boolean)
    .slice(0, MAX_BULK_TASKS)
    .map(title => ({ id: uuidv4(), title, votes: null, status: 'PENDING' }));
```

---

### 🟡 MEDIUM

#### SEC-05 — `send_reaction` doesn't verify caller's room membership
**File:** `server/handlers/roomHandlers.js:208`

Handler accepts `roomId` from payload, but doesn't verify `socket.data.roomId === payload.roomId`. A socket connected to room A can emit reactions to room B.

**Fix:** Add `if (socket.data.roomId !== roomId) return;` at the top.

#### SEC-06 — No rate limiting on socket events
No rate limiting on `create_room`, `join_room`, `cast_vote`, `send_reaction`, or `bulk_create_tasks`.

**Fix:** Add `socket.io-rate-limiter` or a simple token bucket per socket:
```js
// Simple approach — add to connection handler
const rateLimits = new Map(); // eventName -> { count, resetAt }
function rateLimit(eventName, max, windowMs) {
    const now = Date.now();
    const entry = rateLimits.get(eventName) ?? { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
    entry.count++;
    rateLimits.set(eventName, entry);
    return entry.count <= max;
}
// In handler: if (!rateLimit('cast_vote', 30, 10_000)) return;
```

#### SEC-07 — No string length caps on any input field
`roomName`, `roomDescription`, `name`, `avatarSeed`, task `title`, group `name` — all have no server-side length limit.

**Fix:** Add a central sanitize helper:
```js
const sanitize = (str, maxLen = 200) =>
    typeof str === 'string' ? str.trim().slice(0, maxLen) : '';
```
Apply in every handler that accepts string input.

#### SEC-08 — Rooms never expire — memory leak / DoS
**File:** `server/store.js`

Rooms created and abandoned (host closes tab) persist forever. On moderate load this is a memory exhaustion vector.

**Fix:** Add a TTL cleanup sweep (add to `server/index.js`):
```js
const ROOM_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomId) => {
        const anyConnected = [...room.users.values()].some(u => u.connected);
        if (!anyConnected && now - (room.lastActivity ?? 0) > ROOM_TTL_MS) {
            rooms.delete(roomId);
            console.log(`[GC] Room ${roomId} expired`);
        }
    });
}, 15 * 60 * 1000); // check every 15 min
```
Also update `lastActivity = Date.now()` on every write operation.

#### QA-01 — Async handlers missing try/catch
**File:** `server/handlers/roomHandlers.js:257, 274, 285`

`getUserHistoryHandler`, `linkGuestUidHandler`, and `loadUserProfileHandler` are `async` but have no top-level try/catch. An unexpected Firestore error leaves the client callback hanging indefinitely.

**Fix:** Wrap each in try/catch:
```js
const getUserHistoryHandler = async ({ userId }, callback) => {
    try {
        if (socket.firebaseUid) {
            return callback(await getHistoryByFirebaseUid(socket.firebaseUid));
        }
        if (!userId) return callback([]);
        callback(await getHistoryByUserId(userId));
    } catch (err) {
        console.error('[getUserHistory] failed:', err.message);
        callback([]);
    }
};
```

#### QA-06 — RoomId collision not handled
**File:** `server/handlers/roomHandlers.js:21`

6-char base-36 code has ~2.2B possibilities, but no collision check. A new room can silently overwrite an existing live room.

**Fix:**
```js
let roomId;
do { roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); }
while (rooms.has(roomId));
```

#### QA-11 — SocketContext spurious reconnects on auth object identity changes
**File:** `client/src/context/SocketContext.jsx:51`

The effect depends on `authUser` (an object). Firebase re-creates this object on minor state changes, triggering socket reconnects even when auth status didn't change. Use `authUser?.uid` as the dependency instead.

#### QA-13 — New `AudioContext` on every vote event
**File:** `client/src/pages/Room.jsx:227–246`

A new `AudioContext` is instantiated on every `vote_update` event. Browsers limit concurrent AudioContexts (typically 6–32). After the limit, audio silently fails.

**Fix:** Create one `AudioContext` at component mount and reuse it:
```js
const audioCtxRef = useRef(null);
useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => audioCtxRef.current?.close();
}, []);
// In vote handler: use audioCtxRef.current instead of new AudioContext()
```

---

### 🟢 LOW / INFORMATIONAL

| ID | Issue | Fix |
|---|---|---|
| SEC-01 | Private key `.env` format bleeds past `sed` redaction in CI | Document double-quote wrapping in `.env.example`: `FIREBASE_PRIVATE_KEY="-----BEGIN..."` |
| SEC-09 | CORS fallback to localhost is silent in prod | `if (!process.env.CORS_ORIGIN && process.env.NODE_ENV === 'production') throw new Error('CORS_ORIGIN required in production')` |
| SEC-11 | Email in localStorage for magic link | Acceptable; clear it after successful sign-in |
| SEC-12 | `nodemon` in `dependencies` not `devDependencies` | Move to `devDependencies` in `server/package.json` |
| SEC-13 | No Firestore security rules in repo | Add `firestore.rules` and `firebase.json`; commit them |
| QA-03 | Verbose JSON log on every reveal with groups | Gate behind `DEBUG` env var |
| QA-08 | `revote_partial` emitted by client, no server handler | Remove dead emit from `Room.jsx:471` or implement the handler |
| QA-09 | `room_settings_updated` echoes unvalidated client payload | Broadcast `room` state after update, not the raw `settings` payload |
| QA-10 | `getActiveRoomsByUserId` is O(R×U) | Fine now; add user→rooms reverse index if room count grows |
| QA-12 | `Room.jsx` is 734 lines | Extract socket event handlers and modal state into custom hooks |

---

## Dependency Updates Needed

| Package | Current | Action |
|---|---|---|
| `vite` (client) | `^5.1.0` | Update to `^5.4.15` or `^6.x` — **moderate vulnerability** |
| `nodemon` (server) | in `dependencies` | Move to `devDependencies` |
| `firebase-admin` (server) | `^13.7.0` | 8 low transitive vulns — monitor; no action urgent |

---

## Priority Fix Order

1. **SEC-02** — host auth check on `update_room_settings` (5 min fix)
2. **QA-07** — bulk_create_tasks input cap (5 min fix)
3. **SEC-03** — cast_vote value whitelist (15 min fix)
4. **SEC-05** — reaction roomId membership check (5 min fix)
5. **QA-06** — roomId collision check (2 min fix)
6. **QA-01** — async handler try/catch (15 min fix)
7. **QA-13** — AudioContext singleton (10 min fix)
8. **SEC-06** — rate limiting (30 min — needs a pattern decision)
9. **SEC-07** — string length caps (20 min)
10. **SEC-08** — room TTL cleanup (20 min)
11. **SEC-13** — Firestore security rules (1–2 hours)
12. **Deps** — vite update (5 min)

---

## Feature Ideas — Competitor Research

Based on what's standard across tools like PlanITPoker, PointingPoker, EasyRetro, Jira's built-in poker, and Miro's estimation:

### High Impact (differentiated)
| Feature | Rationale |
|---|---|
| **Timer per voting round** | Standard in top tools; host sets countdown (e.g. 90s), pressure-reveals at 0. Increases meeting velocity. |
| **Jira / Linear integration** | Import user stories directly from Jira/Linear; write estimate back after reveal. Major adoption driver for teams. |
| **Voting confidence indicator** | Alongside card value, voters also indicate confidence (low/medium/high). Surfaces uncertain estimates visually. |
| **Consensus threshold alert** | Auto-highlight when all votes are within 1 Fibonacci step — "consensus reached" banner; host can reveal with one click. |
| **Estimation velocity dashboard** | Per-session metrics: avg time per story, most debated stories (wide vote spread), historical trend. |
| **Async mode** | Host creates a room, team votes on their own time, host reviews at next standup. No live coordination needed. |

### Medium Impact (table stakes)
| Feature | Rationale |
|---|---|
| **Custom card values** | Allow hosts to define arbitrary scales (XS/S/M/L/XL, hours, days). Already partially there with `votingSystem`. |
| **Observer/spectator controls** | Spectators currently exist but aren't surfaced as a first-class role in the UI with proper join flow. |
| **Vote change before reveal** | Let voters change their card before the host reveals. Many tools allow this. |
| **Keyboard shortcuts** | Select cards with 0-9/F-keys; host reveal/reset without mouse. Power user retention. |
| **Session export (CSV/PDF)** | Export task list with estimates after session. Easy win; no backend work if done client-side. |
| **Sticky reconnect with state** | If server restarts, restore room from Firestore on reconnect (rooms currently live only in memory). |
| **Room password / access control** | Private rooms for sensitive estimation. |

### Low Impact / Polish
| Feature | Rationale |
|---|---|
| **Light mode** | Large segment of users work in light mode. |
| **Notification sounds selector** | Let users choose/mute sounds. |
| **Vote history within session** | Show previous rounds' votes in a collapsible history panel. |
| **Mobile app (PWA)** | Add `manifest.json` and service worker; makes mobile use much better. |
| **Localization (i18n)** | Not needed until growth, but worth an early architecture decision. |

---

## Next Recommended Milestone

**M008 — Security Hardening** (1-2 day effort):
- SEC-02, SEC-03, SEC-05, QA-07, QA-06, QA-01, QA-13 (all quick fixes)
- SEC-06 rate limiting
- SEC-07 string length validation
- SEC-08 room TTL
- SEC-13 Firestore security rules
- Dep update: vite

Followed by **M009** (choose one): Timer feature, Jira integration, or Session export.
