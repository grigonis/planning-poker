# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Terminal 1 — server (auto-restarts via nodemon)
cd server && npm run dev

# Terminal 2 — client (Vite HMR at http://localhost:5173)
cd client && npm run dev
```

### Build & Lint
```bash
cd client && npm run build     # Vite production build → dist/
cd client && npm run lint      # ESLint, max-warnings 0
cd client && npm run preview   # Preview production build locally
```

### Server
```bash
cd server && npm start         # Production (node index.js)
```

No test suite exists currently.

## Architecture

### Monorepo Structure
```
client/   React 18 + Vite + Tailwind CSS v3 + shadcn/ui
server/   Node.js + Express + Socket.io (CommonJS)
```

The client and server have independent `node_modules` — install separately.

### Client (`client/src/`)

**Routing** — React Router v7 with four pages:
- `/` → `Landing.jsx` (marketing page)
- `/create` → `CreateRoom.jsx`
- `/dashboard` → `Dashboard.jsx` (requires auth)
- `/room/:roomId` → `Room.jsx` (core experience)

**Context providers** (wrap order in `App.jsx`): `ThemeProvider` → `AuthProvider` → `SocketProvider`

**Room page decomposition** — `Room.jsx` is thin; all logic is extracted into hooks:
- `useRoomState` — all room UI state (phase, votes, users, tasks, groups, etc.)
- `useRoomSocket` — registers all socket event listeners; syncs server state into `useRoomState`
- `useRoomHandlers` — emits socket events (vote, reveal, reset, kick, etc.)
- `useRoomModals` — open/close state for all dialogs
- `useKeyboardShortcuts` — keyboard bindings for voting and room actions

**Identity** — `useProfile` (`hooks/useProfile.js`) manages guest identity in localStorage under keys prefixed `keystimate_*`. A UUID is auto-generated on first visit. Firebase auth is optional; when signed in, the same UUID persists but a Firebase UID is also attached to the socket.

**Socket connection** — `SocketContext` waits for Firebase auth state to resolve, then connects once. It passes the Firebase `idToken` in `socket.handshake.auth` if signed in. Reconnect only triggers on actual identity change (sign-in / sign-out), not on Firebase User object refresh.

**shadcn/ui components** live in `components/ui/` and are generated/modified directly — treat them as project code, not vendor files.

### Server (`server/`)

**In-memory store** (`store.js`) — all live room state (`Map<roomId, RoomObject>`). Nothing in the store survives a server restart; session history is persisted to Firestore separately via `firestore.js`.

**Handler modules** — registered per socket connection in `index.js`:
- `handlers/roomHandlers.js` — create, join, leave, settings, kick
- `handlers/voteHandlers.js` — cast vote, reveal, reset
- `handlers/taskHandlers.js` — create, update, delete, select active task
- `handlers/groupHandlers.js` — manage voting groups

**Firebase Admin** (`firebase.js`) — initialized at startup; verifies ID tokens in the socket middleware. Upserts user records to Firestore on each connection when authenticated.

**Rate limiting** (`utils/rateLimiter.js`) — per-socket, per-event-type limits applied via `socket.checkRateLimit(eventName)` at the top of each handler.

**Room GC** — abandoned rooms (no connected users + >4h since last activity) are expired every 15 minutes.

### Design System

**Tailwind config** (`client/tailwind.config.js`):
- `darkMode: "class"` — dark mode via `dark` class on `<html>`
- Custom palettes: `carbon` (dark backgrounds), `silver` (neutral accents), `champagne` (editorial gold)
- shadcn semantic tokens (`background`, `foreground`, `primary`, etc.) use CSS variables with `oklch()`
- Custom animations: `marquee`, `blob`, `float-up`, `shimmer-slide`, `spin-around`

**Dark mode pattern**: `bg-white dark:bg-carbon-900 text-gray-900 dark:text-white`

**Path alias**: `@` resolves to `client/src/` (configured in `vite.config.js`).

### Environment Variables

Client (`client/.env`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_SERVER_URL`, `VITE_FIREBASE_EMAIL_LINK_URL`

Server (`server/.env`): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `PORT`, `CORS_ORIGIN`

`CORS_ORIGIN` is required in production — the server exits on startup if missing.
