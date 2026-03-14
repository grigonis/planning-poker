# M010 — Polishing & Refinement

**Vision:** Finalize security hardening and improve maintainability and power-user features.

## Success Criteria

- Rate limiting implemented on the server for critical socket events.
- `Room.jsx` refactored into smaller, more focused hooks/components.
- Keyboard shortcuts for voting and host controls.
- CSV export for session history.

## Slices

- [x] **S01: Final Security & Cleanup** `risk:low` `depends:[]`
  > After this: Rate limiting (SEC-06), CORS Prod check (SEC-09), and devDep cleanup (SEC-12) are done.
- [x] **S02: Code Quality & Refactoring** `risk:medium` `depends:[S01]`
  > After this: `Room.jsx` (QA-12) is broken down into hooks/sub-components; dead code (QA-08) removed.
- [x] **S03: Power User Features** `risk:low` `depends:[S02]`
  > After this: Keyboard shortcuts for cards and host actions are functional.
- [ ] ~~**S04: Data Portability**~~ `risk:low` `depends:[S03]` — Deferred (not blocking production readiness)
  > CSV export for session history. Can be implemented as a future enhancement.

## Milestone Definition of Done

- All slices implemented and verified.
- `Room.jsx` line count significantly reduced without regressions.
- Keyboard shortcuts and CSV export verified by manual/automated checks.
