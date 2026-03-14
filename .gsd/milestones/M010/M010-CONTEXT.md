# M010 — Polishing & Refinement

**Vision:** Close the gap on remaining security recommendations and improve code quality through refactoring and minor feature polish. This milestone moves the project from "feature complete" to "stable and maintainable".

## Success Criteria

- Rate limiting is implemented on critical socket events to prevent spam.
- `Room.jsx` is more maintainable through component/hook extraction.
- User-facing polish (keyboard shortcuts, CSV export) is implemented.
- Remaining low-priority audit items are resolved.

## Key Risks / Unknowns

- Rate limiting thresholds: Setting them too low might block fast-paced teams; setting them too high makes them useless.
- Refactoring `Room.jsx`: High risk of regressing complex socket state if not done methodically.

## Requirement Coverage

- Addresses remaining items from `AUDIT.md`.
- Improves DX for power users via shortcuts.
- Enables session data portability via CSV export.
