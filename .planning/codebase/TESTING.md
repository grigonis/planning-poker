# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Runner:**
- Playwright (standalone script)
- Config: Standalone in `e2e_12_players.js`

**Assertion Library:**
- Playwright's built-in `expect` or direct logic.

**Run Commands:**
```bash
node e2e_12_players.js # Run the 12-player E2E test
```

## Test File Organization

**Location:**
- Separate, currently in the root directory.

**Naming:**
- Currently `e2e_12_players.js`.

**Structure:**
```
[project-root]/
└── e2e_12_players.js
```

## Test Structure

**Suite Organization:**
```javascript
import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    // Host setup
    // Client setup in loop
    // Verification logic
    await browser.close();
})();
```

**Patterns:**
- **Concurrent Contexts:** Spawning multiple browser contexts to simulate 12 players without sharing `localStorage`.
- **Host vs Guest:** One page acts as the room creator, others as participants.
- **Visual Verification:** Takes a screenshot of the host view after everyone joins (`test_asset.png`).

## Mocking

**Framework:** None currently used for unit testing.

**Patterns:**
- No mocks for server side, using real local server on port 3000.

**What to Mock:**
- External APIs (not currently present) should be mocked.
- Socket.io connections should be mocked for unit tests.

## Fixtures and Factories

**Test Data:**
- Simple strings (`Host`, `Player 1`, etc.).

**Location:** Inline within the test scripts.

## Coverage

**Requirements:** None enforced currently.

**View Coverage:**
- Not configured.

## Test Types

**Unit Tests:**
- None detected in `client` or `server`.

**Integration Tests:**
- Socket event handlers are currently not separately integration tested.

**E2E Tests:**
- Playwright is used for the 12-player simulation.

## Common Patterns

**Async Testing:**
- `await` on every page action and navigation.
- `waitForURL` for room entry confirmation.

**Error Testing:**
- Minimal, relies on timeout catch for element rendering.

---

*Testing analysis: 2026-03-10*
