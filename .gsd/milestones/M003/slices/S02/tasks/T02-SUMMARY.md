---
id: T02
parent: S02
milestone: M003
provides:
  - DropdownMenu component installed (shadcn)
  - Host dropdown menu with 3 items in RoomNavbar (Edit Room Details, Customize Cards, Settings)
  - SettingsDialog with 3 toggles + end session danger zone extracted from RoomSettingsModal
  - CustomizeCardsDialog placeholder for S03
  - Three separate dialog open states in Room.jsx
  - roomDescription display in navbar
key_files:
  - client/src/components/ui/dropdown-menu.tsx
  - client/src/components/Room/SettingsDialog.jsx
  - client/src/components/Room/CustomizeCardsDialog.jsx
  - client/src/components/Room/RoomNavbar.jsx
  - client/src/pages/Room.jsx
key_decisions:
  - Dialogs render outside DropdownMenu tree (state-driven open flags in Room.jsx) to avoid Radix focus/portal conflicts
  - RoomSettingsModal preserved unchanged but rendered with isOpen={false} — kept as dead code until S03 cleans it up
  - Switch IDs in SettingsDialog prefixed with "settings" to avoid collision with RoomSettingsModal IDs
  - roomDescription displayed as truncated 11px text under room ID in navbar (max-w-200px mobile, 300px desktop)
patterns_established:
  - Host dropdown menu pattern: DropdownMenuItem onSelect sets state flag → Dialog renders at Room.jsx level
observability_surfaces:
  - none — UI restructuring only, no new runtime signals
duration: ~20min
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Install DropdownMenu, build host dropdown, and extract SettingsDialog

**Replaced single gear button with host-only DropdownMenu containing 3 items, each opening a state-driven dialog rendered at Room.jsx level.**

## What Happened

Installed shadcn DropdownMenu. Created SettingsDialog by extracting the 3 toggle switches (Celebration Effects, Instant Reveal, Privacy Mode) and the end session danger zone (with AlertDialog confirmation) from RoomSettingsModal. Created CustomizeCardsDialog as a placeholder for S03. Updated RoomNavbar to replace the gear Button with a DropdownMenu containing three DropdownMenuItems separated by a DropdownMenuSeparator. Updated Room.jsx to manage three separate dialog states (isSettingsDialogOpen, isEditRoomOpen, isCustomizeCardsOpen) and render the new dialogs alongside existing modals. Also wired roomDescription display in the navbar.

## Verification

- `ls client/src/components/ui/dropdown-menu.tsx` → file exists ✅
- `rg "DropdownMenu" RoomNavbar.jsx` → DropdownMenu, Trigger, MenuItem, Separator, Content present ✅
- `rg "Switch" SettingsDialog.jsx` → 3 Switch components present ✅
- `rg "AlertDialog" SettingsDialog.jsx` → AlertDialog with full confirmation flow present ✅
- `head -3 CustomizeCardsDialog.jsx` → file exists with React import ✅
- `rg "isSettingsDialogOpen|isEditRoomOpen|isCustomizeCardsOpen" Room.jsx` → three separate states ✅
- `rg "onOpenEditRoom|onOpenCustomizeCards|onOpenSettings" RoomNavbar.jsx` → three callback props ✅
- `cd client && npx vite build --mode development` → no errors ✅
- RoomSettingsModal.jsx unchanged (`git diff --name-only` has no RoomSettingsModal entry) ✅
- Browser: gear icon → dropdown with 3 items → "Settings" opens SettingsDialog with toggles + danger zone ✅
- Browser: "Customize Cards" opens placeholder dialog ✅
- Slice checks: roomDescription in RoomNavbar ✅, CustomizeCardsDialog exists ✅, no landing page changes ✅
- EditRoomDetailsDialog not yet present (expected — T03 scope)

## Diagnostics

- `rg "DropdownMenu" client/src/components/Room/RoomNavbar.jsx` — confirms dropdown wiring
- `rg "isSettingsDialogOpen" client/src/pages/Room.jsx` — confirms dialog state management
- Missing gear icon for hosts = dropdown rendering failure (visually obvious)

## Deviations

- RoomSettingsModal rendered with `isOpen={false}` instead of removing it entirely — preserves the import and component for S03 which needs its voting system section.

## Known Issues

None.

## Files Created/Modified

- `client/src/components/ui/dropdown-menu.tsx` — shadcn DropdownMenu component (generated)
- `client/src/components/Room/SettingsDialog.jsx` — standalone dialog with 3 toggles + end session
- `client/src/components/Room/CustomizeCardsDialog.jsx` — placeholder dialog for S03
- `client/src/components/Room/RoomNavbar.jsx` — gear button replaced with DropdownMenu (host-only), roomDescription display added
- `client/src/pages/Room.jsx` — three dialog open states, SettingsDialog and CustomizeCardsDialog rendered, roomDescription passed to navbar
