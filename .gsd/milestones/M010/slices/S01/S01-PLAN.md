# S01: Final Security & Cleanup

**Goal:** Implement remaining security-related audit items (SEC-06, SEC-09, SEC-12, QA-03, QA-09).

## Tasks

- [x] **T01: Implement Rate Limiting (SEC-06)** `est:30m`
- [x] **T02: Clean up Dependencies & Logs (SEC-12, QA-03)** `est:10m`
- [x] **T03: Improve CORS & Event Broadcasting (SEC-09, QA-09)** `est:15m`

## Verification Plan

- T01: Verify rate limiting by spamming `cast_vote` and `send_reaction`.
- T02: Verify `nodemon` moved to devDeps; verify reveal logs are gated.
- T03: Verify `room_settings_updated` sends full room object; verify prod CORS error if missing.
