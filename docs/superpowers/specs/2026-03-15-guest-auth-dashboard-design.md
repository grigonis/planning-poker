# Guest vs Auth Dashboard — Design Spec
**Date:** 2026-03-15
**Status:** Approved
**Branch:** dashboard

---

## Problem

The current dashboard has no distinction between guest and authenticated users. Guest history lives only in `localStorage` (via a UUID) and is fragile — it disappears on cache clear or device switch. When a guest signs in via OAuth, it is unclear what history they see, and the avatar/identity shown in session rows can be inconsistent. There is no prompt to preserve guest history, and no clear explanation of what "guest" means.

---

## Goals

- Make the guest experience honest and clear without being alarming or ugly
- Motivate guests to create an account through good copy and clean UI — not fear patterns
- When a guest signs in, give them control over whether to merge their local sessions into their account
- Handle the case where the user's account already has existing sessions (returning user)
- Use shadcn primitives throughout; no custom gradients, no color-filled banners, no locked/greyed UI elements

---

## Non-Goals

- Enforcing any session limit for guests (no artificial cap)
- Showing a "Stats" column or analytics features (future work)
- Adding team/organization/invite features (out of scope)
- Changing any server-side data model beyond what already exists

---

## Architecture Decision

**Option A — Single mode-aware `Dashboard.jsx`** (chosen)

One component reads `isGuest = !authUser` and conditionally renders guest-specific elements on top of the existing authenticated layout. No separate routes or page components. Shared layout never drifts between the two views.

---

## Design

### 1. Guest Banner

Shown only when `isGuest === true`. Positioned above the welcome heading.

**Component:** shadcn `Card` (no fill, subtle border using `border-border/60`) or a plain `div` styled with Tailwind border utilities — whichever integrates more cleanly with the surrounding layout.

**Content:**
- **Headline:** `"Don't lose your team's progress."`
- **Subtext (dynamic):** `"Your local history is at risk — clear your cache or switch devices and these [N] sessions are gone forever. Create a free account to sync and secure them."` Where `[N]` is `history.length` when `> 0`, otherwise the phrase `"any sessions you play"`.
- **CTA:** Single `Button` (default variant) → opens `SignInDialog`. Label: `"Create free account"`

**Design rules:**
- No background color fill — inherit card/background surface
- No amber, orange, or warning palette
- Body text uses `text-muted-foreground`; headline uses `text-foreground font-semibold`
- CTA button sits inline to the right on desktop, stacks below on mobile

---

### 2. Welcome Heading

**Guest:** Heading reads `"Your Dashboard"` with a `Badge variant="secondary"` inline: label `"Guest session"`, small size, muted. No emoji.

**Auth:** Existing `"Welcome back, {name}!"` with wave emoji — unchanged.

Subtext:
- Guest: `"History is stored in this browser. Sign in to sync across devices and never lose a session."`
- Auth: existing text unchanged

---

### 3. Stats Grid

All 4 stat cards render identically for both guest and authenticated users. No locking, no dimming, no locked placeholder cards. Stats shown are real data in both cases:

| Stat | Source |
|---|---|
| Total Sessions | `history.length` |
| Total Votes | sum of `session.tasks.length` |
| Rooms Joined | unique `session.roomName` count |
| Active Tasks | `activeRooms.length` |

No changes to the stats grid beyond what already exists.

---

### 4. Session History Table

Columns unchanged: **Room Name**, **Date**, **Participants**, **Resolved Tasks**.

No Stats column added.

**Guest-only footer row** — rendered inside the `Card`, below the `Table`, above the card bottom edge. A single `p` element:

```
text-xs text-muted-foreground px-4 py-3 border-t border-border/40
```

Content: `"Stored in this browser · unlinked sessions expire after 7 days · "` followed by an inline `Button variant="link" size="sm"` → opens `SignInDialog`. Label: `"Sign in to preserve →"`

This row is not shown for authenticated users.

---

### 5. Import History Modal

**Trigger:** Automatically shown after the guest→auth sign-in transition, **only if** the guest had sessions that are not already present in the user's account history.

**Detection logic (client-side):**
1. Before sign-in resolves, capture `guestHistoryCountRef.current = history.length` (the guest's local session count).
2. After sign-in, fetch UID-only history (no `link_guest_uid` yet) → `accountSessions`.
3. Compare guest session IDs against account session IDs.
4. If all guest session IDs already exist in account → skip modal (already linked from a prior sign-in on this device).
5. If any guest session IDs are absent from account → show modal with `unimportedCount`.

**Component:** shadcn `Dialog` (controlled, `open={showImportModal}`).

**Copy — context-aware:**

| Scenario | Headline | Body |
|---|---|---|
| Account has 0 sessions | `"Import your guest sessions?"` | `"We found [N] sessions from your guest visit. Import them to get started."` |
| Account has existing sessions | `"Merge your guest sessions?"` | `"We found [N] sessions from this browser. Add them to your [M] existing sessions?"` |

**Session list:** `ul` inside the dialog body listing session names + dates for the unimported sessions (max 5 shown, `+ N more` if exceeded).

**Actions (DialogFooter):**
- Primary `Button`: `"Import sessions"` → calls `link_guest_uid` socket event, then re-fetches merged history via `get_user_history`, closes dialog.
- Ghost `Button`: `"Start fresh"` → closes dialog, no linking. User sees UID-only history.

**Server note:** `link_guest_uid` is idempotent — safe to call even if the UUID was partially linked. The server only writes `guestUuid` if not already set.

---

## State Changes in `Dashboard.jsx`

| New state | Type | Purpose |
|---|---|---|
| `showImportModal` | `boolean` | Controls Dialog open state |
| `pendingGuestUuid` | `string \| null` | UUID to pass to `link_guest_uid` on confirm |
| `pendingGuestCount` | `number` | Guest session count for modal copy |
| `accountSessionCount` | `number` | UID-only session count for modal copy variant |
| `guestHistoryCountRef` | `useRef<number>` | Captures guest count before auth state resolves |

**Modified effect (wasGuest → isNowAuthed):**
1. Remove the existing unconditional `socket.emit('link_guest_uid', ...)` call — this fires before the user sees the modal and makes "Start fresh" meaningless. It must be deleted from the effect.
2. Load Firestore profile (existing, unchanged)
3. Fetch UID-only history via `get_user_history` → since `link_guest_uid` has not been called, the server returns only Firebase UID-matched sessions. Store result as `accountSessions`.
4. Diff the captured `guestSessionIds` (from `guestHistoryCountRef` / the pre-auth history state) against `accountSessions` by `session.id`.
5. If all guest session IDs already exist in `accountSessions` → skip modal (UUID was already linked from a prior session on this device). Re-fetch merged history normally.
6. If any guest session IDs are absent → set `accountSessionCount = accountSessions.length`, open modal. Do NOT call `link_guest_uid` until user confirms.

**Loading sequencing:** The modal must not open until step 3 completes (UID history fetch returns). While waiting, `isLoading` remains `true` (spinner shown). The modal opens after the fetch resolves with the correct `accountSessionCount` for context-aware copy.

**`pendingGuestUuid`:** At confirm time, use `userId` from `useProfile` — the UUID does not change after sign-in, so capturing it at transition time vs. confirm time is equivalent. Set it at transition time for clarity.

**Re-trigger behaviour:** After a successful import, the UUID is linked in Firestore. Any future guest sessions on the same device (same UUID) are automatically included in the UID history query — no re-trigger needed. Re-trigger is only relevant for sessions accumulated on a *different device* (different UUID), which is a separate future concern and out of scope here.

---

## Server Changes

None required. All existing socket events are used as-is:
- `get_user_history` — used for both UID-only fetch (pre-modal) and merged fetch (post-import)
- `link_guest_uid` — called only when user confirms import
- `load_user_profile` — unchanged

---

## Files Affected

| File | Change |
|---|---|
| `client/src/pages/Dashboard.jsx` | Primary changes: guest banner, heading variant, history footer, import modal, modified sign-in effect |
| No other files | All UI is self-contained in the dashboard page |

---

## Edge Cases & Error Handling

### Import flow — network/server failure
If the `link_guest_uid` socket call fails (callback returns `{ ok: false }` or times out), show a `toast` error: *"Couldn't import sessions — try again later."* The modal closes regardless; the user can sign out and back in to re-trigger the prompt (see re-trigger below).

### Import modal re-trigger
The modal fires once per sign-in transition, driven by component state (`showImportModal`). If the user dismisses via "Start fresh" and later signs out and back in on the same device, `guestHistoryCountRef.current` will reflect whatever guest sessions accumulated since then. If the user plays more guest sessions after dismissing, those new sessions will trigger the modal on next sign-in. Already-linked sessions are filtered out by the ID diff, so previously imported sessions are never double-counted.

If the page is refreshed mid-auth-transition, the modal state is lost — this is acceptable. The user will see their merged or UID-only history depending on whether `link_guest_uid` completed before the refresh.

### 7-day expiry copy
The footer text *"expires after 7 days"* is informational and aspirational. Server-side TTL enforcement is explicitly out of scope for this spec (see below). If TTL is never implemented, the copy should be removed in a follow-up. This is a known accepted risk.

### `guestHistoryCountRef` capture timing
The ref is updated in a `useEffect` with `[history, isGuest]` dependencies — it runs whenever history changes while the user is a guest. By the time the `[authUser, socket]` transition effect fires, the ref holds the last guest history count. This is reliable because React batches state updates and effects run after render in dependency order.

---

## Out of Scope

- Guest session TTL enforcement on the server (7-day copy is informational; actual expiry is a separate task)
- Avatar consistency in history rows (separate issue — participants are snapshotted at session time)
- Any route changes or new page components
