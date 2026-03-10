# Codebase Structure

**Analysis Date:** 2026-03-10

## Directory Layout

```
planning-poker/
├── client/          # Frontend assets and logic
│   ├── src/         # Source code
│   │   ├── components/ # React components (home, Room, Voting, Results)
│   │   ├── pages/      # Page components (Landing, Room, CreateRoom)
│   │   ├── context/    # React context (Socket, Theme)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── assets/     # Images, SVGs, icons
│   │   └── data/       # Static data (e.g., config)
│   └── vite.config.js # Frontend build settings
├── server/          # Backend assets and logic
│   ├── handlers/    # Socket.io event handlers
│   ├── index.js     # Server entry point
│   ├── store.js     # In-memory shared data
│   └── package.json # Backend dependencies
├── .gemini/         # GSD system configuration and workflows
└── package.json    # Root manifest
```

## Directory Purposes

**client/src/components:**
- Purpose: Atomic and molecular UI components.
- Contains: `home/Navbar.jsx`, `Room/Table.jsx`, etc.
- Key files: `client/src/App.jsx`

**server/handlers:**
- Purpose: Business logic for real-time events.
- Contains: `roomHandlers.js` (creation, joining), `voteHandlers.js` (voting, revealing).

## Key File Locations

**Entry Points:**
- `client/src/main.jsx`: Frontend entry
- `server/index.js`: Server entry

**Configuration:**
- `client/tailwind.config.js`: Design tokens and Tailwind extensions
- `client/vite.config.js`: Vite build and server settings
- `server/package.json`: Server-side dependencies

**Core Logic:**
- `server/store.js`: Master in-memory state store for rooms and users
- `client/src/context/SocketContext.jsx`: Client-side socket connection and event mapping

## Naming Conventions

**Files:**
- Components: PascalCase (`RoomHeader.jsx`)
- Handlers/Utils: camelCase (`voteHandlers.js`)
- Pages: PascalCase (`Landing.jsx`)

**Directories:**
- camelCase or lowercase for module folders (`components`, `handlers`)

## Where to Add New Code

**New Feature (UI):**
- Primary code: `client/src/components/` or `client/src/pages/`
- Tests: Not currently standardized (standalone `e2e_12_players.js`)

**New Socket logic:**
- Implementation: `server/handlers/` for server-side, `client/src/context/SocketContext.jsx` for client mapping.

**Utilities:**
- Shared helpers: `client/src/lib/` or `client/src/hooks/` for frontend, new `server/utils/` for backend.

---

*Structure analysis: 2026-03-10*
