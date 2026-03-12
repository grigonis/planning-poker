# Slice S03: Forms + Sheet + ToggleGroup — Milestone M002

Slice S03 focuses on migrating form-heavy components and the side panel (`TasksPane`) to shadcn/ui. This involves adding new shadcn primitives (`Sheet`, `Textarea`, `Select`, `ToggleGroup`, `Badge`) and updating `CreateRoom`, `GuestJoinModal`, `JoinSessionModal`, `TasksPane`, and `PlayerAvatar`.

## Active Requirements
- **R105 (TasksPane uses shadcn Sheet):** Rebuild the hand-rolled `framer-motion` side panel using shadcn `Sheet`.
- **R107 (Room forms use shadcn primitives):** All inputs, textareas, and selects in room-facing forms must use shadcn components.
- **R108 (Role pickers use ToggleGroup):** Replace custom button-based role pickers with accessible `ToggleGroup` primitives.
- **R103 (Broken banana-* replacement):** Support the milestone goal by replacing `banana-*` and `orange-*` tokens with semantic `primary` tokens in all touched files.

## Proof Level: Integration Verification
This slice proves that the core form and navigation surfaces of the room experience are fully integrated with the shadcn design system. Success is defined by a working room creation flow, a functional tasks side panel, and accessible role selection, all using semantic tokens.

## Integration Closure
- **Wiring introduced:**
    - `Sheet` (Radix) integrated for `TasksPane`.
    - `ToggleGroup` integrated for role selection in 3 components.
    - `Select` integrated for voting system configuration.
    - `Badge` integrated for player roles.
- **Remaining work:**
    - Voting Overlay (Card) migration (S04).
    - Toasts and Alert replacing window.alert (S04).
    - Unified Navbar (S05).

## Observability / Diagnostics
- **Form State:** Verify `ToggleGroup` and `Select` correctly update local state via browser devtools or console logs.
- **Accessibility:** Inspect `Sheet` and `ToggleGroup` for correct ARIA attributes and focus management.
- **Token Check:** Run `rg` to ensure no `banana-` tokens remain in the migrated files.

## Tasks

### T01: Add shadcn Components
- **Why:** Provide the necessary primitives for the migration.
- **Files:** `client/src/components/ui/`
- **Do:** Add `sheet`, `textarea`, `select`, `toggle-group`, `badge` using `npx shadcn add`.
- **Verify:** Components are present in `src/components/ui/`.
- **Done when:** `ls client/src/components/ui/` shows the new files.

### T02: Migrate CreateRoom.jsx
- **Why:** Bring the room creation form into the design system (R107, R108).
- **Files:** `client/src/pages/CreateRoom.jsx`
- **Do:**
    - Replace raw inputs/labels/selects with shadcn primitives.
    - Implement `ToggleGroup` for role selection.
    - Replace `banana-*` and `orange-*` with semantic `primary` tokens.
    - Update styling to match shadcn "claude blu 2" theme.
- **Verify:** Room creation works; custom scale input still functions; role selection is visual and correct.
- **Done when:** `CreateRoom.jsx` uses shadcn components and no `banana-` tokens remain.

### T03: Migrate TasksPane.jsx to Sheet
- **Why:** Modernize the side panel with an accessible primitive (R105).
- **Files:** `client/src/components/Room/TasksPane.jsx`
- **Do:**
    - Replace `AnimatePresence`/`motion.div` with `Sheet`.
    - Use `Input`, `Textarea`, `Button`, `Badge` inside the sheet.
    - Replace all `banana-` and `orange-` tokens with `primary`.
    - Maintain existing list scrolling and host-only controls.
- **Verify:** Side panel opens/closes with correct animation; tasks can be added (single/bulk); scrolling works.
- **Done when:** `TasksPane.jsx` is rebuilt with `Sheet` and is visually consistent with the theme.

### T04: Update Role Pickers and Avatars
- **Why:** Unify role selection and display across the app (R108, R103).
- **Files:**
    - `client/src/components/GuestJoinModal.jsx`
    - `client/src/components/JoinSessionModal.jsx`
    - `client/src/components/Room/PlayerAvatar.jsx`
- **Do:**
    - Replace manual role buttons with `ToggleGroup` in modals.
    - Replace role `span` in `PlayerAvatar` with `Badge`.
    - Replace remaining `banana-` tokens in these files.
- **Verify:** Role selection works in both modals; PlayerAvatar displays the correct role badge.
- **Done when:** Role-related UI uses shadcn primitives and semantic tokens.

### T05: Verification and Build
- **Why:** Ensure no regressions or broken imports.
- **Files:** All touched files.
- **Do:**
    - Run `npm run build` in `client/`.
    - Run `rg "banana-"` on touched files.
    - Manual walkthrough of the create/join/task flow in browser.
- **Verify:** Build passes; zero `banana-` hits in room scope.
- **Done when:** Milestone S03 is fully verified.
