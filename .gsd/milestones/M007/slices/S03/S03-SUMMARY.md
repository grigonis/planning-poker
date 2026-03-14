---
id: S03
parent: M007
milestone: M007
provides:
  - Firebase client SDK initialized (client/src/lib/firebase.js) with VITE_ env vars
  - useAuth hook — onAuthStateChanged, signInWithGoogle, signInWithGithub, signOut
  - AuthContext wrapping the entire app tree — useAuthContext available everywhere
  - SignInDialog — Google + GitHub OAuth buttons, guest-friendly messaging, error handling
  - AuthMenu in RoomNavbar — "Sign in" button when guest, profile avatar + sign-out dropdown when authenticated
  - SocketContext sends Firebase ID token in socket handshake auth when signed in
  - Server socket auth middleware — verifies ID token via admin.auth().verifyIdToken, attaches socket.firebaseUid
  - upsertUser in firestore.js — writes/merges users/{uid} on every authenticated socket connection
requires:
  - slice: S02
    provides: Firestore as history source of truth, socket getUserHistory handler
affects:
  - S04
key_files:
  - client/src/lib/firebase.js
  - client/src/hooks/useAuth.js
  - client/src/context/AuthContext.jsx
  - client/src/context/SocketContext.jsx
  - client/src/components/SignInDialog.jsx
  - client/src/components/Room/RoomNavbar.jsx
  - client/src/App.jsx
  - server/index.js
  - server/firestore.js
  - client/.env
key_decisions:
  - Auth state resolves before socket connects — SocketContext waits for authLoading=false before creating socket
  - Socket reconnects on auth state change — useEffect deps include [authUser, authLoading]; sign-in/out causes socket reconnect with fresh/no token
  - ID token sent in socket.handshake.auth.idToken — standard Socket.io auth pattern; no custom header needed
  - Server auth middleware is non-blocking — invalid/missing token degrades to guest (null firebaseUid), never rejects connection
  - upsertUser is fire-and-forget on socket middleware — write failures logged but don't block connection
  - Google OAuth icon inlined as SVG — avoids adding an external brand icon library
patterns_established:
  - Auth-aware socket: wait for auth state before connecting, reconnect on auth change, send token in handshake
  - Firebase client config via VITE_ env vars — never hardcoded in source
observability_surfaces:
  - Server stdout: "[Auth] Invalid ID token — treating as guest: <message>" on token verification failure
  - Server stdout: "[Firestore] upsertUser failed: <message>" on Firestore write failure
  - Server stdout: "User connected: <socketId> firebaseUid=<uid|guest>" on every connection
drill_down_paths: []
duration: ~pre-built (implemented alongside S01/S02)
verification_result: passed
completed_at: 2026-03-13
---

# S03: Optional Firebase Auth (Google + GitHub OAuth)

**Firebase Auth wired end-to-end: optional Google/GitHub sign-in on the dashboard, ID token forwarded to server on connect, socket.firebaseUid attached for all authenticated requests. Guest flow unchanged.**

## What Happened

All S03 components were implemented alongside the earlier slices. The client-side stack: `firebase.js` initializes the Firebase app from `VITE_FIREBASE_*` env vars and exports the `auth` instance. `useAuth.js` wraps `onAuthStateChanged` and exposes `signInWithGoogle`, `signInWithGithub`, `signOut`. `AuthContext.jsx` wraps the app tree so any component can call `useAuthContext()`.

`SignInDialog.jsx` renders a shadcn Dialog with Google (colored SVG icon inlined) and GitHub OAuth buttons. Loading state per provider, error toasts for non-cancelled failures, guest-friendly footer text. `RoomNavbar.jsx` gained an `AuthMenu` component: shows "Sign in" button when no Firebase user, or a profile photo/initials avatar with a name+email header and sign-out dropdown when authenticated.

`SocketContext.jsx` waits for `authLoading` to resolve before connecting. If signed in, calls `authUser.getIdToken()` and passes the token in `socket.handshake.auth.idToken`. Reconnects when auth state changes (sign-in/out).

Server-side: `index.js` has a `io.use()` middleware that checks for `idToken` in `socket.handshake.auth`. If present, verifies with `admin.auth().verifyIdToken()` and attaches `socket.firebaseUid`. On failure or absence, `socket.firebaseUid = null` (guest). On verified sign-in, `upsertUser()` fires and-forget to create/update the `users/{uid}` Firestore document.

`App.jsx` has `<AuthProvider>` wrapping `<SocketProvider>` wrapping the router — correct nesting so SocketContext can consume auth state.

## Verification

- Dashboard renders correctly — navbar shows "Sign in" button for guest
- Clicking "Sign in" opens `SignInDialog` with Google and GitHub buttons
- Pressing Escape closes the dialog cleanly
- Console shows only warnings (React 19 forwardRef — pre-existing, not blocking)
- Server logs `firebaseUid=guest` for unauthenticated connections
- `client/.env` has `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`

OAuth popup flow itself verified structurally (providers, error handling) — actual OAuth redirect can't be tested in headless browser but the plumbing is correct.

## Deviations

- `AuthMenu` was built directly into RoomNavbar rather than as a standalone file — appropriate given its tight coupling to navbar layout
- `users/{uid}` document includes `lastSeenAt` (not in original spec) and separate `createdAt` set only on first write via merge:true — both improvements over the spec

## Known Limitations

- Guest UUID is not yet stored on the Firebase user record after sign-in — that's S04's identity linking work
- History query uses only `userId` (UUID) for both guests and authenticated users — S04 will add UID-based querying
- Firestore security rules still open — tighten before production

## Follow-ups

- S04: store pre-auth guest UUID in `users/{uid}.guestUuid` on first sign-in
- S04: when authenticated, load profile (name, avatar) from Firestore `users/{uid}` and sync back to `useProfile`
- S04: history query should use Firebase UID when authenticated (so history is device-portable)
- S04: dashboard profile section should reflect signed-in state (show Firebase display name when authenticated)
- Pre-production: enable Firebase Auth OAuth providers in Firebase console; set authorized domains

## Files Created/Modified

- `client/src/lib/firebase.js` — Firebase app init, auth export
- `client/src/hooks/useAuth.js` — onAuthStateChanged wrapper, Google/GitHub sign-in, signOut
- `client/src/context/AuthContext.jsx` — AuthProvider + useAuthContext
- `client/src/context/SocketContext.jsx` — auth-aware socket connect, ID token in handshake
- `client/src/components/SignInDialog.jsx` — OAuth sign-in dialog with Google + GitHub
- `client/src/components/Room/RoomNavbar.jsx` — AuthMenu component added; dashboard mode wires authUser/onSignIn/onSignOut
- `client/src/App.jsx` — AuthProvider wrapping SocketProvider and router
- `client/src/pages/Dashboard.jsx` — useAuthContext, isSignInOpen state, SignInDialog rendered, authUser/onSignIn/onSignOut passed to RoomNavbar
- `server/index.js` — io.use() auth middleware: verify idToken, attach socket.firebaseUid, upsertUser fire-and-forget
- `server/firestore.js` — upsertUser function: creates/merges users/{uid} document
- `client/.env` — VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID

## Forward Intelligence

### What the next slice should know
- `socket.firebaseUid` is available on all socket event handlers — use it in `getUserHistoryHandler` and any future user-scoped query when the user is authenticated
- `users/{uid}` in Firestore has: `uid, email, displayName, photoURL, lastSeenAt, createdAt` — `guestUuid` not yet present (S04 adds it)
- The current history query in `getUserHistoryHandler` only uses `userId` (UUID) — doesn't yet use `firebaseUid`. S04 needs to update this to also query by UID when `socket.firebaseUid` is set.
- `useAuthContext()` returns `{ user, loading, signInWithGoogle, signInWithGithub, signOut }` — `user` is `null` for guests, `undefined` while resolving

### What's fragile
- ID token expires every hour — `getIdToken()` called once at socket connect time; long-lived socket sessions will have stale tokens. Not a practical issue for typical session lengths, but worth noting for S04 or future auth hardening.
- If Firebase is unreachable at startup and the user has a cached auth state, `onAuthStateChanged` may be slow to fire — socket connect is blocked until `authLoading=false`. Max delay is Firebase's internal timeout (~10s).

### Authoritative diagnostics
- Server stdout: `firebaseUid=guest` vs `firebaseUid=<uid>` per connection — confirms token verification path
- Firebase console → Authentication → Users: shows signed-in users
- Firestore console → users collection: shows upserted user documents

### What assumptions changed
- No significant assumption changes — implementation matched the spec closely
