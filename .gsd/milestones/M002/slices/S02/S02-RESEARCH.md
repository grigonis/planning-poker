# S02: Modals → Dialog + Switch — Research

**Date:** 2026-03-12
**Slice:** M002/S02
**Requirements owned:** R104 (all room modals use shadcn Dialog), R106 (Switch for settings toggles), partial R103 (banana-* in modal scope), partial R107 (Input/Label in modal forms), partial R109 (AlertDialog for end-session confirm)

---

## Summary

S02 migrates four modal components — `RoomSettingsModal`, `EditProfileModal`, `InviteModal`, and `GuestJoinModal` — from hand-rolled fixed-position overlays to `shadcn Dialog`. The three boolean setting toggles in `RoomSettingsModal` become `shadcn Switch`. The `window.confirm()` for "end session" becomes an inline `AlertDialog`. The four `alert()` calls inside `RoomSettingsModal` become state-managed inline error messages (toast() is deferred to S04, but in-modal validation errors can be shown via local state rather than `alert()`). The two `alert()` calls in `Room.jsx` (`"Room not found"` and `"The host has ended this session"`) are also in scope for cleanup, though the latter can use a Sonner toast — but Sonner itself is added in S04, so those two remain as state-driven messages or are held for S04.

The shadcn infrastructure (S01) is complete and healthy: `components.json` with `radix-nova` style, `src/lib/utils.ts` with `cn()`, `button.tsx` already scaffolded, and `tailwind.config.js` patched with all semantic OKLCH tokens. `npm run build` exits 0.

The critical insight is that `radix-ui` v1 (monorepo) is installed — `Dialog`, `AlertDialog`, `Switch`, `Separator`, and `Label` are all available via `import { X } from "radix-ui"`. `npx shadcn@latest add dialog switch alert-dialog separator label input` will scaffold all needed files with zero additional npm installs required.

## Recommendation

**Approach:** Run `npx shadcn@latest add dialog switch alert-dialog separator label input` in `client/`, then rewrite each modal JSX to use the generated primitives. Keep each component a `.jsx` file (not `.tsx`) since the existing codebase is JavaScript-first. The shadcn-generated files are `.tsx` — that is fine; the JSX modals import them normally.

**Key pattern to establish for all downstream slices:**
```jsx
// Instead of: if (!isOpen) return null
// Use the Dialog open prop — Dialog handles its own conditional render:
<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Room Settings</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

**For Switch** — replace each hand-rolled `<button className="relative w-12 h-6.5 rounded-full...">` row with:
```jsx
<Field orientation="horizontal">
  <div className="flex flex-col gap-0.5">
    <FieldLabel>Celebration Effects</FieldLabel>
    <FieldDescription>Show confetti when team reaches consensus.</FieldDescription>
  </div>
  <Switch checked={funFeatures} onCheckedChange={(val) => onUpdateSettings({ funFeatures: val })} />
</Field>
```
Note: `Field` / `FieldLabel` come from `npx shadcn@latest add field` — check availability. If `field` is unavailable in the nova registry, use `Label` + manual `flex justify-between` layout instead; `FieldGroup` is not in nova but `field` IS available (verified via dry-run).

**For AlertDialog (end session)** — do NOT use `window.confirm()`. Replace with a controlled `AlertDialog` nested inside `RoomSettingsModal`. Add local `isEndSessionOpen` state to trigger it:
```jsx
const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
// ...
<AlertDialog open={isEndSessionOpen} onOpenChange={setIsEndSessionOpen}>
  <AlertDialogContent size="sm">
    <AlertDialogHeader>
      <AlertDialogTitle>End Session?</AlertDialogTitle>
      <AlertDialogDescription>This will end the voting session for everyone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={onEndSession}>End Session</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**For validation alert()s in RoomSettingsModal** — replace with local state `validationError` string and render an inline error message below the custom scale input. This avoids blocking browser dialogs without needing Sonner (which is S04). Three `alert()` calls in RoomSettingsModal can be consolidated into one `setValidationError("...")` + conditional render.

---

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Modal overlay + focus trap + ARIA | `Dialog` from `@/components/ui/dialog` | Radix `Dialog.Root` handles focus trap, escape key, ARIA roles automatically |
| Boolean toggle | `Switch` from `@/components/ui/switch` | Accessible, correct `role="switch"` ARIA, data-checked state; the hand-rolled toggle uses non-existent `h-6.5`/`w-4.5` fractional Tailwind classes |
| Destructive confirmation | `AlertDialog` from `@/components/ui/alert-dialog` | Non-blocking, accessible, keyboard-dismissible alternative to `window.confirm()` |
| Horizontal rule / section divider | `Separator` from `@/components/ui/separator` | Replaces `<div className="h-px bg-gray-100 dark:bg-white/5">` |
| Form labels | `Label` from `@/components/ui/label` | Proper `for`/`htmlFor` association, peer-disabled states |
| Text input | `Input` from `@/components/ui/input` | Semantic `focus-visible:ring-ring/50` — replaces `focus:border-banana-500` broken token |

---

## Existing Code and Patterns

- `client/src/components/Room/RoomSettingsModal.jsx` — 261 lines; uses `if (!isOpen) return null` guard; has 4× `alert()` and 1× `window.confirm()`; 7 `banana-*` token references; three hand-rolled switch buttons with non-existent Tailwind fractional sizes (`h-6.5`, `w-4.5`, `left-6.5`) — these render as zero-size/broken
- `client/src/components/Room/EditProfileModal.jsx` — 130 lines; uses `if (!isOpen) return null` guard; 0 `banana-*` tokens; raw `<input>` with `focus:border-indigo-500` (hardcoded color — replace with `focus-visible:border-ring`); footer action buttons need shadcn `Button` variants
- `client/src/components/InviteModal.jsx` — 48 lines; 2 `banana-*` tokens; copy button uses `bg-banana-500` (broken dark mode) — replace with `Button variant="default"` / `variant="secondary"`
- `client/src/components/GuestJoinModal.jsx` — 105 lines; 8 `banana-*` tokens; role picker buttons are hand-rolled — note: full ToggleGroup migration is S03 scope; for S02 just wrap in Dialog and replace broken tokens with semantic equivalents; the submit button raw styling uses `dark:bg-banana-500`
- `client/src/pages/Room.jsx` — consumes all four modals via `isOpen` + `onClose` props; pattern is stable and does NOT need to change — `Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}` maps cleanly

### State patterns in Room.jsx (do not change):
```js
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isProfileOpen, setIsProfileOpen] = useState(false);
const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
const needsGuestJoin = viewState === 'GUEST_INPUT'; // derived, not setState
```
- `GuestJoinModal` has no `onClose` — it's dismissed by `onJoinSuccess` transitioning `viewState`; the Dialog's `onOpenChange` should be a no-op or call navigate('/') only on user-initiated close (ESC/backdrop)

---

## Constraints

- **JSX files, not TSX** — all four modal files are `.jsx`; they import from `.tsx` shadcn components fine; do NOT rename them to `.tsx` (would require type annotations throughout)
- **`radix-ui` monorepo v1.4.3 is the Radix source** — dialog, switch, alert-dialog, separator, label all present: `require('radix-ui')` confirms `Dialog`, `Switch`, `AlertDialog`, `Separator`, `Label` all export as objects; `Input` is NOT in radix-ui (it's a plain HTML element wrapper in shadcn)
- **No `if (!isOpen) return null` in migrated components** — Dialog handles conditional render via `open` prop; leaving the guard in means the component unmounts/remounts and loses internal state on open/close
- **`h-6.5` / `w-4.5` / `left-6.5` are not valid Tailwind v3 classes** — these are the broken hand-rolled switch thumb sizing; the shadcn Switch generates correct CSS via `data-[size=default]:h-[18.4px]` etc.
- **DialogContent has built-in close button** (`showCloseButton=true` default in nova preset) — do NOT manually add a `<button onClick={onClose}><X /></button>` header; use `DialogClose` if needed, or rely on built-in
- **`dark:text-dark-900` is a custom token** — it maps to `#07090D` via tailwind.config; can be replaced with `dark:text-background` (which is `0.10 0.02 252` in dark = very dark blue) or simply removed where used on white text on primary background
- **`DialogContent` default `max-w-sm`** — RoomSettingsModal needs `max-w-lg` (it's a complex settings panel); pass `className="max-w-lg"` to `DialogContent`
- **`tw-animate-css` is installed** — the existing `animate-in zoom-in-95 duration-300` classes on modal wrappers are handled by `tailwindcss-animate` (Radix Dialog has its own `data-open`/`data-closed` animations in the nova preset — no need to add manual animation classes)
- **AlertDialog imports `Button`** — `alert-dialog.tsx` imports from `@/components/ui/button`; this is already installed; no circular dependency
- **GuestJoinModal `onClose` does not exist** — the modal is only closeable via `onJoinSuccess`; the Dialog `onOpenChange` should NOT call navigate('/') on backdrop click by default, to avoid accidental navigation; use `onInteractOutside={(e) => e.preventDefault()}` if needed
- **`field` component IS in nova registry** (verified dry-run shows 237-line `field.tsx` with `FieldGroup`, `Field`, `FieldLabel`); it's a dep of `separator` + `label`; can be added with `npx shadcn@latest add field`

---

## Common Pitfalls

- **Leaving `if (!isOpen) return null`** — Dialog's `open={isOpen}` prop controls visibility; the guard causes state loss on re-open (e.g. custom scale text is reset, avatar selection lost)
- **Mixing `onClose` with `onOpenChange`** — `onOpenChange` fires with `false` on both ESC and backdrop click; always call `onClose()` when `open` becomes `false`: `onOpenChange={(open) => { if (!open) onClose(); }}`
- **Not handling GuestJoinModal's missing `onClose`** — GuestJoinModal has no `onClose` prop; its Dialog should block backdrop/ESC dismiss (use `onInteractOutside={e => e.preventDefault()}` and `onEscapeKeyDown={e => e.preventDefault()}`) or treat close as navigate-home
- **Forgetting DialogTitle** — nova shadcn rule: `Dialog`, `Sheet`, `Drawer` ALWAYS need `DialogTitle` (even `className="sr-only"`) for accessibility; missing title triggers radix console warning
- **Using `banana-*` tokens in replacement code** — all replacement classes must use semantic tokens: `text-primary`, `bg-primary`, `border-primary`, `text-primary/50`, etc.
- **Using hardcoded `dark:bg-[#0c0c0c]`** — current modal backgrounds use raw hex dark backgrounds; replace with `bg-background` (CSS variable resolves correctly in dark mode)
- **AlertDialog nested inside Dialog** — this is supported by Radix (portal stacking), but `AlertDialog` z-index is `z-50` same as Dialog; ensure AlertDialog renders on top — both use `Portal` so they're siblings in DOM; this is fine in practice
- **Switch `checked` vs `defaultChecked`** — use `checked` (controlled) + `onCheckedChange`, not `defaultChecked`; the existing code passes props from server state
- **`size` prop on Button** — nova Button uses `size="default"` (h-8) which is compact; for full-width action buttons use `size="lg"` (h-9) or add `className="w-full h-10"` for the join/save CTAs
- **`Slot.Root` in button.tsx** — current Button uses `Slot.Root` from radix-ui monorepo, not `Slot` from `@radix-ui/react-slot`; this is fine for existing code but not relevant to S02

---

## Open Risks

- **GuestJoinModal backdrop dismiss behavior** — current code has `if (!isOpen) return null` (no dismiss path); Dialog provides ESC and backdrop dismiss by default; caller in Room.jsx sets `isOpen={needsGuestJoin}` which is derived from `viewState`; if user dismisses Dialog via ESC, `onOpenChange(false)` fires but `viewState` doesn't change → Dialog re-opens on next render. Mitigation: pass `onOpenChange={(open) => { if (!open) navigate('/'); }}` to match user expectation (dismissing join = leave room)
- **RoomSettingsModal scroll behavior** — current code uses `overflow-y-auto flex-1` on content div for scrolling inside a fixed-height modal; shadcn `DialogContent` uses `grid w-full max-w-[calc(100%-2rem)]` — may need `className="max-h-[90vh] overflow-y-auto"` to preserve scroll behavior on small screens
- **Validation errors via alert()** — 4× `alert()` calls in RoomSettingsModal must be replaced; using local `validationError` state + inline `<p className="text-destructive text-sm">` is safe and doesn't require Sonner; risk is low
- **`dark:text-dark-900`** — used in several places as text color on orange/banana buttons; this token (`#07090D`) maps to near-black; replace with `dark:text-background` or just `text-background` since primary-foreground should be the correct value
- **`z-[60]` on existing modals** — current modals use `z-[60]`; shadcn Dialog uses `z-50` (via portal); any stacking context that adds `z-index` to parent elements could cause issues; check if Room.jsx page wrapper has any `z-index`

---

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| shadcn/ui | `shadcn` skill | **installed** at `.agents/skills/shadcn/` |

No additional skill installations needed for S02.

---

## Implementation Order

1. **Install components:** `npx shadcn@latest add dialog switch alert-dialog separator label input field` (in `client/`)
2. **RoomSettingsModal.jsx** — highest value / most complexity:
   - Wrap in `Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}`
   - Replace `DialogContent` with `max-w-lg max-h-[90vh]` overrides
   - Add `DialogHeader` + `DialogTitle` ("Room Settings") — can remove custom header markup
   - Replace 3 toggle rows with `Switch` + `Field orientation="horizontal"` pattern
   - Replace end-session `window.confirm` with nested `AlertDialog` (add local `isEndSessionOpen` state)
   - Replace 4× `alert()` with local `validationError` state + inline error
   - Replace all `banana-*` tokens (7 instances) with semantic tokens
3. **EditProfileModal.jsx** — moderate:
   - Wrap in `Dialog open={isOpen} onOpenChange`
   - Add `DialogHeader` + `DialogTitle`
   - Replace raw `<input>` with shadcn `Input` (focus ring tokens fixed)
   - Replace action buttons with shadcn `Button` variants
4. **InviteModal.jsx** — simple:
   - Wrap in `Dialog open={isOpen} onOpenChange`
   - Add `DialogHeader` + `DialogTitle`
   - Replace copy `<button>` with `Button variant="ghost" size="icon"`
   - Replace `banana-*` tokens (2 instances)
5. **GuestJoinModal.jsx** — careful on dismiss handling:
   - Wrap in `Dialog open={isOpen} onOpenChange={(o) => !o && navigate('/')}`
   - Block backdrop/ESC if desired: `onInteractOutside + onEscapeKeyDown`
   - Add `DialogHeader` + `DialogTitle`
   - Replace raw `<input>` with shadcn `Input`
   - Replace `banana-*` tokens (8 instances) with semantic tokens
   - **NOTE:** role picker buttons stay as-is for S02 (ToggleGroup migration is S03 scope); just fix the token colors
6. **Verify:** `npm run build` exits 0; `rg "banana-"` in modal files returns 0 hits; `rg "window\.alert\|window\.confirm"` in modal files returns 0 hits

---

## Token Replacement Map (S02 scope)

| Old token | Replacement | Context |
|-----------|-------------|---------|
| `dark:bg-banana-500` | `dark:bg-primary` | Selected state backgrounds |
| `dark:bg-banana-500/10` | `dark:bg-primary/10` | Subtle icon backgrounds |
| `dark:border-banana-500` | `dark:border-primary` | Selected borders |
| `dark:text-banana-500` | `dark:text-primary` | Icons, labels in dark mode |
| `dark:text-banana-400` | `dark:text-primary/80` | Slightly muted primary text |
| `hover:border-banana-500/30` | `hover:border-primary/30` | Hover states |
| `dark:hover:border-banana-500/20` | `dark:hover:border-primary/20` | Dark hover states |
| `focus:border-banana-500` | (removed — shadcn Input handles focus) | Input focus |
| `dark:text-dark-900` | `dark:text-background` | Text on primary-colored bg |
| `bg-white dark:bg-[#0c0c0c]` | `bg-background` | Modal background |
| `border-gray-200 dark:border-white/10` | `border-border` | Dividers, input borders |
| `text-gray-900 dark:text-white` | `text-foreground` | Primary text |
| `text-gray-500 dark:text-gray-400` | `text-muted-foreground` | Secondary/muted text |
| `bg-gray-100 dark:bg-white/5` | `bg-muted` | Muted backgrounds |
| `bg-dark-900` | `bg-background` | Input dark bg |

---

## Sources

- Radix-ui v1 monorepo exports confirmed by `require('radix-ui')`: Dialog, Switch, AlertDialog, Separator, Label all present (source: local `node_modules` inspection)
- `npx shadcn@latest add dialog switch alert-dialog separator label input field --dry-run` confirmed all components scaffold cleanly with zero new npm installs (source: CLI output)
- `npx shadcn@latest add dialog --view` confirmed `DialogContent` default `max-w-sm`; `showCloseButton=true` default built-in X button (source: CLI --view output)
- `npx shadcn@latest add switch --view` confirmed Switch uses `data-checked:bg-primary` and `data-unchecked:bg-input` — no hand-rolled sizing (source: CLI --view output)
- `npm run build` in `client/` exits 0 after S01 (verified locally)
- shadcn skill rules: `Dialog/Sheet/Drawer always need a Title`; `Switch for settings toggles`; `AlertDialog for destructive confirmations`; `Separator instead of hr/border divs` (source: `.agents/skills/shadcn/rules/composition.md`, `forms.md`)
