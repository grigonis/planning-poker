# S02: Host Dropdown Menu & Dialogs — Research

**Date:** 2026-03-12

## Summary

S02 replaces the monolithic `RoomSettingsModal` with a host-only dropdown menu in the navbar, splitting its concerns into three dialogs: Edit Room Details (name + description), Settings (toggles + end session), and a placeholder trigger for Customize Cards (built in S03). The server needs `roomName` and `roomDescription` fields added to room state, with broadcast through the existing `room_settings_updated` channel. Room description also displays under the room ID in the navbar.

The existing codebase is well-structured for this split. `RoomSettingsModal` cleanly separates its sections (voting system grid, toggles, danger zone), so extracting the toggles + danger zone into a standalone `SettingsDialog` is mostly copy-move. The new `EditRoomDetailsDialog` is greenfield but simple — two form fields and a save action. The dropdown menu is a standard shadcn component that needs to be installed (`npx shadcn@latest add dropdown-menu`).

The main integration point is the `room_settings_updated` Socket.io event. Currently it handles `funFeatures`, `autoReveal`, `anonymousMode`, and `votingSystem`. Adding `roomName` and `roomDescription` is a straightforward extension — same handler, same broadcast pattern, same client-side listener. The existing `onRoomSettingsUpdated` in Room.jsx just needs two more state setters.

## Recommendation

**Approach:** Three-task split.

1. **Server-side first** — Add `roomName`/`roomDescription` to room state in `createRoomHandler` and `updateRoomSettingsHandler`. Extend `join_room` and `create_room` callbacks to include these fields. This unblocks everything else.

2. **Dropdown + dialogs** — Install shadcn DropdownMenu. Replace the Settings gear button in `RoomNavbar` with a DropdownMenu (host-only). Create `EditRoomDetailsDialog` and `SettingsDialog` as separate components. The voting system section from `RoomSettingsModal` is NOT extracted here — it stays as a dead section until S03 replaces it with `CustomizeCardsDialog`. For now, the "Customize Cards" menu item can be wired to open a placeholder or the existing voting system section.

3. **Navbar description display** — Add `roomDescription` display beneath the room ID in `RoomNavbar`, conditional on it being set.

**Why this order:** Server changes are the foundation — both dialogs depend on being able to read/write room name and description. Dropdown + dialogs is the bulk of the work. Navbar description is a small UI addition that can be verified last.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Dropdown menu | shadcn DropdownMenu (`npx shadcn@latest add dropdown-menu`) | Radix-based, accessible, already matches the project's shadcn setup |
| Dialog primitives | shadcn Dialog (already installed at `ui/dialog.tsx`) | Existing component, consistent with all other room modals |
| Alert confirmation | shadcn AlertDialog (already at `ui/alert-dialog.tsx`) | Already used in RoomSettingsModal danger zone — carry pattern forward |
| Form inputs | shadcn Input, Textarea, Label (all installed) | Consistent with existing room forms |
| Toast notifications | Sonner (already integrated via `ui/sonner.tsx`) | D024 decision — already the project standard |

## Existing Code and Patterns

- `client/src/components/Room/RoomSettingsModal.jsx` — The monolithic modal being split. Toggles section (lines 186–243) maps directly to the new `SettingsDialog`. Danger zone (lines 246–277) also moves to `SettingsDialog`. Voting system section (lines 99–183) stays dead for now — S03 will replace it.
- `client/src/components/Room/RoomNavbar.jsx` — Gear button at line 128–138 will be replaced with DropdownMenu. The `onOpenSettings` prop becomes multiple open handlers (one per dialog). Room info section (lines 50–57) needs description display added.
- `client/src/pages/Room.jsx` — Central state management. `isSettingsOpen` state (line 41) needs to be replaced with separate open states for each dialog. `handleUpdateSettings` (line 491) already emits `update_room_settings` — reuse for room name/description. `onRoomSettingsUpdated` listener (lines 291–296) needs `roomName`/`roomDescription` handlers.
- `server/handlers/roomHandlers.js` — `updateRoomSettingsHandler` (lines 78–85) needs two new field checks. `createRoomHandler` room object (lines 21–36) needs `roomName: ''` and `roomDescription: ''` fields. Join callback (lines 136–149) needs to include them.
- `server/store.js` — `createRoom` helper (lines 20–35) should include `roomName`/`roomDescription` defaults, though the actual room creation in `roomHandlers.js` builds the object inline.

## Constraints

- **Landing page untouched (D011)** — No changes to `src/components/home/` or `src/pages/Landing.jsx`
- **shadcn with Tailwind v3 + OKLCH (D015)** — New components must use existing CSS variable tokens, not hardcoded colors
- **DropdownMenu is host-only** — Non-host users should not see the dropdown trigger at all (matches current gear button behavior)
- **Voting system section stays in RoomSettingsModal for now** — S03 will extract it into `CustomizeCardsDialog`. S02 should NOT delete the voting system UI, just remove it from the new `SettingsDialog`. The "Customize Cards" dropdown item needs to open *something* — either the old RoomSettingsModal temporarily or just a stub.
- **Room name/description are optional** — Dialog should allow empty values; navbar should gracefully handle no description set
- **Existing `update_room_settings` Socket event reused** — No new event names; just extend the settings payload

## Common Pitfalls

- **Breaking the DropdownMenu → Dialog flow** — Opening a shadcn Dialog from inside a DropdownMenuItem can cause focus/portal conflicts if not handled correctly. The standard pattern is to set state in the menu item's `onSelect`, then render the Dialog *outside* the DropdownMenu. Do NOT nest Dialog inside DropdownMenu.
- **Stale closures in Socket.io listeners** — The `onRoomSettingsUpdated` listener depends on the `useEffect` dependency array. Adding `roomName`/`roomDescription` as state won't need dep changes because the setter functions are stable, but verify the listener re-registers properly if the pattern changes.
- **Forgetting to propagate roomName/roomDescription on join** — Both `create_room` callback and `join_room` callback need to include these fields, otherwise guests/reconnects won't see the room name.
- **AlertDialog inside DropdownMenu** — The "End Session" action uses AlertDialog. If triggered from a dropdown item, the same portal/focus issue applies. Handle by closing menu first, then opening AlertDialog via state.

## Open Risks

- **S03 handoff for Customize Cards** — S02 needs to decide what "Customize Cards" does in the dropdown. Two options: (a) open the old `RoomSettingsModal` scrolled to voting section, or (b) show a minimal placeholder dialog. Option (b) is cleaner — a dialog saying "Card customization coming soon" or just a toast. But the roadmap says S02 should produce a "Customize Cards menu item wired to open a dialog" — so a real placeholder dialog is needed. S03 will then replace it.
- **RoomSettingsModal lifecycle** — After S02, `RoomSettingsModal` will still exist but only used via the "Customize Cards" placeholder path. Need to be clear about what to delete vs keep. The file should be kept until S03 replaces it.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| shadcn/ui | `shadcn/ui@shadcn` (13.3K installs) | installed locally at `.agents/skills/shadcn/SKILL.md` |
| Socket.io | none | no skill found |

## Sources

- shadcn DropdownMenu API (source: Context7 `/shadcn-ui/ui` docs — `DropdownMenuTrigger asChild`, `DropdownMenuItem`, `DropdownMenuSeparator`)
- Existing codebase patterns (source: direct file reads of `RoomSettingsModal.jsx`, `RoomNavbar.jsx`, `Room.jsx`, `roomHandlers.js`, `store.js`)
