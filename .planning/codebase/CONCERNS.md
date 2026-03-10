# Codebase Concerns

**Analysis Date:** 2026-03-10

## Tech Debt

**In-Memory Store:**
- Issue: `server/store.js` is an ephemeral object. Restarts or crashes wipe all active rooms and sessions.
- Files: `server/store.js`
- Impact: Users lose all session state upon server reload. No persistence.
- Fix approach: Add Redis or a persistent database (Postgres/Mongo) for room state.

**Socket Event Naming:**
- Issue: Events like `submit-vote` and `room_update` use different naming styles (`-` vs `_`).
- Files: `server/handlers/`, `client/src/context/SocketContext.jsx`
- Impact: Inconsistent Developer Experience (DX).
- Fix approach: Standardize all events (e.g., kebab-case or camelCase).

## Known Bugs

**User Reconnection:**
- Symptoms: Disconnecting doesn't automatically cleanup or "grey out" users in `server/index.js` (TODO noted).
- Files: `server/index.js`
- Impact: Stale players in the room or inability to reconnect with same name.
- Fix approach: Implement heartbeat or disconnect cleanup logic in `index.js`.

## Security Considerations

**CORS Settings:**
- Risk: `origin: "*"` used in `server/index.js` for simplicity.
- Files: `server/index.js`
- Current mitigation: None.
- Recommendations: Restrict to actual production domain once deployed.

**Auth Stored as JSON:**
- Risk: `banana_session_{roomId}` in localStorage stores metadata without tokens.
- Files: `client/src/pages/Room.jsx` (presumed location)
- Current mitigation: None (MVP only).
- Recommendations: Use signed cookies or JWTs for real session integrity.

## Performance Bottlenecks

**Large Room Broadcasts:**
- Problem: Sending the ENTIRE room object on every vote update.
- Files: `server/handlers/voteHandlers.js`
- Cause: Simple state sync.
- Improvement path: Send deltas or only updated properties.

## Fragile Areas

**Socket Handlers Wiring:**
- Files: `server/index.js`
- Why fragile: Handlers are manually registered per connection. Circular dependencies between room and vote handlers possible if they both need to reference the store or IO.
- Safe modification: Move handlers into a central registry or use classes.

---

*Concerns audit: 2026-03-10*
