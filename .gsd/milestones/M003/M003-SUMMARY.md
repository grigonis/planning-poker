---
milestone: M003
title: Room UX Restructure
status: complete
---

# M003: Room UX Restructure — Summary

## What Shipped

Five slices delivering a complete room UX overhaul:

1. **S01: Branding & Cleanup** — Replaced "BananaPoker" with "Keystimate" in all room-facing UI. Renamed all `banana_*` localStorage keys to `keystimate_*`. Landing page untouched (D011).

2. **S02: Host Dropdown Menu & Dialogs** — Replaced monolithic RoomSettingsModal with a DropdownMenu offering three focused dialogs: Edit Room Details, Customize Cards (placeholder), and Settings. Room name/description stored server-side and broadcast live via `room_settings_updated`.

3. **S03: Customize Cards Dialog** — Interactive card add/remove with live preview. Min 2 / max 12 enforced. Voting system type locked after room creation. Changes broadcast to all participants.

4. **S04: Participant Panel** — Left-side collapsible transparent panel showing all users with avatar, name, role badge, and live voting status. Reorders highest-to-lowest on reveal with group dividers (numeric voters → non-numeric → spectators). Hidden below 768px. Never overlaps poker table.

5. **S05: Integration & Polish** — Framer Motion animated reordering on participant panel rows. Full end-to-end verification of all components working together. No regressions in landing page, emoji reactions, or tasks pane.

## Key Decisions Made

- D028: Voting system locked after room creation
- D029: Three separate dialogs via DropdownMenu
- D030: Participant panel as left-side floating overlay
- D031: Reveal ordering highest-to-lowest with group dividers
- D032: Card customization limits min 2, max 12
- D033: Room details broadcast live via Socket.io
- D034: Keystimate branding
- D035: `keystimate_` localStorage key prefix

## Verification

All success criteria from the roadmap are met. BananaPoker removed, host dropdown functional, cards customizable, participant panel responsive and animated, landing page untouched.
