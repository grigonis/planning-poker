# Coding Conventions

**Analysis Date:** 2026-03-10

## Naming Patterns

**Files:**
- React components use `.jsx` and PascalCase (e.g., `Navbar.jsx`, `Room.jsx`).
- Non-component files use `.js` and camelCase (e.g., `roomHandlers.js`, `store.js`).

**Functions:**
- camelCase (e.g., `submit-vote` for socket events, `registerRoomHandlers` for setup).

**Variables:**
- camelCase for local variables.
- UPPERCASE for constants (`PORT`, etc.).

**Socket.io Events:**
- kebab-case as a common convention for events (`create-room`, `join-room`, `submit-vote`, `room-update`).

## Code Style

**Formatting:**
- Prettier (configured via `.prettierrc` if present, currently standard 2-tab width observed).
- Standard JavaScript ESM for frontend (`import/export`).
- CommonJS for server (`require/module.exports`).

**Linting:**
- ESLint (v8.56.0) configured in `client/package.json`.
- Standard React/React-hooks recommendations.

## Import Organization

**Order:**
1. Built-in (e.g., `React`, `ReactDOM`)
2. External Libraries (`framer-motion`, `lucide-react`)
3. Context/Hooks (`SocketContext`, `ThemeContext`)
4. Internal Components/Pages
5. Assets/CSS

**Path Aliases:**
- None detected, using relative paths (`../../assets/...`).

## Error Handling

**Patterns:**
- Try-catch for async operations.
- Graceful fallbacks for missing data.
- Server-side logging for connection errors.

## Logging

**Framework:** `console.log` for development debugging.

**Patterns:**
- Connection/Disconnection events logged on server.
- Errors logged on server as they occur.

## Comments

**When to Comment:**
- Above complex logic or workaround (HACK/TODO).
- Explaining specific socket event requirements.

**JSDoc/TSDoc:**
- Minimal use currently, mainly standard comments.

## Function Design

**Size:** Preference for compact, focused handlers.

**Parameters:** Single object preferred for complex socket event data.

**Return Values:** Handlers typically return nothing but emit events back.

## Module Design

**Exports:**
- Named exports for hooks/context.
- Default exports for React components.
- Pattern-based module exports for server handlers.

---

*Convention analysis: 2026-03-10*
