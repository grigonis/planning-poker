const { db, admin } = require('./firebase');

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

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
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
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
                resolvedAt: serverTimestamp(),
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
            updatedAt: serverTimestamp(),
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
            endedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.error('[Firestore] closeSession failed:', err.message);
    }
};

module.exports = { upsertSession, upsertTask, updateParticipants, closeSession };
