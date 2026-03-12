# Requirements

This file is the explicit capability and coverage contract for the project.

## Active (M003)

### R201 — Keystimate branding replaces BananaPoker
- Class: quality-attribute
- Status: active
- Description: All room-facing "BananaPoker" text replaced with "Keystimate". Navbar displays "Keystimate" branding.
- Why it matters: Product identity consistency; BananaPoker is a legacy name
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: mapped
- Notes: Landing page home/ components are out of scope (D011)

### R202 — localStorage keys renamed from banana_* to keystimate_*
- Class: quality-attribute
- Status: active
- Description: All localStorage keys using `banana_` prefix renamed to `keystimate_` prefix. Existing sessions gracefully migrate or reset.
- Why it matters: Consistent branding in storage; prevents confusion during debugging
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: mapped

### R203 — Host dropdown menu replaces settings button
- Class: primary-user-loop
- Status: active
- Description: Settings gear button in navbar replaced with a shadcn DropdownMenu (host-only) containing three options: Edit Room Details, Customize Cards, Settings
- Why it matters: Organizes room controls into logical groups instead of one monolithic modal
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: mapped

### R204 — Edit Room Details dialog (name + description, live broadcast)
- Class: primary-user-loop
- Status: active
- Description: Dialog where host can set room name and description. Changes broadcast live to all participants via Socket.io.
- Why it matters: Gives rooms identity beyond a random 6-char code
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: mapped

### R205 — Room description displays under room ID in navbar
- Class: quality-attribute
- Status: active
- Description: Room description (when set) shows as subtle text under the room ID in the navbar
- Why it matters: Contextual info visible without opening a modal
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: mapped

### R206 — Customize Cards dialog with interactive add/remove + preview
- Class: primary-user-loop
- Status: active
- Description: Dialog where host can add/remove individual card values from the current voting scale. Live preview of the deck shown. No switching between voting system types.
- Why it matters: Allows fine-tuning the deck without replacing the entire system
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: mapped

### R207 — Card count enforced: min 2, max 12
- Class: constraint
- Status: active
- Description: Card customization dialog enforces minimum 2 and maximum 12 card values
- Why it matters: Prevents empty/broken decks and absurdly long card lists
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: mapped

### R208 — Voting system locked after room creation
- Class: constraint
- Status: active
- Description: Once a room is created with a voting system (Fibonacci, T-shirt, etc.), the system type cannot be switched. Only card values within the system can be customized.
- Why it matters: Prevents mid-session confusion from system switches
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: mapped

### R209 — Settings dialog with 3 beautified toggles + end session
- Class: primary-user-loop
- Status: active
- Description: Dedicated settings dialog with three toggleable options (Instant Reveal, Fun Features, Privacy Mode) styled with icons and descriptions, plus the End Session danger zone
- Why it matters: Cleaner separation of concerns vs the old monolithic RoomSettingsModal
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: mapped

### R210 — Participant panel — collapsed: avatar + voting status
- Class: primary-user-loop
- Status: active
- Description: Left-side transparent panel in collapsed state shows user avatar and voting status (Waiting/Voting/Voted)
- Why it matters: At-a-glance room awareness without distraction
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R211 — Participant panel — expanded: avatar + name + status
- Class: primary-user-loop
- Status: active
- Description: Expanded panel shows avatar, full display name, and voting status
- Why it matters: Full participant details when needed
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R212 — Participant panel — reorder highest-to-lowest on reveal
- Class: primary-user-loop
- Status: active
- Description: When votes are revealed, participant panel reorders participants from highest vote to lowest. Non-numeric votes (☕, ?) pushed to bottom.
- Why it matters: Instant visual indication of vote distribution and outliers
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R213 — Participant panel — group dividers
- Class: quality-attribute
- Status: active
- Description: Dividers between groups: numeric voters, non-numeric voters (☕, ?), and spectators
- Why it matters: Visual clarity about participant categories
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R214 — Participant panel — shows vote values after reveal
- Class: primary-user-loop
- Status: active
- Description: After votes are revealed, each participant's actual vote value is displayed next to their entry in the panel
- Why it matters: Complements the poker table view with a list-based summary
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R215 — Participant panel — hidden below md (768px)
- Class: constraint
- Status: active
- Description: Participant panel not rendered on screens narrower than 768px
- Why it matters: Mobile/small screens need full table space
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R216 — Participant panel — never overlaps poker table
- Class: constraint
- Status: active
- Description: Panel floats on left side but must not overlap the poker table area, even when expanded
- Why it matters: Core gameplay area must remain fully visible and interactive
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: mapped

### R217 — Server: room name + description storage and broadcast
- Class: integration
- Status: active
- Description: Server stores room name and description in room state. Changes broadcast via `room_settings_updated` event to all connected users.
- Why it matters: Enables live room details editing
- Source: inferred
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: mapped

---

## Validated (M002 — completed)

### R101 — shadcn initialised with "claude blu 2" theme — validated M002/S01
### R102 — cn() utility at canonical path — validated M002/S01
### R103 — Broken banana-* token fully replaced — validated M002/S04
### R104 — All room modals use shadcn Dialog — validated M002/S02
### R105 — TasksPane uses shadcn Sheet — validated M002/S03
### R106 — RoomSettingsModal toggles use shadcn Switch — validated M002/S02
### R107 — All room forms use shadcn Input / Label / Textarea / Select — validated M002/S03
### R108 — Role pickers use ToggleGroup — validated M002/S03
### R109 — alert()/confirm() replaced with Sonner + AlertDialog — validated M002/S04
### R110 — VotingOverlay rebuilt with shadcn Card — validated M002/S04
### R111 — Card.jsx (revealed votes) uses semantic tokens — validated M002/S04
### R112 — Room + CreateRoom share a unified RoomNavbar component — validated M002/S05
### R113 — Stale App.css Vite scaffold removed — validated M002/S01
### R114 — Landing page entirely untouched — validated M002/S05

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

### Landing page changes — constraint (D011) — preserved as-is
### Backend voting logic changes — only card value customization via existing settings mechanism
### Spectator logic changes — D003 — preserve as-is

---

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R201 | quality-attribute | active | M003/S01 | none | mapped |
| R202 | quality-attribute | active | M003/S01 | none | mapped |
| R203 | primary-user-loop | active | M003/S02 | none | mapped |
| R204 | primary-user-loop | active | M003/S02 | none | mapped |
| R205 | quality-attribute | active | M003/S02 | none | mapped |
| R206 | primary-user-loop | active | M003/S03 | none | mapped |
| R207 | constraint | active | M003/S03 | none | mapped |
| R208 | constraint | active | M003/S03 | none | mapped |
| R209 | primary-user-loop | active | M003/S02 | none | mapped |
| R210 | primary-user-loop | active | M003/S04 | none | mapped |
| R211 | primary-user-loop | active | M003/S04 | none | mapped |
| R212 | primary-user-loop | active | M003/S04 | none | mapped |
| R213 | quality-attribute | active | M003/S04 | none | mapped |
| R214 | primary-user-loop | active | M003/S04 | none | mapped |
| R215 | constraint | active | M003/S04 | none | mapped |
| R216 | constraint | active | M003/S04 | none | mapped |
| R217 | integration | active | M003/S02 | none | mapped |

## Coverage Summary

- Active requirements: 17
- Mapped to slices: 17
- Validated: 0
- Unmapped active requirements: 0
