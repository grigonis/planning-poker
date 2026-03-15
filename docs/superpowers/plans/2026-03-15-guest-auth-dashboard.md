# Guest vs Auth Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Dashboard.jsx mode-aware for guest vs authenticated users: clean guest banner, welcome heading variant, history table footer, and an import modal that fires after sign-in if the user had unlinked guest sessions.

**Architecture:** Single `Dashboard.jsx` reads `isGuest = !authUser` and conditionally renders guest-specific UI on top of the existing authenticated layout. The existing unconditional `link_guest_uid` call is removed; linking only happens when the user confirms the import modal. A ref tracks guest session objects before the auth transition resolves so the modal can diff which sessions are new vs already in the account and display their names.

**Tech Stack:** React 18, Tailwind CSS v3, shadcn/ui (`Card`, `Badge`, `Button`, `Dialog`), Framer Motion (already in use), Sonner toast (already in use via `import { toast } from "sonner"`), Socket.io client.

**Spec:** `docs/superpowers/specs/2026-03-15-guest-auth-dashboard-design.md`

---

## Chunk 1: State, refs, and sign-in transition effect

### Task 1: Add imports and remove the unconditional `link_guest_uid` call

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 1.1 — Add `useRef` to the React import and add Dialog + toast imports**

Change the first line of Dashboard.jsx:
```jsx
// FROM:
import React, { useState, useEffect, useMemo } from 'react';
// TO:
import React, { useState, useEffect, useRef, useMemo } from 'react';
```

Add these two import blocks after the existing shadcn component imports (after the `Skeleton` import):
```jsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
```

The lucide-react import block does not change.

- [ ] **Step 1.2 — Remove the unconditional `link_guest_uid` call**

In the `wasGuest → isNowAuthed` effect, delete this line (currently line 65):
```jsx
// DELETE this line entirely:
socket.emit('link_guest_uid', { guestUuid: userId }, () => {});
```

- [ ] **Step 1.3 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 1.4 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "refactor: remove unconditional link_guest_uid on sign-in"
```

---

### Task 2: Add new state, guest session ref, and `isGuest`

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 2.1 — Add `isGuest` and new state variables**

Directly after `const [isSignInOpen, setIsSignInOpen] = useState(false);`, add:

```jsx
const isGuest = !authUser;

const [showImportModal, setShowImportModal] = useState(false);
const [pendingGuestUuid, setPendingGuestUuid] = useState(null);
const [pendingGuestCount, setPendingGuestCount] = useState(0);
const [pendingGuestSessions, setPendingGuestSessions] = useState([]);
const [accountSessionCount, setAccountSessionCount] = useState(0);
```

- [ ] **Step 2.2 — Add the guest sessions ref and its sync effect**

Directly after the new state variables, add:

```jsx
// Tracks guest sessions while the user is a guest.
// Captured continuously so objects are available when the auth transition fires.
const guestSessionsRef = useRef([]);
useEffect(() => {
    if (isGuest) {
        guestSessionsRef.current = history;
    }
}, [history, isGuest]);
```

- [ ] **Step 2.3 — Update `prevAuthUserRef` to use the imported `useRef`**

```jsx
// Change:
const prevAuthUserRef = React.useRef(null);
// To:
const prevAuthUserRef = useRef(null);
```

- [ ] **Step 2.4 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 2.5 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: add guest state and session ref for import modal"
```

---

### Task 3: Rewrite the sign-in transition effect and add import handlers

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 3.1 — Replace the full `wasGuest → isNowAuthed` effect**

Find the effect with the comment `// On sign-in: link pre-auth guest UUID to Firebase user...` and replace the entire `useEffect` block (lines 56–85) with:

```jsx
// On sign-in: load stored profile; if guest had unlinked sessions, prompt to import.
useEffect(() => {
    const wasGuest = prevAuthUserRef.current === null;
    const isNowAuthed = !!authUser;
    prevAuthUserRef.current = authUser;

    if (!wasGuest || !isNowAuthed || !socket) return;

    // Load stored profile from Firestore
    socket.emit('load_user_profile', {}, (profile) => {
        if (profile && (profile.name || profile.avatarSeed || profile.avatarPhotoURL)) {
            updateProfile({
                ...(profile.name           ? { name: profile.name }           : {}),
                ...(profile.avatarSeed     ? { avatarSeed: profile.avatarSeed } : {}),
                ...(profile.avatarPhotoURL ? { avatarPhotoURL: profile.avatarPhotoURL } : {}),
            });
        }
    });

    // Capture guest sessions at the moment of sign-in (before history state is overwritten)
    const capturedGuestSessions = guestSessionsRef.current;
    const capturedGuestIds = new Set(capturedGuestSessions.map(s => s.id));

    // Fetch UID-only history (link_guest_uid not called yet → server returns only UID-matched sessions)
    setIsLoading(true);
    socket.emit('get_user_history', { userId }, (response) => {
        const accountSessions = Array.isArray(response) ? response : [];
        setHistory(accountSessions);
        setIsLoading(false);

        if (capturedGuestIds.size === 0) return; // no guest sessions to import

        // Diff: find guest sessions not already present in account
        const accountIds = new Set(accountSessions.map(s => s.id));
        const unimported = capturedGuestSessions.filter(s => !accountIds.has(s.id));

        if (unimported.length === 0) return; // all guest sessions already linked

        // Open import modal with context-aware data
        setPendingGuestUuid(userId);
        setPendingGuestCount(unimported.length);
        setPendingGuestSessions(unimported.slice(0, 5)); // show max 5 in modal list
        setAccountSessionCount(accountSessions.length);
        setShowImportModal(true);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [authUser, socket]);
```

- [ ] **Step 3.2 — Add import handlers after `handleUpdateProfile`**

After the existing `handleUpdateProfile` function, add:

```jsx
const handleImportHistory = () => {
    if (!socket || !pendingGuestUuid) {
        setShowImportModal(false);
        return;
    }
    socket.emit('link_guest_uid', { guestUuid: pendingGuestUuid }, (result) => {
        if (result?.ok === false) {
            toast.error("Couldn't import sessions — try again later.");
            return;
        }
        socket.emit('get_user_history', { userId }, (response) => {
            if (Array.isArray(response)) setHistory(response);
        });
    });
    setPendingGuestUuid(null);
    setShowImportModal(false);
};

const handleSkipImport = () => {
    setPendingGuestUuid(null);
    setShowImportModal(false);
};
```

- [ ] **Step 3.3 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 3.4 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: defer link_guest_uid to user-confirmed import modal"
```

---

## Chunk 2: Guest UI — banner, heading, history footer

### Task 4: Guest banner

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

The banner uses `Card` and `CardContent` (already imported). It sits at the top of the main content column, before the welcome header `<div>`.

- [ ] **Step 4.1 — Add the banner JSX**

Inside the `<div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-10">`, add this block as the **first child**, immediately before the `{/* Welcome Header */}` comment:

```jsx
{/* Guest banner — shown only for unauthenticated users */}
{isGuest && (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <Card className="shadow-none">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm leading-snug">
                        Don&apos;t lose your team&apos;s progress.
                    </p>
                    <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
                        Your local history is at risk &mdash; clear your cache or switch devices and{' '}
                        {history.length > 0
                            ? <>these <strong className="text-foreground font-semibold">{history.length} session{history.length !== 1 ? 's' : ''}</strong> are gone forever. </>
                            : 'any sessions you play are gone forever. '
                        }
                        Create a free account to sync and secure them.
                    </p>
                </div>
                <Button
                    className="shrink-0 rounded-xl font-bold"
                    onClick={() => setIsSignInOpen(true)}
                >
                    Create free account
                </Button>
            </CardContent>
        </Card>
    </motion.div>
)}
```

- [ ] **Step 4.2 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 4.3 — Visual check**

Start the dev server (`cd client && npm run dev`). Open `/dashboard` while not signed in. Confirm:
- Banner appears above the welcome heading with clean typography, no fill color
- Dynamic session count appears in the subtext when sessions exist
- "Create free account" button opens SignInDialog
- Banner is absent when signed in

- [ ] **Step 4.4 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: add guest banner to dashboard"
```

---

### Task 5: Welcome heading and subtext variant

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 5.1 — Replace the `<motion.div className="space-y-1">` contents**

Find the `<motion.div initial={{ opacity: 0, x: -20 }} ... className="space-y-1">` block inside the welcome header section and replace its inner content (the `<h1>` and `<p>`):

```jsx
<motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-1"
>
    <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 flex-wrap">
        {isGuest ? 'Your Dashboard' : `Welcome back, ${name || 'Estimator'}!`}
        {isGuest
            ? <Badge variant="secondary" className="text-xs font-semibold normal-case tracking-normal">Guest session</Badge>
            : <span className="inline-block animate-bounce-subtle text-2xl">👋</span>
        }
    </h1>
    <p className="text-muted-foreground text-lg font-light max-w-2xl">
        {isGuest
            ? 'History is stored in this browser. Sign in to sync across devices and never lose a session.'
            : 'Track your voting history, manage your sessions, and refine your estimates.'
        }
    </p>
</motion.div>
```

- [ ] **Step 5.2 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 5.3 — Visual check**

Confirm in both light and dark mode:
- Guest: heading "Your Dashboard" + muted secondary badge "Guest session"
- Auth: heading "Welcome back, [name]!" + wave emoji — unchanged
- Subtext differs correctly per state

- [ ] **Step 5.4 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: guest heading and subtext variant in dashboard"
```

---

### Task 6: History table guest footer row

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 6.1 — Wrap the table branch in a fragment and add the guest footer**

The current `filteredHistory.length > 0` ternary branch renders a single `<div className="overflow-x-auto">`. We need to add a sibling guest footer below it, which requires wrapping both in a fragment.

Find this exact block (the `filteredHistory.length > 0` branch):

```jsx
                                ) : filteredHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
```

Replace the opening of that branch so it becomes a fragment:

```jsx
                                ) : filteredHistory.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
```

Then find the closing of the `overflow-x-auto` div (after `</TableBody></Table></div>`):

```jsx
                                    </div>
                                ) : (
```

Replace it with the fragment close and the guest footer, keeping the empty-state branch intact:

```jsx
                                        </div>
                                        {isGuest && (
                                            <div className="border-t border-border/40 px-4 py-3">
                                                <p className="text-xs text-muted-foreground">
                                                    Stored in this browser &middot; unlinked sessions expire after 7 days &middot;{' '}
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 text-xs font-medium"
                                                        onClick={() => setIsSignInOpen(true)}
                                                    >
                                                        Sign in to preserve &rarr;
                                                    </Button>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
```

- [ ] **Step 6.2 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors. If you get a JSX structure error, check that the `<>` and `</>` are symmetrically placed around both the `overflow-x-auto` div and the guest footer div, and that the `: (` for the empty-state branch follows immediately after `</>`.

- [ ] **Step 6.3 — Visual check**

Confirm:
- Guest with sessions: muted footer visible below the last table row, inside the card border
- Guest with no sessions: empty state shown, no footer
- Auth user with sessions: no footer visible
- "Sign in to preserve →" opens SignInDialog

- [ ] **Step 6.4 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: guest session expiry footer in history table"
```

---

## Chunk 3: Import modal

### Task 7: Import history modal with session list

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

- [ ] **Step 7.1 — Add the Dialog after `<SignInDialog />`**

Place this block directly after `<SignInDialog open={isSignInOpen} onClose={() => setIsSignInOpen(false)} />` and before the component's final closing `</div>`:

```jsx
{/* Import history modal — fires automatically after sign-in if guest had unlinked sessions */}
<Dialog open={showImportModal} onOpenChange={(open) => { if (!open) handleSkipImport(); }}>
    <DialogContent className="max-w-md">
        <DialogHeader>
            <DialogTitle>
                {accountSessionCount === 0
                    ? 'Import your guest sessions?'
                    : 'Merge your guest sessions?'
                }
            </DialogTitle>
            <DialogDescription>
                {accountSessionCount === 0
                    ? `We found ${pendingGuestCount} session${pendingGuestCount !== 1 ? 's' : ''} from your guest visit. Import them to get started.`
                    : `We found ${pendingGuestCount} session${pendingGuestCount !== 1 ? 's' : ''} from this browser. Add them to your ${accountSessionCount} existing session${accountSessionCount !== 1 ? 's' : ''}?`
                }
            </DialogDescription>
        </DialogHeader>

        {/* Session list — up to 5 sessions shown by name and date */}
        {pendingGuestSessions.length > 0 && (
            <ul className="space-y-1.5 rounded-lg border border-border/50 bg-muted/30 p-3">
                {pendingGuestSessions.map((session) => (
                    <li key={session.id} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground/80 truncate pr-4">
                            {session.roomName || 'Unnamed session'}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                            {new Date(session.endedAt || session.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </li>
                ))}
                {pendingGuestCount > pendingGuestSessions.length && (
                    <li className="text-xs text-muted-foreground pt-0.5">
                        +{pendingGuestCount - pendingGuestSessions.length} more
                    </li>
                )}
            </ul>
        )}

        <DialogFooter>
            <Button variant="ghost" onClick={handleSkipImport}>
                Start fresh
            </Button>
            <Button onClick={handleImportHistory}>
                Import sessions
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

- [ ] **Step 7.2 — Lint**

```bash
cd client && npx eslint src/pages/Dashboard.jsx --max-warnings 0
```

Expected: no errors.

- [ ] **Step 7.3 — Visual check: new account flow**

1. Open `/dashboard` as guest — accumulate sessions by joining rooms
2. Sign in via OAuth with a new account (no prior sessions)
3. Confirm: modal appears with headline "Import your guest sessions?", session list shows names + dates
4. Click "Import sessions" — modal closes, history re-fetches showing merged sessions
5. Sign out, sign back in — modal does **not** appear (already linked)

- [ ] **Step 7.4 — Visual check: returning account flow**

1. Sign in, play sessions — account now has history. Sign out.
2. Use dashboard as guest on same device — accumulate new guest sessions
3. Sign back in
4. Confirm: modal headline reads "Merge your guest sessions?" with existing session count in body
5. Click "Start fresh" — modal closes, only account history shown

- [ ] **Step 7.5 — Visual check: already-linked flow**

1. Sign in, import guest sessions. Sign out.
2. Use dashboard as guest again (same device, same UUID). Sign back in.
3. Confirm: modal does **not** appear (guest session IDs already present in account history)

- [ ] **Step 7.6 — Commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: import history modal for guest-to-auth transition"
```

---

## Chunk 4: Final verification

### Task 8: Lint, build, and cross-theme visual pass

- [ ] **Step 8.1 — Full lint pass**

```bash
cd client && npx eslint src/ --max-warnings 0
```

Expected: no errors.

- [ ] **Step 8.2 — Production build**

```bash
cd client && npm run build
```

Expected: build completes with no errors or warnings.

- [ ] **Step 8.3 — Cross-theme visual pass**

Toggle light and dark mode, check both guest and auth states:
- Guest banner: readable, no fill color, layout intact on mobile and desktop
- "Guest session" badge: muted, not intrusive
- History table footer: subtle, single line, "Sign in to preserve →" link visible
- Import modal: clean dialog in both themes, session list renders correctly, footer buttons spaced correctly

- [ ] **Step 8.4 — Final commit**

```bash
git add client/src/pages/Dashboard.jsx
git commit -m "feat: guest vs auth dashboard — verified and complete"
```
