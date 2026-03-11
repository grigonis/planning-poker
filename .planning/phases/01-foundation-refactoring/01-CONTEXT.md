# Phase 1: Foundation Refactoring - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the dedicated `/create` page with the app environment, removing the modal from the landing, and completely removing legacy split-mode code.
</domain>

<decisions>
## Implementation Decisions

### Empty State Background
- The `/create` page will show the full Room app layout with the table empty, keeping the immersion high. The background will be beautifully blurred/dimmed or out of focus, pushing full focus onto the creation form itself.

### Landing Page Transition
- Instant client-side route transition from `/` to `/create` with a smooth fade, reusing existing Framer Motion capabilities.

### Split Mode Cleanup
- Completely nuke all split-mode logic, metrics, averages, and UI labels. Simplify the entire codebase to only support standard, single-metric averages.

### Claude's Discretion
- Exact styling of the "out of focus" visual effect on the table.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Framer Motion` for the fade transitions.
- Existing `Room.jsx` layout can be adapted to show the "empty state" behind the modal.

### Established Patterns
- Single Page App routing using React Router.

### Integration Points
- `client/src/pages/Landing.jsx` (remove modal)
- `client/src/pages/Room.jsx` (adapt for background)
- `server/handlers/voteHandlers.js` (refactor averages)
</code_context>

<specifics>
## Specific Ideas
- "beautifully removed focus from the table, and full focus on creation"
</specifics>

<deferred>
## Deferred Ideas
None — discussion stayed within phase scope
</deferred>

---

*Phase: 01-foundation-refactoring*
*Context gathered: 2026-03-10*
