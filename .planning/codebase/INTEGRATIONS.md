# External Integrations

**Analysis Date:** 2026-03-10

## APIs & External Services

**Avatars:**
- Dicebear - Avatar generation
  - SDK/Client: `@dicebear/core`, `@dicebear/collection` (avataaars style detected)

## Data Storage

**Databases:**
- In-memory store (`server/store.js`) - Current state (rooms, votes) is stored in memory.

**File Storage:**
- Local filesystem only - Assets stored in `client/src/assets`

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Custom - Session-based identity stored in `localStorage` (`banana_session_{roomId}`)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Server uses `console.log` for connection/disconnection and handler events.
- Client uses `console.log` for socket debugging.

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in project files.

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `PORT` (Server, default is 3000)

**Secrets location:**
- `.env` files (managed by `dotenv` on server).

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-03-10*
