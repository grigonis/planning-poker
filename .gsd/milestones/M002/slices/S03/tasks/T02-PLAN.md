# Task Plan: T02 — Migrate CreateRoom.jsx

## Description
Migrate the `CreateRoom.jsx` page to use shadcn primitives for its form and role selection. Replace legacy `banana-` and `orange-` tokens with semantic `primary` tokens.

## Steps
1. Import `Input`, `Label`, `Select`, `ToggleGroup`, `Button`, `Card` (maybe), and `cn` from `src/lib/utils.ts`.
2. Replace the main form container with a layout using shadcn-like styling (or keep the current glassmorphism but use semantic tokens).
3. Replace the Name input with `Input` and `Label`.
4. Replace the Voting System selection with `Select`.
5. Replace the Role selection with `ToggleGroup`.
6. Replace the Submit button with `Button`.
7. Replace all `banana-` and `orange-` color classes with `primary` equivalents.
8. Verify the custom scale logic (comma-separated string to array) is preserved.

## Must-haves
- Uses `Input`, `Label`, `Select`, `ToggleGroup`, `Button` from `@/components/ui`.
- Zero `banana-` or `orange-` tokens in the file.
- Form validation (required name) still works.
- Room creation still works (emits `create_room` and navigates).

## Verification
- Manual check: Open `/create` in browser.
- Verify Role selection behaves as a single-select toggle.
- Verify Voting System dropdown renders correctly.
- Verify `rg "banana-" client/src/pages/CreateRoom.jsx` returns zero.

## Observability Impact
- Component renders in browser with correct theme colors.

## Inputs
- `client/src/pages/CreateRoom.jsx`

## Expected Output
- A fully themed shadcn-compatible room creation page.
