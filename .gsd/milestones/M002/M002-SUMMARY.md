---
id: M002
provides:
  - Full shadcn/ui migration for all room-facing components
  - Unified "claude blu 2" theme across the application
  - Accessible dialogs, sheets, and forms using Radix primitives
  - Non-blocking toast notifications replacing browser alerts
  - Semantic token-based design system replacing broken legacy tokens
key_decisions:
  - D009: Used "claude blu 2" (blue-indigo OKLCH) as the primary theme.
  - D011: Strict isolation of the landing page from shadcn theme changes.
  - D026: Shared RoomNavbar with a minimal mode for room creation.
patterns_established:
  - shadcn primitive usage for all interactive UI elements.
  - Semantic token mapping (primary, secondary, card, etc.) for themed components.
  - Sonner for asynchronous feedback and error handling.
observability_surfaces:
  - npm run build (client-side integrity)
  - rg "banana-" (token completeness check)
requirement_outcomes:
  - id: R101
    from_status: active
    to_status: validated
    proof: S01-UAT; components.json and index.css verified
  - id: R102
    from_status: active
    to_status: validated
    proof: S01-UAT; src/lib/utils.ts exports cn()
  - id: R103
    from_status: active
    to_status: validated
    proof: S04-UAT; rg "banana-" returns zero hits in room scope
  - id: R104
    from_status: active
    to_status: validated
    proof: S02-UAT; all room modals use DialogContent
  - id: R105
    from_status: active
    to_status: validated
    proof: S03-UAT; TasksPane uses SheetContent
  - id: R106
    from_status: active
    to_status: validated
    proof: S02-UAT; RoomSettingsModal uses Switch
  - id: R107
    from_status: active
    to_status: validated
    proof: S03-UAT; All room forms use shadcn Input/Label
  - id: R108
    from_status: active
    to_status: validated
    proof: S03-UAT; Role pickers use ToggleGroup
  - id: R109
    from_status: active
    to_status: validated
    proof: S04-UAT; Sonner toaster mounted and alerts replaced
  - id: R110
    from_status: active
    to_status: validated
    proof: S04-UAT; VotingOverlay uses Card primitives
  - id: R111
    from_status: active
    to_status: validated
    proof: S04-UAT; Card.jsx uses semantic tokens
  - id: R112
    from_status: active
    to_status: validated
    proof: S05-UAT; RoomNavbar.jsx shared by Room and CreateRoom
  - id: R113
    from_status: active
    to_status: validated
    proof: S01-UAT; App.css removed
  - id: R114
    from_status: active
    to_status: validated
    proof: Cross-slice verification; landing page files untouched
duration: 7h
verification_result: passed
completed_at: 2026-03-12
---

# M002: shadcn Room UI Migration

**Full migration of room-facing UI to a unified, accessible shadcn/ui design system with semantic tokenization and non-blocking notifications.**

## What Happened

Milestone M002 successfully transitioned the Keystimate room experience from a fragmented, ad-hoc design system to a professional, accessible design system based on shadcn/ui. 

The journey began with **S01**, establishing the "claude blu 2" theme and shadcn scaffold, which replaced the stale Vite styles. **S02** and **S03** tackled the core interactive surfaces, migrating all modals to accessible Dialogs and complex side panels (TasksPane) to Sheets. This phase also introduced the ToggleGroup for role selection, eliminating bespoke button-state logic and standardizing role picking across the app.

**S04** focused on the most prominent visual elements: the voting overlay and the notification system. By rebuilding the voting cards with shadcn Card primitives and replacing all 10 browser `alert()` calls with Sonner toasts, the app gained a modern, non-blocking feel. Finally, **S05** unified the navigation experience by extracting a shared `RoomNavbar`, ensuring visual consistency between the creation flow and the active session while also introducing the shadcn `Progress` component for vote tracking.

The entire migration was performed with a strict constraint on landing page isolation, ensuring that the marketing-focused front page remained untouched by the new design system.

## Cross-Slice Verification

- **Token Completeness**: `rg "banana-"` and `rg "orange-"` returned zero hits in room components (excluding assets), confirming all 47+ broken tokens were replaced with semantic `primary` and `muted` tokens.
- **Accessibility**: Verified all modals (GuestJoin, Invite, EditProfile, Settings) use `DialogTitle` and proper focus management. `TasksPane` now uses accessible `Sheet` semantics.
- **Non-blocking UI**: Confirmed zero `window.alert()` or `window.confirm()` calls remain in room scope; all replaced by Sonner toasts and `AlertDialog`.
- **Build Integrity**: `npm run build` in `client/` passes with zero errors.
- **Theme Consistency**: Visual verification of "claude blu 2" OKLCH tokens in both light and dark modes across all new components.
- **Landing Page Isolation**: Verified that `src/components/home/` and `src/pages/Landing.jsx` remain untouched and render correctly using their original custom tokens.

## Requirement Changes

- R101–R111: Active → Validated — Verified in slices S01–S04.
- R112: Active → Validated — Shared RoomNavbar implemented in S05.
- R113: Active → Validated — App.css removed in S01.
- R114: Active → Validated — Landing page isolation maintained across all slices.

## Forward Intelligence

### What the next milestone should know
- The design system is now fully semantic. Future UI additions should strictly use shadcn primitives and CSS variables (e.g., `bg-primary`, `text-card-foreground`) rather than hardcoded hex values or bespoke tailwind classes.
- The `RoomNavbar` uses a `minimal` prop to switch modes; ensure any new navbar buttons are conditionally rendered based on this prop to maintain the "create" vs "active" room distinction.

### What's fragile
- The `DialogContent` in `GuestJoinModal` has a hidden close button (`[&>button]:hidden`) to force user action. Be careful when updating shadcn primitives as this override might need adjustment.
- Confetti colors in `Room.jsx` are hardcoded hex values; while they match the theme, they are not dynamically linked to CSS variables.

### Authoritative diagnostics
- `rg "banana-"` or `rg "bg-\["` in `client/src/components` — will quickly surface any regressions toward bespoke/hardcoded styling.
- `npm run build` — the most reliable check for broken imports or TypeScript regressions.

### What assumptions changed
- **Alert count**: Originally estimated 8 alert calls; found and migrated 10 total instances across the room flow.
- **Modal Scope**: Added `JoinSessionModal.jsx` to the migration scope for completeness, even though it wasn't explicitly listed in the initial roadmap.

## Files Created/Modified

- `client/components.json` — shadcn configuration.
- `client/src/lib/utils.ts` — cn() utility.
- `client/src/index.css` — Theme variables and global styles.
- `client/src/components/ui/` — 15+ shadcn primitives added.
- `client/src/components/Room/RoomNavbar.jsx` — Unified navbar component.
- `client/src/components/Room/TasksPane.jsx` — Rebuilt with Sheet.
- `client/src/components/Voting/VotingOverlay.jsx` — Rebuilt with Card.
- `client/src/components/Room/PokerTable.jsx` — Updated with Progress and tokens.
- `client/src/App.jsx` — Sonner Toaster integration.
