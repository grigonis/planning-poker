const { db } = require('./firebase');

/**
 * Create or update the session document for a room.
 * Safe to call multiple times — uses merge so the tasks subcollection is never overwritten.
 * @param {object} room - in-memory room object from store.js
 */
const upsertSession = async (room) => {
    try {
        const participants = Array.from(room.users.values()).map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            avatarSeed: u.avatarSeed || null,
            avatarPhotoURL: u.avatarPhotoURL || null,
        }));

        await db.collection('sessions').doc(room.id).set({
            id: room.id,
            roomName: room.roomName || null,
            roomDescription: room.roomDescription || null,
            gameMode: room.gameMode || null,
            votingSystem: room.votingSystem || null,
            hostId: room.hostId || null,
            participants,
            // Flat array of participant IDs — enables efficient array-contains queries in Firestore
            participantIds: participants.map(p => p.id),
            // Use ISO string for createdAt so reads are immediate (server timestamps are async)
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            endedAt: null,
        }, { merge: true });
    } catch (err) {
        console.error('[Firestore] upsertSession failed:', err.message);
    }
};

/**
 * Write or update a single resolved task under a session.
 * Called immediately after performReveal when an active task is present.
 * @param {string} roomId
 * @param {object} task - { id, title, votes, status }
 * @param {Array}  participants - snapshot of room.users at reveal time
 */
const upsertTask = async (roomId, task, participants) => {
    try {
        await db
            .collection('sessions')
            .doc(roomId)
            .collection('tasks')
            .doc(task.id)
            .set({
                id: task.id,
                title: task.title,
                votes: task.votes,
                status: task.status,
                resolvedAt: new Date().toISOString(),
                participants: participants.map(u => ({
                    id: u.id,
                    name: u.name,
                    role: u.role,
                    avatarSeed: u.avatarSeed || null,
                    avatarPhotoURL: u.avatarPhotoURL || null,
                })),
            }, { merge: true });
    } catch (err) {
        console.error('[Firestore] upsertTask failed:', err.message);
    }
};

/**
 * Update the participants array on a session document.
 * Called on join and leave events.
 * @param {string} roomId
 * @param {Array}  users - array of user objects from room.users
 */
const updateParticipants = async (roomId, users) => {
    try {
        const participants = users.map(u => ({
            id: u.id,
            name: u.name,
            role: u.role,
            avatarSeed: u.avatarSeed || null,
            avatarPhotoURL: u.avatarPhotoURL || null,
        }));

        await db.collection('sessions').doc(roomId).set({
            participants,
            participantIds: participants.map(p => p.id),
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } catch (err) {
        console.error('[Firestore] updateParticipants failed:', err.message);
    }
};

/**
 * Mark a session as ended.
 * @param {string} roomId
 */
const closeSession = async (roomId) => {
    try {
        await db.collection('sessions').doc(roomId).set({
            endedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } catch (err) {
        console.error('[Firestore] closeSession failed:', err.message);
    }
};

/**
 * Fetch session history for a user, ordered newest-first.
 * Uses participantIds array-contains for an indexed query.
 * Fetches the tasks subcollection for each session.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
const getHistoryByUserId = async (userId) => {
    try {
        const snapshot = await db
            .collection('sessions')
            .where('participantIds', 'array-contains', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        // Handle both ISO strings (new) and Firestore Timestamps (legacy docs)
        const toISO = (val) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate().toISOString();
            return val;
        };

        const sessions = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Fetch tasks subcollection
                const tasksSnap = await doc.ref.collection('tasks').get();
                const tasks = tasksSnap.docs.map(t => {
                    const td = t.data();
                    return {
                        id: td.id,
                        title: td.title,
                        votes: td.votes,
                        status: td.status,
                        resolvedAt: toISO(td.resolvedAt),
                    };
                });

                return {
                    id: data.id,
                    roomName: data.roomName || '',
                    roomDescription: data.roomDescription || '',
                    gameMode: data.gameMode || null,
                    votingSystem: data.votingSystem || null,
                    participants: data.participants || [],
                    tasks,
                    createdAt: toISO(data.createdAt),
                    endedAt: toISO(data.endedAt),
                };
            })
        );

        return sessions;
    } catch (err) {
        console.error('[Firestore] getHistoryByUserId failed:', err.message);
        return [];
    }
};

/**
 * Create or update a Firebase user record in Firestore.
 * Called from the socket auth middleware on every authenticated connection,
 * and when profile or guest UUID data needs to be synced.
 *
 * @param {string} uid - Firebase UID
 * @param {{ email?, displayName?, photoURL?, name?, avatarSeed?, guestUuid? }} data
 */
const upsertUser = async (uid, data) => {
    try {
        const update = {
            uid,
            lastSeenAt: new Date().toISOString(),
        };
        if (data.email      !== undefined) update.email       = data.email ?? null;
        if (data.displayName !== undefined) update.displayName = data.displayName ?? null;
        if (data.photoURL   !== undefined) update.photoURL    = data.photoURL ?? null;
        if (data.name       !== undefined) update.name        = data.name ?? null;
        if (data.avatarSeed !== undefined) update.avatarSeed  = data.avatarSeed ?? null;

        const ref = db.collection('users').doc(uid);

        // Single read covers: set createdAt on first write only, and link guestUuid only once.
        // This read happens on every authenticated socket connect — acceptable given it's one
        // point-read and avoids a second round-trip write.
        const existing = await ref.get();
        const existingData = existing.exists ? existing.data() : {};

        if (!existingData.createdAt) update.createdAt = new Date().toISOString();

        if (data.guestUuid && !existingData.guestUuid) {
            update.guestUuid = data.guestUuid;
            console.log(`[Auth] Linked guest UUID ${data.guestUuid} to uid ${uid}`);
        }

        await ref.set(update, { merge: true });
    } catch (err) {
        console.error('[Firestore] upsertUser failed:', err.message);
    }
};

/**
 * Fetch a user's stored profile from Firestore.
 * Returns null if the document doesn't exist.
 * @param {string} uid - Firebase UID
 * @returns {Promise<{name:string|null, avatarSeed:string|null, guestUuid:string|null}|null>}
 */
const getUserProfile = async (uid) => {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) return null;
        const d = doc.data();
        return {
            name:       d.name       ?? null,
            avatarSeed: d.avatarSeed ?? null,
            guestUuid:  d.guestUuid  ?? null,
        };
    } catch (err) {
        console.error('[Firestore] getUserProfile failed:', err.message);
        return null;
    }
};

/**
 * Fetch session history for a Firebase-authenticated user.
 * Merges sessions found by Firebase UID and by linked guest UUID (if any).
 * @param {string} uid - Firebase UID
 * @returns {Promise<Array>}
 */
const getHistoryByFirebaseUid = async (uid) => {
    try {
        // Fetch the user doc to get the linked guest UUID
        const profile = await getUserProfile(uid);
        const guestUuid = profile?.guestUuid ?? null;

        const toISO = (val) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate().toISOString();
            return val;
        };

        const fetchSessions = async (queryId) => {
            const snapshot = await db
                .collection('sessions')
                .where('participantIds', 'array-contains', queryId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            return Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const tasksSnap = await doc.ref.collection('tasks').get();
                const tasks = tasksSnap.docs.map(t => {
                    const td = t.data();
                    return {
                        id: td.id,
                        title: td.title,
                        votes: td.votes,
                        status: td.status,
                        resolvedAt: toISO(td.resolvedAt),
                    };
                });
                return {
                    id: data.id,
                    roomName: data.roomName || '',
                    roomDescription: data.roomDescription || '',
                    gameMode: data.gameMode || null,
                    votingSystem: data.votingSystem || null,
                    participants: data.participants || [],
                    tasks,
                    createdAt: toISO(data.createdAt),
                    endedAt: toISO(data.endedAt),
                };
            }));
        };

        // Run queries in parallel — uid query always runs; guest UUID query only if linked
        const queries = [fetchSessions(uid)];
        if (guestUuid && guestUuid !== uid) queries.push(fetchSessions(guestUuid));

        const results = await Promise.all(queries);
        const all = results.flat();

        // Dedup by session id, then sort newest-first
        const seen = new Set();
        const deduped = all.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        });
        deduped.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        return deduped.slice(0, 50);
    } catch (err) {
        console.error('[Firestore] getHistoryByFirebaseUid failed:', err.message);
        return [];
    }
};

module.exports = {
    upsertSession,
    upsertTask,
    updateParticipants,
    closeSession,
    getHistoryByUserId,
    getHistoryByFirebaseUid,
    upsertUser,
    getUserProfile,
};
