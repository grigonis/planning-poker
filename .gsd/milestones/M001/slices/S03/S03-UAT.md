# S03: Voting Scales Implementation - UAT

## UAT Type
- [x] Functional Verification
- [x] UI/UX Audit
- [x] Logic/Calculation Check

## Requirements Proved By This UAT
- VOTE-01: Default scale is Modified Fibonacci.
- VOTE-02: Average calculation correctly ignores ☕.
- VOTE-03: Switching between presets works.
- VOTE-04: Custom scale input works.
- VOTE-05: Lock mechanism prevents mid-vote changes.

## Not Proven By This UAT
- Persistence across server restarts (requires database/persistent storage not in scope for this slice).

## Test Cases

### 1. Default Scale & Room Creation
- **Action**: Open `/create`, enter name, and observe default voting system.
- **Expected**: "Modified Fibonacci (0, 0.5, 1... 21, ☕)" is pre-selected.
- **Result**: PASS

### 2. Average Calculation (Non-numeric exclusion)
- **Action**: Join a room, cast votes: `[1, 2, 3, ☕, 5]`. Reveal.
- **Expected**: Average is `(1+2+3+5)/4 = 2.75` (rounded to `2.8` based on implementation). `☕` is ignored.
- **Result**: PASS

### 3. Preset Switching
- **Action**: As Facilitator, open Settings, select "T-Shirt Sizes".
- **Expected**: Cards in Voting Overlay change to `[XS, S, M, L, XL, XXL]`.
- **Result**: PASS

### 4. Custom Scale Creation
- **Action**: As Facilitator, select "Custom Scale" in Settings, enter `1, 10, 100`. Apply.
- **Expected**: Cards in Voting Overlay change to `[1, 10, 100]`.
- **Result**: PASS

### 5. Mid-Vote Lock
- **Action**: Start a vote. Open Settings. Attempt to change voting system.
- **Expected**: An alert "Cannot change voting system while a round is in progress" appears. Selection is prevented.
- **Result**: PASS
