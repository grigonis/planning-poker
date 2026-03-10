# Testing & Validation

## Existing Tests
- **E2E Simulation**: `e2e_12_players.js` (Manual/Standalone script).
- **Automation Scripts**: Located in `.agent/scripts/`.
  - `checklist.py`: Priority-based project audit.
  - `lint_runner.py`: Code quality checks.
  - `test_runner.py`: Logical verification.
  - `ux_audit.py`: Interface compliance.

## Strategies
- **Manual Verification**: Encouraged for UI changes after visual updates.
- **Workflow Audits**: Use `checklist.py` before deployment.
- **Automated Performance**: `lighthouse_audit.py` for Vitals.

## Future Requirements
- Integration tests for socket handlers to prevent regressions in consensus logic.
- Unit tests for the consensus calculation utility in the Room dashboard.
