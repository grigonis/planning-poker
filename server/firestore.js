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
 * Called from the socket auth middleware on every authenticated connection.
 * @param {string} uid - Firebase UID
 * @param {{ email, displayName, photoURL }} data
 */
const upsertUser = async (uid, data) => {
    try {
        await db.collection('users').doc(uid).set({
            uid,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            photoURL: data.photoURL ?? null,
            lastSeenAt: new Date().toISOString(),
        }, { merge: true });

        // Set createdAt only on first write (merge won't overwrite it)
        await db.collection('users').doc(uid).set({
            createdAt: new Date().toISOString(),
        }, { merge: true });
    } catch (err) {
        console.error('[Firestore] upsertUser failed:', err.message);
    }
};

module.exports = { upsertSession, upsertTask, updateParticipants, closeSession, getHistoryByUserId, upsertUser };
