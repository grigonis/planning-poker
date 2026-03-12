---
estimated_steps: 4
estimated_files: 3
---

# T01: Install Card & Sonner primitives

**Slice:** S04 — Voting Overlay + Toasts
**Milestone:** M002

## Description

Add the necessary shadcn components for this slice and mount the global toast provider.

## Steps

1. Run `npx shadcn add card` in `client/`.
2. Run `npx shadcn add sonner` in `client/`.
3. Import `Toaster` in `client/src/App.jsx`.
4. Mount `<Toaster position="top-center" richColors />` at the top of the `App` component.

## Must-Haves

- [ ] `client/src/components/ui/card.jsx` (or .tsx) exists.
- [ ] `client/src/components/ui/sonner.jsx` (or .tsx) exists.
- [ ] `Toaster` is present in `App.jsx`.

## Verification

- Check file existence: `ls client/src/components/ui/card.jsx` and `ls client/src/components/ui/sonner.jsx`.
- Build check: `npm run build` (optional but good to check imports).
- Browser: Check if `<Toaster>` element is rendered in the DOM.

## Observability Impact

- Signals added/changed: Global toast provider available for all components.
- How a future agent inspects this: Check `App.jsx` for `Toaster` mount.
- Failure state exposed: None.

## Inputs

- `client/components.json` — shadcn configuration.

## Expected Output

- `client/src/components/ui/card.jsx` — Card primitive.
- `client/src/components/ui/sonner.jsx` — Sonner toast primitive.
- `client/src/App.jsx` — Updated with Toaster.
