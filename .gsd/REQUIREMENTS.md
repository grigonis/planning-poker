# Requirements

This file is the explicit capability and coverage contract for the project.

## Validated (M004 — completed)

### R301 — Host can manage groups (create/delete) — validated M004/S02
### R302 — User assignment to groups — validated M004/S03
### R303 — Group picker on join screen — validated M004/S04
### R304 — Results board split by group — validated M004/S04
### R305 — Sum logic for total result — validated M004/S04

## Validated (M003 — completed)

### R201 — Keystimate branding replaces BananaPoker — validated M003/S01
### R202 — localStorage keys renamed from banana_* to keystimate_* — validated M003/S01
### R203 — Host dropdown menu replaces settings button — validated M003/S02
### R204 — Edit Room Details dialog (name + description, live broadcast) — validated M003/S02
### R205 — Room description displays under room ID in navbar — validated M003/S02
### R206 — Customize Cards dialog with interactive add/remove + preview — validated M003/S03
### R207 — Card count enforced: min 2, max 12 — validated M003/S03
### R208 — Voting system locked after room creation — validated M003/S03
### R209 — Settings dialog with 3 beautified toggles + end session — validated M003/S02
### R210 — Participant panel — collapsed: avatar + voting status — validated M003/S04
### R211 — Participant panel — expanded: avatar + name + status — validated M003/S04
### R212 — Participant panel — reorder highest-to-lowest on reveal — validated M003/S04
### R213 — Participant panel — group dividers — validated M003/S04
### R214 — Participant panel — shows vote values after reveal — validated M003/S04
### R215 — Participant panel — hidden below md (768px) — validated M003/S04
### R216 — Participant panel — never overlaps poker table — validated M003/S04
### R217 — Server: room name + description storage and broadcast — validated M003/S02

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

## M006 — Team Management & Dashboard (Pending)

### DASH-01 — User Dashboard initialization
- Status: active
### [x] DASH-01: Persistent Dashboard Hub
Users have a centralized home base to manage their profile and rooms.
**Validated:** M006

### [x] DASH-02: Global Profile Persistence
User identity (name, avatar, settings) is preserved across sessions and rooms.
**Validated:** M006

### [x] DASH-03: Session History Archive
Completed rooms are captured as history snapshots with tasks and results.
**Validated:** M006

### [x] DASH-04: Multi-Room Management
Users can track and rejoin several active rooms from one dashboard.
**Validated:** M006

### [x] DASH-05: Premium Dashboard UI
The dashboard follows high-end aesthetic standards (shadcn/ui layout).
**Validated:** M006
(M005 — completed)

### R401 — Avatar-first identity flow — validated M005
### R402 — ProfileSetupDialog shared component — validated M005
### R403 — Room configuration decoupled from host entry — validated M005
### R404 — Auto-join for repeat visitors — validated M005

---

## Deferred

### VOTE-06 — Save custom scales to team profile — M006 requirement
- Class: differentiator
- Status: active (Promoted in M006)
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
