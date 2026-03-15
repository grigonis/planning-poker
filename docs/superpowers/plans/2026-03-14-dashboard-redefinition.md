# Dashboard Redefinition Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Dashboard with a paginated session history table (10/page), a Rejoin button for still-active rooms, and a Delete button that permanently removes rooms (Firestore + in-memory) for room creators.

**Architecture:** Server-side: fix a latent `room.hostId` bug in `createRoomHandler`, add a `deleteSession` Firestore helper (cascade-deletes tasks subcollection), add a `delete_room` socket event handler that authorises by `hostId`. Client-side: extend Dashboard with pagination state, cross-reference `activeRooms` for Rejoin links, and an AlertDialog-confirmed delete flow.

**Tech Stack:** Node.js + Socket.io (server), React 18 + shadcn/ui + Lucide React (client), Firestore Admin SDK.

---

## Chunk 1: Server — fix hostId bug + add deleteSession

### Task 1: Fix `room.hostId` in `createRoomHandler`

**Files:**
- Modify: `server/handlers/roomHandlers.js` (around line 36–61)

**Context:** `createRoomHandler` builds the room object inline but never sets `room.hostId`. This means Firestore always stores `hostId: null`, and `getActiveRoomsByUserId` always returns `isHost: false`. This needs to be fixed before the delete feature can work.

- [ ] **Step 1: Open `server/handlers/roomHandlers.js` and locate the room object literal (around line 36)**

  Find the block:
  ```js
  const room = {
      id: roomId,
      users: new Map(),
      ...
  };
  ```

- [ ] **Step 2: Add `hostId` to the room object**

  Add `hostId: userId,` right after `id: roomId,`:
  ```js
  const room = {
      id: roomId,
      hostId: userId,       // ← add this line
      users: new Map(),
      ...
  };
  ```

- [ ] **Step 3: Verify by searching the file for `room.hostId`**

  After the fix, `upsertSession(room)` will now write the actual userId to Firestore. `getActiveRoomsByUserId` will now correctly return `isHost: true` for room creators.

- [ ] **Step 4: Commit**

  ```bash
  git add server/handlers/roomHandlers.js
  git commit -m "fix: set room.hostId in createRoomHandler so Firestore stores correct creator id"
  ```

---

### Task 2: Return `hostId` from Firestore history queries

**Files:**
- Modify: `server/firestore.js` (functions `getHistoryByUserId` ~line 152, `getHistoryByFirebaseUid` ~line 277)

**Context:** The Dashboard needs to know which sessions the current user created (to show the Delete button). The server must include `hostId` in each session object returned by the history queries.

- [ ] **Step 1: In `getHistoryByUserId`, add `hostId` to the returned session object**

  Find the `return { id: data.id, roomName: ...}` block (~line 152) and add `hostId`:
  ```js
  return {
      id: data.id,
      roomName: data.roomName || '',
      roomDescription: data.roomDescription || '',
      gameMode: data.gameMode || null,
      votingSystem: data.votingSystem || null,
      hostId: data.hostId || null,      // ← add this line
      participants: data.participants || [],
      tasks,
      createdAt: toISO(data.createdAt),
      endedAt: toISO(data.endedAt),
  };
  ```

- [ ] **Step 2: In `getHistoryByFirebaseUid`, apply the same change in the `fetchSessions` inner function**

  The `fetchSessions` inner helper (~line 264) also builds the same return object. Add the same `hostId` line there:
  ```js
  return {
      id: data.id,
      roomName: data.roomName || '',
      roomDescription: data.roomDescription || '',
      gameMode: data.gameMode || null,
      votingSystem: data.votingSystem || null,
      hostId: data.hostId || null,      // ← add this line
      participants: data.participants || [],
      tasks,
      createdAt: toISO(data.createdAt),
      endedAt: toISO(data.endedAt),
  };
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add server/firestore.js
  git commit -m "feat: include hostId in session history response"
  ```

---

### Task 3: Add `deleteSession` to `server/firestore.js`

**Files:**
- Modify: `server/firestore.js`

**Context:** Deleting a Firestore session requires two steps: (1) delete all documents in the `tasks` subcollection, then (2) delete the session document. Firestore does not cascade-delete subcollections automatically.

- [ ] **Step 1: Add the `deleteSession` function before the `module.exports` block**

  ```js
  /**
   * Permanently delete a session and all its tasks from Firestore.
   * Subcollection docs must be deleted individually — Firestore does not cascade.
   * @param {string} roomId
   */
  const deleteSession = async (roomId) => {
      try {
          const sessionRef = db.collection('sessions').doc(roomId);
          const tasksSnap = await sessionRef.collection('tasks').get();

          // Delete tasks subcollection docs in parallel
          await Promise.all(tasksSnap.docs.map(doc => doc.ref.delete()));

          // Delete the session document itself
          await sessionRef.delete();
          console.log(`[Firestore] deleteSession: ${roomId} deleted`);
      } catch (err) {
          console.error('[Firestore] deleteSession failed:', err.message);
          throw err; // Re-throw so handler can return error to caller
      }
  };
  ```

- [ ] **Step 2: Export `deleteSession` from `module.exports`**

  Find the `module.exports` block at the bottom and add `deleteSession`:
  ```js
  module.exports = {
      upsertSession,
      upsertTask,
      updateParticipants,
      closeSession,
      deleteSession,        // ← add this line
      getHistoryByUserId,
      getHistoryByFirebaseUid,
      upsertUser,
      getUserProfile,
  };
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add server/firestore.js
  git commit -m "feat: add deleteSession Firestore helper with subcollection cascade"
  ```

---

### Task 4: Add `delete_room` socket event handler

**Files:**
- Modify: `server/handlers/roomHandlers.js`

**Context:** The new `deleteRoomHandler` must:
1. Accept `{ roomId }` from the client
2. Authorise the request (caller must be the room's host)
3. If the room is still in-memory: notify all participants, kick them out, remove from in-memory store
4. Delete from Firestore (both the session doc and tasks subcollection)
5. Return `{ ok: true }` or `{ error: '...' }` via callback

**Authorization logic:**
- If room is still in-memory: check `user.isHost` (the in-memory boolean)
- If room only exists in Firestore (already ended): query Firestore to get `hostId`, then compare with caller's `userId` (for guests) or `socket.firebaseUid` (for authenticated users)

- [ ] **Step 1: Import `deleteSession` at the top of `roomHandlers.js`**

  Find the existing destructure import from `../firestore`:
  ```js
  const { upsertSession, updateParticipants, closeSession, getHistoryByUserId, getHistoryByFirebaseUid, upsertUser, getUserProfile } = require('../firestore');
  ```

  Add `deleteSession`:
  ```js
  const { upsertSession, updateParticipants, closeSession, deleteSession, getHistoryByUserId, getHistoryByFirebaseUid, upsertUser, getUserProfile } = require('../firestore');
  ```

- [ ] **Step 2: Add `deleteRoomHandler` function body inside `module.exports = (io, socket) => {`**

  Add this function after `endSessionHandler` (~line 324):

  ```js
  const deleteRoomHandler = async ({ roomId }, callback) => {
      // SEC-06: Rate limit check (reuse end_session bucket)
      if (!socket.checkRateLimit('end_session')) return callback?.({ error: 'Rate limited' });

      const userId = socket.data.userId;
      if (!userId || !roomId) return callback?.({ error: 'Missing userId or roomId' });

      try {
          const activeRoom = rooms.get(roomId);

          if (activeRoom) {
              // Room is still live — verify host via in-memory flag
              const user = activeRoom.users.get(userId);
              if (!user || !user.isHost) return callback?.({ error: 'Not authorized' });

              // Notify all participants that the room was deleted
              io.to(roomId).emit('session_ended');
              io.socketsLeave(roomId);
              rooms.delete(roomId);
          } else {
              // Room is only in Firestore — verify via hostId field
              const sessionDoc = await db.collection('sessions').doc(roomId).get();
              if (!sessionDoc.exists) return callback?.({ error: 'Room not found' });

              const data = sessionDoc.data();
              const isOwner =
                  (data.hostId && data.hostId === userId) ||
                  (data.hostId && socket.firebaseUid && data.hostId === socket.firebaseUid);

              if (!isOwner) return callback?.({ error: 'Not authorized' });
          }

          // Permanently delete from Firestore
          await deleteSession(roomId);
          console.log(`[Room] Room ${roomId} permanently deleted by ${userId}`);
          callback?.({ ok: true });
      } catch (err) {
          console.error('[deleteRoom] failed:', err.message);
          callback?.({ error: 'Delete failed' });
      }
  };
  ```

  **Note:** `deleteRoomHandler` needs access to `db` for the Firestore-only path. Import it at the top of the file:

  ```js
  const { db } = require('../firebase');
  ```

  Add this import after the existing requires at the top of `roomHandlers.js`.

- [ ] **Step 3: Register the event listener at the bottom of the handler block**

  Find the block with all `socket.on(...)` calls and add:
  ```js
  socket.on("delete_room", deleteRoomHandler);
  ```

- [ ] **Step 4: Verify the file compiles by starting the server**

  ```bash
  cd server && node index.js
  ```

  Expected: server starts without errors, "Listening on port 5000" (or similar).
  Stop the server (Ctrl+C).

- [ ] **Step 5: Commit**

  ```bash
  git add server/handlers/roomHandlers.js
  git commit -m "feat: add delete_room socket handler with host auth and Firestore cascade delete"
  ```

---

## Chunk 2: Client — Pagination + Rejoin + Delete

### Task 5: Add pagination to the session history table

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

**Context:** The table currently renders all `filteredHistory` rows at once. We need to add client-side pagination with 10 items per page. The paginator should reset to page 1 whenever the search query changes.

- [ ] **Step 1: Add pagination constants and state at the top of the `Dashboard` component**

  After the existing state declarations (~line 53), add:
  ```js
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  ```

- [ ] **Step 2: Reset to page 1 when search query changes**

  Add a `useEffect` that resets page on search change, or update the existing `setSearchQuery` handler:
  ```js
  const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
  };
  ```

  Replace the existing `onChange={(e) => setSearchQuery(e.target.value)}` on the Input with:
  ```jsx
  onChange={handleSearchChange}
  ```

- [ ] **Step 3: Compute paginated slice and total pages from `filteredHistory`**

  Add these derived values after the `filteredHistory` useMemo (or as additional derived variables):
  ```js
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const paginatedHistory = filteredHistory.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );
  ```

- [ ] **Step 4: Replace `filteredHistory.map(...)` in the `<TableBody>` with `paginatedHistory.map(...)`**

  Change the iterator:
  ```jsx
  {paginatedHistory.map((session) => (
      ...
  ))}
  ```

- [ ] **Step 5: Add the pagination controls below the `</Card>` closing tag of the table**

  Import `ChevronLeft` and `ChevronRight` from `lucide-react` (add to existing import at line 3).

  Add pagination UI after the `</Card>` closing the table:
  ```jsx
  {totalPages > 1 && (
      <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} &middot; {filteredHistory.length} sessions
          </p>
          <div className="flex items-center gap-1">
              <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
              >
                  <ChevronLeft size={14} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                  }, [])
                  .map((item, idx) =>
                      item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                      ) : (
                          <Button
                              key={item}
                              variant={currentPage === item ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg"
                              onClick={() => setCurrentPage(item)}
                          >
                              {item}
                          </Button>
                      )
                  )
              }
              <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
              >
                  <ChevronRight size={14} />
              </Button>
          </div>
      </div>
  )}
  ```

- [ ] **Step 6: Manual verification**

  - Start the dev server: `cd client && npm run dev`
  - Open Dashboard with more than 10 sessions — confirm only 10 rows show
  - Confirm Previous/Next and page number buttons work
  - Confirm search resets to page 1

- [ ] **Step 7: Commit**

  ```bash
  git add client/src/pages/Dashboard.jsx
  git commit -m "feat: add 10-per-page pagination to dashboard session history table"
  ```

---

### Task 6: Add Rejoin column to the session history table

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

**Context:** `activeRooms` is already fetched from the server. If a session.id exists in `activeRooms`, it means that room is still live. We show a "Rejoin" button (linked to `/room/{id}`) in a new Actions column.

- [ ] **Step 1: Build a Set of active room IDs for O(1) lookup**

  After the existing `filteredHistory` derivation, add:
  ```js
  const activeRoomIds = useMemo(
      () => new Set(activeRooms.map(r => r.id)),
      [activeRooms]
  );
  ```

- [ ] **Step 2: Add "Actions" column header to `<TableHeader>`**

  The current headers are: Room Name | Date | Participants | Resolved Tasks.
  Add a new `<TableHead>` at the end:
  ```jsx
  <TableHead className="font-bold py-4 w-[140px]">Actions</TableHead>
  ```

- [ ] **Step 3: Add "Actions" `<TableCell>` to each row**

  Inside `paginatedHistory.map(...)`, add a new `<TableCell>` at the end of each `<motion.tr>`:
  ```jsx
  <TableCell className="py-4">
      <div className="flex items-center gap-2">
          {activeRoomIds.has(session.id) && (
              <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg text-xs font-bold gap-1.5"
                  asChild
              >
                  <Link to={`/room/${session.id}`}>
                      <LogIn size={12} />
                      Rejoin
                  </Link>
              </Button>
          )}
      </div>
  </TableCell>
  ```

- [ ] **Step 4: Import `LogIn` from lucide-react**

  Add `LogIn` to the existing lucide-react import at line 3.

- [ ] **Step 5: Manual verification**

  - Create a room in one tab, open the Dashboard in another tab (same userId)
  - The room should appear in history AND in `activeRooms`
  - Confirm the "Rejoin" button appears for that session row
  - Click "Rejoin" — confirm it navigates to the room

- [ ] **Step 6: Commit**

  ```bash
  git add client/src/pages/Dashboard.jsx
  git commit -m "feat: add Rejoin button in dashboard for active rooms"
  ```

---

### Task 7: Add Delete button with confirmation dialog

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

**Context:** Authenticated room creators (where `session.hostId === userId`) can permanently delete sessions. This requires:
1. A Trash icon button in the Actions column (only visible for owned sessions)
2. An `AlertDialog` confirmation asking the user to confirm irreversible deletion
3. A socket emit of `delete_room` with the roomId
4. On success: remove the session from local state; show toast notification

- [ ] **Step 1: Import required icons and components**

  Add to the lucide-react import: `Trash2`

  Add AlertDialog imports (the component already exists at `client/src/components/ui/alert-dialog.tsx`):
  ```js
  import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
  } from '../components/ui/alert-dialog';
  ```

  Import the toast (sonner is already set up — check `client/src/components/ui/sonner.tsx`):
  ```js
  import { toast } from 'sonner';
  ```

- [ ] **Step 2: Add delete state inside the `Dashboard` component**

  ```js
  const [deletingRoomId, setDeletingRoomId] = useState(null); // roomId pending confirmation
  const [isDeleting, setIsDeleting] = useState(false);        // async in-flight
  ```

- [ ] **Step 3: Add `handleDeleteRoom` function**

  ```js
  const handleDeleteRoom = () => {
      if (!deletingRoomId || !socket) return;
      setIsDeleting(true);
      socket.emit('delete_room', { roomId: deletingRoomId }, (response) => {
          setIsDeleting(false);
          if (response?.ok) {
              setHistory(prev => prev.filter(s => s.id !== deletingRoomId));
              setActiveRooms(prev => prev.filter(r => r.id !== deletingRoomId));
              toast.success('Room deleted permanently.');
          } else {
              toast.error(response?.error || 'Failed to delete room.');
          }
          setDeletingRoomId(null);
      });
  };
  ```

- [ ] **Step 4: Add the Trash button inside the existing Actions `<TableCell>`**

  Inside the `<div className="flex items-center gap-2">` in the Actions cell (Task 6, Step 3), add the delete button after the Rejoin button:

  ```jsx
  {session.hostId === userId && (
      <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => setDeletingRoomId(session.id)}
      >
          <Trash2 size={13} />
      </Button>
  )}
  ```

- [ ] **Step 5: Add the `AlertDialog` outside the table (near the other dialogs at the bottom of the JSX)**

  Add before the `ProfileSetupDialog`:
  ```jsx
  <AlertDialog open={!!deletingRoomId} onOpenChange={(open) => !open && setDeletingRoomId(null)}>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Delete room permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently remove the room and all its voting history for every participant.
                  This action cannot be undone.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteRoom}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                  {isDeleting ? 'Deleting…' : 'Delete permanently'}
              </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
  </AlertDialog>
  ```

- [ ] **Step 6: Manual verification — Delete flow for an active room**

  - Open Dashboard in Tab A (as the room creator)
  - Create a room in Tab B
  - Refresh Dashboard in Tab A — confirm the room appears with a Trash button
  - Click Trash → AlertDialog appears
  - Click "Delete permanently" → confirm the row disappears from the table
  - In Tab B — confirm the session_ended event fires and user is redirected

- [ ] **Step 7: Manual verification — Delete flow for an ended room**

  - End a room session (via "End Session" in the room UI)
  - On Dashboard, confirm the ended room still shows the Trash button (user is host)
  - Delete it → confirm it disappears from the history table
  - Verify via Firebase console that the `sessions/{roomId}` document is gone

- [ ] **Step 8: Manual verification — Non-host cannot delete**

  - Log in as a different user who was a participant (not host) of a room
  - Confirm no Trash button appears for that room row

- [ ] **Step 9: Commit**

  ```bash
  git add client/src/pages/Dashboard.jsx
  git commit -m "feat: add permanent room delete for creators with AlertDialog confirmation"
  ```

---

## Chunk 3: Polish + Edge Cases

### Task 8: Update `getActiveRoomsByUserId` to expose hostId

**Files:**
- Modify: `server/store.js`

**Context:** The `getActiveRoomsByUserId` return already has an `isHost` field, but it checks `room.hostId === userId` — which was always false before Task 1 fixed the bug. After Task 1, this will work correctly for new rooms. However, old rooms in the in-memory store (created before the fix) will still have `hostId: undefined`. This is acceptable because those rooms existed before the fix and will expire via TTL. No code change needed here — the fix in Task 1 is sufficient. This task is documentation-only.

- [ ] **Step 1: Verify `isHost` in active rooms list**

  After creating a new room (post-fix), confirm that `get_active_rooms` returns `isHost: true` for the creator's active room entry. This can be verified by adding a `console.log` temporarily to `getUserActiveRoomsHandler` in `roomHandlers.js`:
  ```js
  console.log('[ActiveRooms]', activeRooms.map(r => ({ id: r.id, isHost: r.isHost })));
  ```

  Remove the log after confirming.

---

### Task 9: Guard against stale `activeRooms` after deletion

**Files:**
- Modify: `client/src/pages/Dashboard.jsx`

**Context:** After deleting a room (Task 7), we remove it from local `activeRooms` state. But the `activeRoomIds` Set is memoized — it will correctly update because `activeRooms` state changed. No extra code needed; verify this in the browser.

- [ ] **Step 1: Verify after delete**

  - After deleting an active room (from Task 7 Step 6), confirm that the "Rejoin" button for that room disappears immediately (no stale data in the UI).

---

### Task 10: Final smoke test + cleanup commit

- [ ] **Step 1: Smoke-test all three features end-to-end**

  - [ ] Create a room as User A → open Dashboard → confirm it appears in history
  - [ ] Pagination: add enough history (or reduce ITEMS_PER_PAGE temporarily to 2 for testing) to see pagination controls — navigate pages
  - [ ] Rejoin: from Dashboard, click "Rejoin" on an active room → confirm you enter the room with your prior userId (reconnect, not new join)
  - [ ] Delete (active room): delete an active room → confirm session_ended fires for connected participants
  - [ ] Delete (ended room): end a session, go to Dashboard, delete it → confirm it's gone from the table and from Firestore
  - [ ] Delete (auth): as a non-host participant, confirm no Trash button is shown

- [ ] **Step 2: Restore ITEMS_PER_PAGE to 10 if changed during testing**

- [ ] **Step 3: Final commit**

  ```bash
  git add -A
  git commit -m "chore: dashboard redefinition — smoke-tested and ready"
  ```

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `server/handlers/roomHandlers.js` | Fix `room.hostId`; import `db`; import `deleteSession`; add `deleteRoomHandler` |
| `server/firestore.js` | Add `deleteSession`; add `hostId` to history returns |
| `client/src/pages/Dashboard.jsx` | Pagination state + UI; `activeRoomIds` Set; Rejoin button; Delete button + AlertDialog |
| `server/store.js` | No change (bug fixed in Task 1 makes `isHost` work correctly) |
