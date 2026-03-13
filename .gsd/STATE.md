# GSD State

**Active Milestone:** M006 — Team Management — **PENDING**
**Phase:** milestone-complete

## Milestone Registry
- ✅ **M001:** Migration
- ✅ **M002:** shadcn Room UI Migration
- ✅ **M003:** Room UX Restructure
- ✅ **M004:** Player Groups
- ✅ **M005:** UI Polish

## M005 Changes Applied (round 2)

### 1. Tasks + Invite buttons — icon + label
- `RoomNavbar.jsx`: Changed Tasks/Invite from icon-only to `Button` with icon + text label. Label hidden on xs (`hidden sm:inline`).

### 2. Player name truncation on poker table
- `PlayerAvatar.jsx`: Fixed flex container — name text wrapped in `<span class="truncate block min-w-0">` inside outer flex span. Previously the flex container prevented truncation.

### 3. Refresh → session persisted, no re-prompt
- `server/handlers/roomHandlers.js`: On VOTING phase rejoin, send masked votes `[uid, 'VOTED']` so client knows who already voted.
- `Room.jsx`: On rejoin with votes in non-IDLE phase, set `myVote = 'VOTED'` sentinel to prevent VotingOverlay re-show.
- `Room.jsx` + `GuestJoinModal.jsx`: Now save/restore `avatarSeed` in localStorage session.
- `ProfileSetupDialog.jsx`: Added `initialName` and `initialAvatarSeed` props; join mode pre-fills name and pre-selects avatar from saved session.

### 4. Settings dropdown — now works
- Root cause: Radix Popper positions incorrectly inside `position:sticky + backdrop-filter` containers (popper wrapper positioned at 0,0 with -258px transform).
- Fix: Replaced Radix `DropdownMenu` with a custom `SettingsDropdown` component that uses `position: absolute; right: 0; top: 100%` — bypasses Radix Popper entirely. Includes outside-click and Escape-to-close behavior.

### 5. Logo matches landing page
- `RoomNavbar.jsx`: Now uses `KeystimateLogo` SVG component + same Outfit font "Key**stimate**" styling as `home/Navbar.jsx`. Removed text-only "Keystimate" heading.

### 6. Logo left-alignment
- `RoomNavbar.jsx`: Changed padding from `px-4 md:px-6` to `px-2 md:px-4`. Logo area uses `gap-2.5` instead of prior `flex-col` approach.

### 7. Room name/description truncated with tooltip
- `RoomNavbar.jsx`: Room subtitle shows `roomName — roomDescription` (if description exists), truncated with `max-w-[130px] sm:max-w-[200px] md:max-w-[300px]`. Tooltip on hover shows full name + description in separate lines.
- `client/src/components/ProfileSetupDialog.jsx`: Truly random avatar seeds; global profile persistence in `localStorage`.
- `client/src/pages/Room.jsx`: Auto-join logic if global profile exists (bypasses dialog).

## Files Changed (round 2)
- `client/src/components/Room/RoomNavbar.jsx` — complete rewrite
- `client/src/components/Room/PlayerAvatar.jsx` — truncation fix
- `client/src/pages/Room.jsx` — session persistence + vote state restoration
- `client/src/components/GuestJoinModal.jsx` — pass savedSession to ProfileSetupDialog
- `client/src/components/ProfileSetupDialog.jsx` — initialName/initialAvatarSeed props
- `server/handlers/roomHandlers.js` — send masked VOTING votes on rejoin

## Blockers
- None

## Known Issues (non-blocking)
- Server is in-memory; server restart loses all rooms. On refresh after server restart, the join dialog shows but is pre-filled with saved name/avatar. User just clicks Continue.
- React `forwardRef` warnings from shadcn/Radix UI components — pre-existing, library-level
