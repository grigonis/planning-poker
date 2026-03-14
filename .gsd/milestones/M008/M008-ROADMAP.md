# M008 — Security Hardening

**Vision:** A production-ready server that validates all inputs, enforces host authority, and manages resources gracefully.

## Success Criteria

- All high-priority security findings from AUDIT.md are mitigated.
- Server-side string length caps are enforced on all user-supplied text.
- Host-only actions (settings, tasks, reveal) are protected by isHost checks.
- Async handlers have proper error boundaries to prevent hung callbacks.
- Abandoned rooms are automatically cleaned up to prevent memory leaks.

## Key Risks / Unknowns

- Rate limiting strategy — choosing a pattern that doesn't frustrate legitimate high-speed voting sessions.

## Slices

- [x] **S01: Server-side Hardening** `risk:high` `depends:[]`
  > After this: Host auth, input sanitization, and async error handling are implemented and verified.
- [x] **S02: Infrastructure & Rules** `risk:medium` `depends:[S01]`
  > After this: Firestore security rules are deployed and vite is updated to a secure version.

## Milestone Definition of Done

This milestone is complete only when all are true:

- All HIGH/MEDIUM security items in AUDIT.md are addressed.
- Verification scenarios for host takeover and oversized payloads pass.
- Firestore security rules are committed to the repo (SEC-13).
- No new regressions introduced in core voting/auth flows.
