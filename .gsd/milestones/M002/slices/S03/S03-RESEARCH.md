# S03 Research: Forms + Sheet + ToggleGroup

## Overview
Slice S03 focuses on migrating form-heavy components and the side panel (`TasksPane`) to shadcn/ui. This involves adding new shadcn primitives (`Sheet`, `Textarea`, `Select`, `ToggleGroup`, `Badge`) and updating `CreateRoom`, `GuestJoinModal`, `EditProfileModal`, `TasksPane`, and `PlayerAvatar`.

## Active Requirements
- **R105 (TasksPane uses shadcn Sheet):** Rebuild the hand-rolled `framer-motion` side panel using shadcn `Sheet`.
- **R107 (Room forms use shadcn primitives):** All inputs, textareas, and selects in room-facing forms must use shadcn components.
- **R108 (Role pickers use ToggleGroup):** Replace custom button-based role pickers with accessible `ToggleGroup` primitives.
- **R103 (Broken banana-* replacement):** Support the milestone goal by replacing `banana-*` and `orange-*` tokens with semantic `primary` tokens in all touched files.

## Technical Findings

### TasksPane Migration
- **Current State:** Uses `AnimatePresence` and `motion.div` with fixed positioning. It contains a single-task add form and a bulk-task add form (textarea).
- **Target State:** shadcn `Sheet` (based on Radix UI Dialog).
- **Complexity:** Need to ensure the `Sheet` content height and scroll behavior match the existing UX (scrollable list with fixed header/footer).
- **Tokens:** 11 `banana-` references and 11 `orange-` references to be replaced.

### CreateRoom Migration
- **Current State:** A standalone page with a central form. Uses raw `input`, `select`, and a custom `grid` for role selection.
- **Target State:** Use `Input`, `Label`, `Select`, and `ToggleGroup`.
- **Tokens:** 7 `banana-` references and 1 `orange-` reference to be replaced.
- **Custom Scale:** The custom scale logic (comma-separated values) needs to remain functional within the new shadcn `Input`.

### Role Pickers (ToggleGroup)
- **Files:** `CreateRoom.jsx` and `GuestJoinModal.jsx`.
- **Implementation:** `ToggleGroup` with `type="single"` to replace the manual `setRole` button logic.

### PlayerAvatar (Badge)
- **Current State:** Role labels are `span` elements with complex gradient classes.
- **Target State:** Replace with shadcn `Badge`.
- **Variants:** Need to define or use existing `Badge` variants for different roles (Estimator, Spectator, QA).

## Dependencies & Blockers
- **shadcn Components:** The following need to be added:
    - `sheet`
    - `textarea`
    - `select`
    - `toggle-group`
    - `badge`
- **Existing Components:** `input`, `label`, `button`, `separator`, `dialog` are already available.

## Verification Plan

### Automated
- `npm run build` in `client/` to ensure no TypeScript/import errors.
- `rg "banana-"` check on touched files to confirm zero remaining references.

### Manual / Integration
- Navigate to `/create`: Verify form rendering, role selection via `ToggleGroup`, and room creation flow.
- Open a Room:
    - Join via `GuestJoinModal`: Verify role selection.
    - Open `TasksPane`: Verify `Sheet` animation, list scrolling, and task addition (single and bulk).
    - Open `EditProfileModal`: Verify form inputs.
- Verify Light/Dark mode transitions on all new components.
- Confirm "claude blu 2" primary color (blue-indigo) is applied via semantic tokens.
