# Task Plan: T01 — Add shadcn Components

## Description
Add the missing shadcn primitives required for Slice S03: `sheet`, `textarea`, `select`, `toggle-group`, and `badge`.

## Steps
1. Run `npx shadcn@latest add sheet textarea select toggle-group badge` in `client/`.
2. Verify files are created in `client/src/components/ui/`.

## Must-haves
- `sheet.tsx`
- `textarea.tsx`
- `select.tsx`
- `toggle-group.tsx`
- `badge.tsx`
- All files must be in `client/src/components/ui/`.

## Verification
- `ls client/src/components/ui/` and check for the new files.
- `npm run build` (optional check for syntax errors in generated files).

## Observability Impact
- None (infrastructure step).

## Inputs
- `components.json` (already present).

## Expected Output
- New component files in `client/src/components/ui/`.
