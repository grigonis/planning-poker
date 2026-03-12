# M002: shadcn Room UI Migration

**Vision:** Migrate all room-facing UI (poker room, room creation, guest join, modals, forms, voting overlay) to shadcn/ui components with the "claude blu 2" theme. The landing page is untouched. The result is a visually consistent, accessible room experience with no broken tokens, no browser alert() dialogs, and a single coherent design system driving every room surface.

## Success Criteria
- Every room-facing component uses shadcn primitives or semantic CSS-variable tokens — no raw hex values, no undefined `banana-*` token, no `bg-[#...]` in room files
- Landing page (`/`, `src/components/home/`) is visually unchanged after migration
- Dev build (`npm run build` in `client/`) passes with zero errors
- All modals are accessible (shadcn Dialog with proper titles and focus management)
- No `window.alert()` or `window.confirm()` calls remain in room components
- Light and dark mode both render correctly using CSS variable tokens

## Key Risks / Unknowns
- shadcn init + Tailwind v3 CSS variable wiring — must verify OKLCH tokens resolve correctly via the `oklch(var(--x) / <alpha-value>)` pattern
- 47 `banana-*` token usages across room files — a missed replacement causes silent visual regression
- Landing page isolation — `index.css` glassmorphism utilities and tailwind.config custom tokens must survive the init patch

## Proof Strategy
- CSS variable wiring risk → retire in S01 by running dev server and verifying `bg-primary` renders the correct blue on a Button component
- `banana-*` completeness → retire in S04 by running `rg "banana-" client/src/components/Room client/src/components/Voting client/src/pages/Room.jsx` and confirming zero results
- Landing isolation → checked at end of each slice by loading `/` in browser

## Verification Classes
- Contract verification: `npm run build` passes; `rg "banana-"` returns zero hits in room scope; all shadcn component files present in `src/components/ui/`
- Integration verification: full room flow exercised in browser (create → join → vote → reveal → settings → tasks → end session)
- Operational verification: none
- UAT / human verification: visual check of dark + light mode in room and landing page

## Milestone Definition of Done
This milestone is complete only when all are true:
- All 5 slices are marked `[x]` in this roadmap
- `components.json` is present and committed in `client/`
- `src/lib/utils.ts` exists with `cn()` exported
- Zero `banana-*` references in room/voting/pages scope (verified by rg)
- Zero `window.alert()` / `window.confirm()` calls in room scope
- `npm run build` exits 0 in `client/`
- Landing page loads and looks identical to pre-migration (human UAT)
- Room flow works end-to-end in browser with "claude blu 2" theme applied

## Requirement Coverage
- Covers: R101, R102, R103, R104, R105, R106, R107, R108, R109, R110, R111, R112, R113, R114
- Partially covers: none
- Leaves for later: none
- Orphan risks: none

## Slices

- [x] **S01: Bootstrap + Theme** `risk:high` `depends:[]`
  > After this: shadcn is initialised in `client/`, "claude blu 2" CSS variables are live, `cn()` is available at `src/lib/utils.ts`, a sample Button renders with the correct blue primary in both light and dark mode, Inter font is loaded, stale App.css is removed.

- [x] **S02: Modals → Dialog + Switch** `risk:medium` `depends:[S01]`
  > After this: RoomSettingsModal, EditProfileModal, InviteModal, and GuestJoinModal all use shadcn Dialog; the three setting toggles use shadcn Switch; end-session uses AlertDialog; all modals have accessible titles and focus management.

- [x] **S03: Forms + Sheet + ToggleGroup** `risk:medium` `depends:[S01]`
  > After this: TasksPane uses shadcn Sheet; all inputs/textareas/selects in CreateRoom and room modals use shadcn form primitives; role pickers use ToggleGroup; Badge replaces custom role spans in PlayerAvatar.

- [x] **S04: Voting Overlay + Toasts** `risk:medium` `depends:[S02,S03]`
  > After this: VotingOverlay uses shadcn Card components for voting cards; Card.jsx uses semantic tokens; all alert() calls replaced with Sonner toasts; zero banana-* token references remain in room scope.

- [ ] **S05: Navbar Unification + Cleanup** `risk:low` `depends:[S04]`
  > After this: Room.jsx and CreateRoom.jsx share a single RoomNavbar component using shadcn Button for icon actions; Progress component replaces custom vote progress bar.

## Boundary Map

### S01 → all downstream slices

Produces:
- `src/lib/utils.ts` → `cn()` utility at canonical path
- `src/components/ui/button.tsx` → Button with variant/size props (only component added in S01)
- `client/src/index.css` → "claude blu 2" CSS variables in `:root` and `.dark`
- `client/tailwind.config.js` → CSS variable color extensions for semantic tokens
- `components.json` → shadcn config (nova preset; enables `npx shadcn add <component>` in all downstream slices)
- Note: dialog, alert-dialog, sheet, switch, input, textarea, label, select, toggle-group, badge, card, sonner, progress, separator are added by `npx shadcn add` in the slice that first needs them (S02/S03/S04/S05)

Consumes: nothing (first slice)

### S02 → S04

Produces:
- `RoomSettingsModal.jsx` → Dialog + Switch + AlertDialog + Separator + Button
- `EditProfileModal.jsx` → Dialog + Button + Input + Label
- `InviteModal.jsx` → Dialog + Button
- `GuestJoinModal.jsx` → Dialog + Button + Input + Label
- Pattern: `isOpen` prop → `Dialog open={isOpen} onOpenChange` established

Consumes from S01: dialog, switch, alert-dialog, separator, button, input, label, cn()

### S03 → S04

Produces:
- `TasksPane.jsx` → Sheet + SheetHeader + SheetTitle + Button + Input + Textarea + Badge + Separator
- `CreateRoom.jsx` → Input + Label + Select + ToggleGroup + Button
- `PlayerAvatar.jsx` → role tag uses Badge variant
- Pattern: FieldGroup + Field + FieldLabel + Input for all room forms

Consumes from S01: sheet, input, textarea, label, select, toggle-group, badge, button, cn()

### S04 → S05

Produces:
- `VotingOverlay.jsx` → shadcn Card per voting option; selected state via ring-primary
- `Card.jsx` (Voting) → bg-card, text-card-foreground, border-primary semantic tokens
- `App.jsx` → Toaster from sonner mounted at root
- All alert()/confirm() in room scope → replaced with toast() and AlertDialog
- Zero banana-* references confirmed by rg

Consumes from S02: AlertDialog pattern
Consumes from S03: all form primitives stable

### S05 → (milestone complete)

Produces:
- `src/components/Room/RoomNavbar.jsx` → shared navbar for Room.jsx and CreateRoom.jsx
- `PokerTable.jsx` vote progress → shadcn Progress component
- Note: `client/src/App.css` was already removed in S01/T04

Consumes from S04: all semantic tokens stable; Button variants established
