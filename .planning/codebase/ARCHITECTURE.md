# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Client-Server Real-time Sync (Monorepo)

**Key Characteristics:**
- **Real-time Event-Driven:** Socket.io for all game state updates.
- **State-Synchronized:** Client state is pushed to server and broadcasted to other clients in the room.
- **In-Memory Store:** Server maintains room and vote state in a simple JS object `server/store.js`.

## Layers

**Client (Frontend):**
- Purpose: UI/UX, user interaction, state display
- Location: `client/src`
- Contains: React components, hooks, context (SocketContext)
- Depends on: Socket.io Client, Tailwind, Framer Motion
- Used by: End users

**Server (Backend):**
- Purpose: State management, cross-client coordination
- Location: `server/`
- Contains: Express server, Socket.io handlers, memory store
- Depends on: Express, Socket.io, UUID
- Used by: Client application

## Data Flow

**Voting Flow:**

1. User clicks a card in `VotingArea.jsx` or similar component.
2. `socket.emit('submit-vote', { roomId, userId, vote })` is called via `SocketContext`.
3. Server receives event in `voteHandlers.js`.
4. Server updates `store.rooms[roomId].players[userId].vote`.
5. Server calls `io.to(roomId).emit('room_update', updatedRoom)`.
6. All clients in the same room receive updated state and re-render.

**State Management:**
- **Global:** Managed at the server via `server/store.js`.
- **Client Sync:** Provided via `SocketContext` which listens for `room_update` events.

## Key Abstractions

**SocketContext:**
- Purpose: Provides a hooks-based interface to the server events.
- Examples: `client/src/context/SocketContext.jsx`

**Handlers:**
- Purpose: Decouples server event logic into themed modules (Room, Vote).
- Examples: `server/handlers/roomHandlers.js`, `server/handlers/voteHandlers.js`

## Entry Points

**Frontend Entry:**
- Location: `client/src/main.jsx`
- Triggers: Browser page load
- Responsibilities: Render React app, setup Context providers

**Server Entry:**
- Location: `server/index.js`
- Triggers: `npm run dev` or `npm start`
- Responsibilities: Setup HTTP server, Socket.io server, register event handlers

## Error Handling

**Strategy:** Graceful degradation, alerting user via UI.

**Patterns:**
- Console logging (Server)
- Local UI error state (not fully audited, typically fallback to room recovery)

## Cross-Cutting Concerns

**Authentication:** Handled via room-specific user session in localStorage.
**Validation:** Handled in handlers (e.g., checking if room exists).

---

*Architecture analysis: 2026-03-10*
