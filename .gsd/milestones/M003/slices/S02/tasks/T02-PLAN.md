---
estimated_steps: 6
estimated_files: 5
---

# T02: Install DropdownMenu, build host dropdown, and extract SettingsDialog

**Slice:** S02 — Host Dropdown Menu & Dialogs
**Milestone:** M003

## Description

The core UI restructure. Install the shadcn DropdownMenu component. Replace the single settings gear button in RoomNavbar with a DropdownMenu containing three items (Edit Room Details, Customize Cards, Settings). Each menu item sets a state flag — the corresponding Dialog renders outside the DropdownMenu to avoid Radix focus/portal conflicts (key pitfall from research). Extract the toggles grid and danger zone from RoomSettingsModal into a new standalone SettingsDialog. Create a minimal CustomizeCardsDialog placeholder. Update Room.jsx to manage three separate dialog open states.

## Steps

1. Install shadcn DropdownMenu: `cd client && npx shadcn@latest add dropdown-menu -y`
2. Create `client/src/components/Room/SettingsDialog.jsx`:
   - Copy the 3 toggle switches (Celebration Effects / Instant Reveal / Privacy Mode) and the danger zone (AlertDialog end session) from `RoomSettingsModal.jsx`
   - Wrap in a shadcn Dialog with proper header (Settings icon + "Settings" title)
   - Props: `isOpen`, `onClose`, `funFeatures`, `autoReveal`, `anonymousMode`, `onUpdateSettings`, `onEndSession`
   - The AlertDialog for end session renders inside the Dialog content, not inside a dropdown — no portal conflict here
3. Create `client/src/components/Room/CustomizeCardsDialog.jsx`:
   - Minimal placeholder Dialog with a message like "Card customization is coming soon" or a brief description
   - Props: `isOpen`, `onClose`
   - This will be replaced by S03 with the real interactive card customizer
4. Update `client/src/components/Room/RoomNavbar.jsx`:
   - Replace the host-only gear Button with a DropdownMenu
   - DropdownMenuTrigger wraps a Button with the Settings icon (same visual as before)
   - Three DropdownMenuItems: "Edit Room Details" (with Pencil icon), "Customize Cards" (with Palette/Layers icon), "Settings" (with Settings icon)
   - Each item's `onSelect` calls a callback prop (e.g., `onOpenEditRoom`, `onOpenCustomizeCards`, `onOpenSettings`)
   - DropdownMenuSeparator before the Settings item to visually group it
   - Remove the old `onOpenSettings` single prop, replace with three separate callback props
5. Update `client/src/pages/Room.jsx`:
   - Replace single `isSettingsOpen` state with three: `isSettingsDialogOpen`, `isEditRoomOpen`, `isCustomizeCardsOpen`
   - Pass open/close handlers to RoomNavbar as `onOpenEditRoom`, `onOpenCustomizeCards`, `onOpenSettings`
   - Render SettingsDialog and CustomizeCardsDialog alongside existing modals (EditRoomDetailsDialog will come in T03)
   - Pass SettingsDialog the same props that RoomSettingsModal currently gets (minus votingSystem/phase which stay with RoomSettingsModal)
   - Keep RoomSettingsModal import and rendering for now — it's preserved until S03
6. Verify the build succeeds and the dropdown menu structure is correct.

## Must-Haves

- [ ] shadcn DropdownMenu component installed at `client/src/components/ui/dropdown-menu.tsx`
- [ ] SettingsDialog has 3 toggle switches matching current RoomSettingsModal toggles (same labels, icons, descriptions)
- [ ] SettingsDialog has the End Session danger zone with AlertDialog confirmation
- [ ] CustomizeCardsDialog exists as a placeholder dialog
- [ ] RoomNavbar shows DropdownMenu for host only, with 3 menu items
- [ ] Non-host users see no dropdown trigger (same visibility rule as the old gear button)
- [ ] Dialogs render outside the DropdownMenu component tree (state-driven, not nested)
- [ ] Room.jsx manages three separate dialog open states
- [ ] RoomSettingsModal.jsx file is preserved unchanged (S03 dependency)

## Verification

- `ls client/src/components/ui/dropdown-menu.tsx` → file exists
- `rg "DropdownMenu" client/src/components/Room/RoomNavbar.jsx` → DropdownMenu, DropdownMenuTrigger, DropdownMenuItem present
- `cat client/src/components/Room/SettingsDialog.jsx | head -3` → file exists with React import
- `rg "Switch" client/src/components/Room/SettingsDialog.jsx` → Switch component used (toggles present)
- `rg "AlertDialog" client/src/components/Room/SettingsDialog.jsx` → AlertDialog used (danger zone present)
- `cat client/src/components/Room/CustomizeCardsDialog.jsx | head -3` → file exists
- `rg "isSettingsDialogOpen\|isEditRoomOpen\|isCustomizeCardsOpen" client/src/pages/Room.jsx` → three separate states
- `rg "onOpenEditRoom\|onOpenCustomizeCards\|onOpenSettings" client/src/components/Room/RoomNavbar.jsx` → three callback props used
- `cd client && npx vite build --mode development 2>&1 | tail -3` → no errors

## Observability Impact

- Signals added/changed: None — this is UI restructuring, no new runtime signals
- How a future agent inspects this: `rg "DropdownMenu" client/src/components/Room/RoomNavbar.jsx` to confirm dropdown is wired; `rg "isSettingsDialogOpen" client/src/pages/Room.jsx` to confirm dialog state management
- Failure state exposed: If DropdownMenu doesn't render, the host has no way to access settings — visually obvious (missing gear icon)

## Inputs

- `client/src/components/Room/RoomNavbar.jsx` — current gear button implementation (lines 128–138)
- `client/src/components/Room/RoomSettingsModal.jsx` — toggles grid (lines 186–243) and danger zone (lines 246–277) to extract
- `client/src/pages/Room.jsx` — `isSettingsOpen` state and RoomSettingsModal rendering
- T01 output: Room.jsx has roomName/roomDescription state (available for T03 to wire to dialogs)

## Expected Output

- `client/src/components/ui/dropdown-menu.tsx` — shadcn DropdownMenu component (generated)
- `client/src/components/Room/SettingsDialog.jsx` — standalone dialog with 3 toggles + end session
- `client/src/components/Room/CustomizeCardsDialog.jsx` — placeholder dialog for S03
- `client/src/components/Room/RoomNavbar.jsx` — gear button replaced with DropdownMenu (host-only)
- `client/src/pages/Room.jsx` — three dialog open states, SettingsDialog and CustomizeCardsDialog rendered
