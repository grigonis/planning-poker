# System Architecture

## Overview
Planning Poker is a real-time collaborative application using a Client-Server architecture with bidirectional communication via WebSockets.

## Communication Pattern
- **WebSocket (Socket.io)**: Primary channel for all game state updates, voting, and participant changes.
- **Event-Driven**: The server uses specialized handlers to process discrete events (Room creation, Voting, etc.).

## Components
### Frontend (Client)
- **Pages**: `Landing.jsx` for initialization, `Room.jsx` for active voting.
- **Context Managers**: 
  - `SocketContext.jsx`: Manages the lifecycle of the WebSocket connection.
  - `ThemeContext.jsx`: Manages dark/light mode state.
- **UI Components**: Atomic components using Tailwind CSS and Framer Motion for interactivity.

### Backend (Server)
- **Express App**: Serves as the base for the HTTP server and Socket.io initialization.
- **Store**: `store.js` implements a simple in-memory key-value store for active rooms and votes.
- **Handlers**:
  - `roomHandlers.js`: Manages room joining, creation, and user status.
  - `voteHandlers.js`: Handles estimate submissions, reveals, and resets.

## Data Flow
1. Client emits `join-room` event.
2. Server validates and updates in-memory store, then emits `room-update` to all clients in that room.
3. Client emits `submit-vote`.
4. Server store records vote and notifies peers.
5. Leader emits `reveal-votes`, server updates state and triggers reveal on all clients.
