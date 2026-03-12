# Requirements

This file is the explicit capability and coverage contract for the project.

## Active (M002)

### R101 — shadcn initialised with "claude blu 2" theme
- Class: core-capability
- Status: validated
- Description: `shadcn init` run in `client/`; `components.json` present; "claude blu 2" OKLCH CSS variables applied to `index.css` `:root` and `.dark`; Tailwind v3 `tailwind.config.js` patched with semantic color extensions
- Why it matters: All downstream shadcn component adds depend on this scaffold; broken init causes every component to use wrong tokens
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: S01-UAT

### R102 — cn() utility at canonical path
- Class: core-capability
- Status: validated
- Description: `src/lib/utils.ts` exports `cn()` using clsx + tailwind-merge; all shadcn components import from this path
- Why it matters: shadcn components hardcode the import path; missing utils breaks every generated component
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: S01-UAT

### R103 — Broken banana-* token fully replaced
- Class: quality-attribute
- Status: validated
- Description: All 47+ `banana-*` references in room/voting/pages scope removed; replaced with semantic tokens (`text-primary`, `bg-primary`, etc.)
- Why it matters: `banana-*` is not defined in tailwind.config.js — these classes silently produce no style
- Source: audit
- Primary owning slice: M002/S04
- Supporting slices: M002/S02, M002/S03
- Validation: S04-UAT
- Notes: Verify with `rg "banana-" client/src/components/Room client/src/components/Voting client/src/pages` returning zero hits

### R104 — All room modals use shadcn Dialog
- Class: primary-user-loop
- Status: validated
- Description: RoomSettingsModal, EditProfileModal, InviteModal, GuestJoinModal each use Dialog/DialogContent/DialogHeader/DialogTitle
- Why it matters: Accessibility (focus trap, ARIA roles, keyboard dismiss) and visual consistency
- Source: audit
- Primary owning slice: M002/S02
- Supporting slices: none
- Validation: S02-UAT

### R105 — TasksPane uses shadcn Sheet
- Class: primary-user-loop
- Status: validated
- Description: TasksPane.jsx rebuilt using Sheet/SheetContent/SheetHeader/SheetTitle (side variant)
- Why it matters: Consistent side-panel pattern with accessibility; removes hand-rolled fixed-position panel
- Source: audit
- Primary owning slice: M002/S03
- Supporting slices: none
- Validation: S03-UAT

### R106 — RoomSettingsModal toggles use shadcn Switch
- Class: primary-user-loop
- Status: validated
- Description: Three hand-rolled toggle buttons (Fun Features, Auto Reveal, Anonymous Mode) replaced with shadcn Switch
- Why it matters: Custom toggles use non-standard fractional Tailwind values that don't resolve; Switch provides accessible boolean input
- Source: audit
- Primary owning slice: M002/S02
- Supporting slices: none
- Validation: S02-UAT

### R107 — All room forms use shadcn Input / Label / Textarea / Select
- Class: primary-user-loop
- Status: validated
- Description: Raw input/textarea/select in CreateRoom, GuestJoinModal, TasksPane, EditProfileModal, RoomSettingsModal replaced with shadcn primitives using FieldGroup+Field pattern
- Why it matters: Eliminates per-file bespoke styling inconsistencies
- Source: audit
- Primary owning slice: M002/S03
- Supporting slices: M002/S02
- Validation: S03-UAT

### R108 — Role pickers use ToggleGroup
- Class: primary-user-loop
- Status: validated
- Description: DEV/QA/Spectator role selection in CreateRoom and GuestJoinModal replaced with ToggleGroup + ToggleGroupItem
- Why it matters: Eliminates manual active-state button loops; provides accessible toggle semantics
- Source: audit
- Primary owning slice: M002/S03
- Supporting slices: none
- Validation: S03-UAT

### R109 — alert()/confirm() replaced with Sonner + AlertDialog
- Class: primary-user-loop
- Status: validated
- Description: All 8 window.alert() calls and 1 window.confirm() in room scope replaced with Sonner toast() and shadcn AlertDialog
- Why it matters: Browser dialogs are blocking, unstyled, and jarring
- Source: audit
- Primary owning slice: M002/S04
- Supporting slices: M002/S02
- Validation: S04-UAT

### R110 — VotingOverlay rebuilt with shadcn Card
- Class: primary-user-loop
- Status: validated
- Description: VotingOverlay fullscreen card picker rebuilt using shadcn Card for each voting option; selected state uses ring-primary; all broken tokens replaced
- Why it matters: User requested full shadcn rebuild; removes broken token references from most visually prominent room surface
- Source: user
- Primary owning slice: M002/S04
- Supporting slices: none
- Validation: S04-UAT

### R111 — Card.jsx (revealed votes) uses semantic tokens
- Class: quality-attribute
- Status: validated
- Description: src/components/Voting/Card.jsx updated to use bg-card, text-card-foreground, border-primary/ring-primary
- Why it matters: Revealed vote cards are the most-seen element during a session
- Source: audit
- Primary owning slice: M002/S04
- Supporting slices: none
- Validation: S04-UAT

### R112 — Room + CreateRoom share a unified RoomNavbar component
- Class: quality-attribute
- Status: active
- Description: Extract shared src/components/Room/RoomNavbar.jsx using shadcn Button for icon actions; both Room.jsx and CreateRoom.jsx import it
- Why it matters: Two separate hand-built navbars create maintenance divergence
- Source: audit
- Primary owning slice: M002/S05
- Supporting slices: none
- Validation: unmapped

### R113 — Stale App.css Vite scaffold removed
- Class: quality-attribute
- Status: validated
- Description: client/src/App.css default Vite styles removed
- Why it matters: Dead styles pollute the stylesheet and can conflict with shadcn token-based styles
- Source: audit
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: S01-UAT

### R114 — Landing page entirely untouched
- Class: constraint
- Status: active
- Description: src/pages/Landing.jsx, src/components/home/, and landing-page CSS utilities in index.css must be unchanged after migration
- Why it matters: User explicitly requires landing page to remain unchanged
- Source: user
- Primary owning slice: all (constraint on every slice)
- Supporting slices: none
- Validation: unmapped

---

## Validated (M001 — completed)

### ARCH-01 — Dedicated /create page — validated M001/S01
### ARCH-02 — Landing page as marketing index — validated M001/S01
### ARCH-03 — Legacy split mode removed — validated M001/S01
### ARCH-04 — Modernized navbar — validated M001/S02
### VOTE-01 through VOTE-05 — Voting systems — validated M001/S03
### TASK-01 through TASK-06 — Tasks pane + settings — validated M001/S04

---

## Deferred

### VOTE-06 — Save custom scales to team profile
- Class: differentiator
- Status: deferred
- Description: Allow teams to persist custom voting scales across sessions
- Source: user (M001 backlog)
- Primary owning slice: none
- Validation: unmapped
- Notes: Requires auth/team model

---

## Out of Scope

### Spectator logic changes — D003 — preserve as-is
### Backend changes — client-side UI migration only

---

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R101 | core-capability | validated | M002/S01 | none | S01-UAT |
| R102 | core-capability | validated | M002/S01 | none | S01-UAT |
| R103 | quality-attribute | validated | M002/S04 | S02, S03 | S04-UAT |
| R104 | primary-user-loop | validated | M002/S02 | none | S02-UAT |
| R105 | primary-user-loop | validated | M002/S03 | none | S03-UAT |
| R106 | primary-user-loop | validated | M002/S02 | none | S02-UAT |
| R107 | primary-user-loop | validated | M002/S03 | S02 | S03-UAT |
| R108 | primary-user-loop | validated | M002/S03 | none | S03-UAT |
| R109 | primary-user-loop | validated | M002/S04 | S02 | S04-UAT |
| R110 | primary-user-loop | validated | M002/S04 | none | S04-UAT |
| R111 | quality-attribute | validated | M002/S04 | none | S04-UAT |
| R112 | quality-attribute | active | M002/S05 | none | unmapped |
| R113 | quality-attribute | validated | M002/S01 | none | S01-UAT |
| R114 | constraint | active | all | none | unmapped |

## Coverage Summary
- Active requirements: 2
- Mapped to slices: 14
- Validated: 12 (R101, R102, R103, R104, R105, R106, R107, R108, R109, R110, R111, R113)
