# Task Plan: T03 — Migrate TasksPane.jsx to Sheet

## Description
Rebuild the `TasksPane` component using shadcn `Sheet`. This replaces the hand-rolled `framer-motion` panel with a more accessible and consistent side-sheet primitive.

## Steps
1. Replace `AnimatePresence` and `motion.div` with `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`.
2. Map `isOpen` and `onClose` to `Sheet`'s `open` and `onOpenChange` props.
3. Replace inputs/textareas with `Input` and `Textarea`.
4. Replace action buttons with shadcn `Button` variants.
5. Use `Badge` for status labels (e.g. "Currently Voting", "Score").
6. Replace all `banana-` and `orange-` tokens with `primary`.
7. Ensure the list of tasks is scrollable within the `SheetContent`.
8. Preserve host-only logic for adding/deleting tasks.

## Must-haves
- Uses `Sheet` primitive.
- Accessible (proper titles, focus trap).
- Zero `banana-` or `orange-` tokens.
- Bulk add (textarea) still works.
- Single add (input) still works.

## Verification
- Manual check: Open a room, open Tasks Pane.
- Verify add task, bulk add, delete task.
- Verify scrolling with many tasks.
- `rg "banana-" client/src/components/Room/TasksPane.jsx` returns zero.

## Observability Impact
- `Sheet` component should be visible in the accessibility tree.

## Inputs
- `client/src/components/Room/TasksPane.jsx`

## Expected Output
- A modernized tasks side panel using shadcn `Sheet`.
