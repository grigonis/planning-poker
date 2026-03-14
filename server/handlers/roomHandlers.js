const { v4: uuidv4 } = require('uuid');
const { rooms, getActiveRoomsByUserId } = require('../store');
const { upsertSession, updateParticipants, closeSession, getHistoryByUserId, getHistoryByFirebaseUid, upsertUser, getUserProfile } = require('../firestore');
const { getUser } = require('./utils');

// Trim and cap string inputs to prevent oversized payloads
const sanitize = (str, maxLen = 200) =>
    typeof str === 'string' ? str.trim().slice(0, maxLen) : '';

module.exports = (io, socket) => {
    const checkRoomHandler = ({ roomId }, callback) => {
        const room = rooms.get(roomId);
        if (room) {
            callback({
                exists: true,
                mode: room.gameMode,
                groups: Array.from(room.groups.values()),
                groupsEnabled: room.groupsEnabled
            });
        } else {
            callback({ exists: false });
        }
    };

    const createRoomHandler = ({ roomName, role, gameMode, presetParams, userId: passedUserId }, callback) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('create_room')) return;

        // QA-06: Prevent collision with existing rooms
        let roomId;
        do { roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); }
        while (rooms.has(roomId));

        const userId = passedUserId || uuidv4();

        const room = {
            id: roomId,
            users: new Map(), // Key: userId, Value: User Object
            votes: new Map(), // Key: userId, Value: Vote
            phase: 'IDLE',
            gameMode: gameMode || 'STANDARD',
            funFeatures: false,
            autoReveal: true,
            anonymousMode: false,
            averages: {},
            votingSystem: presetParams?.votingSystem || {
                type: 'FIBONACCI_MODIFIED',
                name: 'Modified Fibonacci',
                values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
            },
            roomName: sanitize(roomName, 80),
            roomDescription: '',
            lastActivity: Date.now(),
            tasks: [],
            activeTaskId: null,
            groups: new Map(),   // groupId -> { id, name, color }
            groupsEnabled: false
        };

        // Host role: DEV (estimator) unless spectator was explicitly chosen.
        const hostRole = role === 'SPECTATOR' ? 'SPECTATOR' : 'DEV';

        // Host is created without a name — the client will call update_profile
        // immediately after the ProfileSetupDialog is completed.
        const host = {
            id: userId,
            name: '',
            role: hostRole,
            isHost: true,
            socketId: socket.id,
            connected: true,
            groupId: null,
            avatarSeed: null,
            avatarPhotoURL: null
        };

        room.users.set(userId, host);
        rooms.set(roomId, room);

        socket.join(roomId);
        // Store userId on socket for easy lookup
        socket.data.userId = userId;
        socket.data.roomId = roomId;

        // Persist session to Firestore (fire-and-forget)
        upsertSession(room).catch(err => console.error('[Firestore] createRoom upsertSession failed:', err.message));

        callback({
            roomId,
            userId,
            gameMode: room.gameMode,
            funFeatures: room.funFeatures,
            autoReveal: room.autoReveal,
            anonymousMode: room.anonymousMode,
            votingSystem: room.votingSystem,
            roomName: room.roomName,
            roomDescription: room.roomDescription,
            tasks: room.tasks,
            activeTaskId: room.activeTaskId,
            users: Array.from(room.users.values()),
            groups: Array.from(room.groups.values()),
            groupsEnabled: room.groupsEnabled
        });
        console.log(`Room created: ${roomId} by ${socket.id} as ${hostRole} in ${room.gameMode} mode (roomName: "${room.roomName}")`);
    };

    const updateRoomSettingsHandler = ({ roomId, settings }) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('update_room_settings')) return;

        // SEC-02: Only the host may change room settings
        const result = getUser(socket);
        if (!result || !result.user.isHost) return;
        const { room } = result;

        if (settings.funFeatures !== undefined) room.funFeatures = !!settings.funFeatures;
        if (settings.autoReveal !== undefined) room.autoReveal = !!settings.autoReveal;
        if (settings.anonymousMode !== undefined) room.anonymousMode = !!settings.anonymousMode;
        // SEC-03/SEC-09: Validate votingSystem structure before accepting
        if (settings.votingSystem !== undefined) {
            const vs = settings.votingSystem;
            if (vs && typeof vs.type === 'string' && typeof vs.name === 'string' && Array.isArray(vs.values) && vs.values.length > 0 && vs.values.length <= 30) {
                room.votingSystem = vs;
            }
        }
        if (settings.roomName !== undefined) room.roomName = sanitize(settings.roomName, 80);
        if (settings.roomDescription !== undefined) room.roomDescription = sanitize(settings.roomDescription, 300);
        if (settings.groupsEnabled !== undefined) room.groupsEnabled = !!settings.groupsEnabled;

        room.lastActivity = Date.now();

        // Broadcast actual room state, not raw client payload
        const updatedSettings = {
            funFeatures: room.funFeatures,
            autoReveal: room.autoReveal,
            anonymousMode: room.anonymousMode,
            votingSystem: room.votingSystem,
            roomName: room.roomName,
            roomDescription: room.roomDescription,
            groupsEnabled: room.groupsEnabled,
        };
        io.to(roomId).emit('room_settings_updated', { settings: updatedSettings });
        console.log(`Room ${roomId} settings updated by host`);
    };

    const joinRoomHandler = ({ roomId, name, role, userId, avatarPhotoURL }, callback) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('join_room')) return;

        // SEC-07: Sanitize string inputs
        name = sanitize(name, 50);
        // Validate avatarPhotoURL: must be http(s) URL if provided
        const safePhotoURL = (avatarPhotoURL && typeof avatarPhotoURL === 'string' && /^https?:\/\//i.test(avatarPhotoURL))
            ? avatarPhotoURL.slice(0, 500) : null;
        const room = rooms.get(roomId);

        if (!room) {
            return callback({ error: 'Room not found' });
        }

        let user;
        const existingUser = userId ? room.users.get(userId) : null;

        if (existingUser) {
            // RECONNECT
            user = existingUser;
            user.socketId = socket.id;
            user.connected = true;

            // Re-sync name if changed
            if (name && name !== user.name) user.name = name;
            // Update photo URL if provided
            if (safePhotoURL !== null) user.avatarPhotoURL = safePhotoURL;

        } else {
            // NEW JOIN
            const newUserId = userId || uuidv4();
            // Enforce STANDARD roles
            const finalRole = role === 'SPECTATOR' ? 'SPECTATOR' : 'DEV';

            user = {
                id: newUserId,
                name,
                role: finalRole,
                isHost: false,
                socketId: socket.id,
                connected: true,
                groupId: null,
                avatarPhotoURL: safePhotoURL
            };
            room.users.set(newUserId, user);
        }

        socket.join(roomId);
        socket.data.userId = user.id;
        socket.data.roomId = roomId;
        room.lastActivity = Date.now();

        // Update participants in Firestore (fire-and-forget)
        updateParticipants(roomId, Array.from(room.users.values()))
            .catch(err => console.error('[Firestore] joinRoom updateParticipants failed:', err.message));

        // Convert Map to Array for frontend
        const usersList = Array.from(room.users.values());
        const votesList = Array.from(room.votes.entries());

        // Broadcast to others
        socket.to(roomId).emit('user_joined', usersList);

        // Return current state to joiner
        callback({
            users: usersList,
            phase: room.phase,
            // During VOTING: send which users voted (masked as 'VOTED') so rejoining clients know their vote state
            votes: room.phase === 'REVEALED' ? votesList : votesList.map(([uid]) => [uid, 'VOTED']),
            // Send back their own userId so they can save it
            userId: user.id,
            mode: room.gameMode,
            funFeatures: room.funFeatures,
            autoReveal: room.autoReveal,
            anonymousMode: room.anonymousMode,
            votingSystem: room.votingSystem,
            roomName: room.roomName,
            roomDescription: room.roomDescription,
            tasks: room.tasks,
            activeTaskId: room.activeTaskId,
            groups: Array.from(room.groups.values()),
            groupsEnabled: room.groupsEnabled
        });

        console.log(`${name} joined ${roomId} as ${user.role} (User ID: ${user.id})`);
    };

    const disconnectHandler = () => {
        const userId = socket.data.userId;
        const roomId = socket.data.roomId;

        if (userId && roomId) {
            const room = rooms.get(roomId);
            if (room) {
                const user = room.users.get(userId);
                if (user) {
                    user.connected = false;
                    // Broadcast update
                    const usersList = Array.from(room.users.values());
                    io.to(roomId).emit('user_joined', usersList); // Re-use user_joined to update list
                    console.log(`User disconnected: ${userId} from room ${roomId}`);

                    // Update participants in Firestore (fire-and-forget)
                    updateParticipants(roomId, usersList)
                        .catch(err => console.error('[Firestore] disconnect updateParticipants failed:', err.message));
                }
            }
        }
    };

    const reactionHandler = ({ roomId, emojiId, emojiIcon }) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('send_reaction')) return;

        // SEC-05: Verify caller is actually in the room they're posting to
        if (socket.data.roomId !== roomId) return;
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user) {
                room.lastActivity = Date.now();
                io.to(roomId).emit('show_reaction', {
                    emojiId,
                    emojiIcon,
                    userId,
                    userName: user.name
                });
            }
        }
    };

    const updateProfileHandler = ({ roomId, name, avatarSeed, avatarPhotoURL }) => {
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user) {
                if (name) user.name = sanitize(name, 50);
                if (avatarSeed) user.avatarSeed = sanitize(avatarSeed, 200);
                // avatarPhotoURL: accept only http(s) URLs, cap length
                if (avatarPhotoURL && typeof avatarPhotoURL === 'string' && /^https?:\/\//i.test(avatarPhotoURL)) {
                    user.avatarPhotoURL = avatarPhotoURL.slice(0, 500);
                } else if (avatarPhotoURL === null) {
                    user.avatarPhotoURL = null;
                }
                // Broadcast update
                const usersList = Array.from(room.users.values());
                io.to(roomId).emit('user_joined', usersList);
            }
        }
    };

    const endSessionHandler = ({ roomId }) => {
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user && user.isHost) {
                // Mark session as ended in Firestore (fire-and-forget)
                closeSession(roomId)
                    .catch(err => console.error('[Firestore] endSession closeSession failed:', err.message));

                io.to(roomId).emit('session_ended');
                io.socketsLeave(roomId);
                rooms.delete(roomId);
                console.log(`Room ${roomId} ended by host ${user.name}.`);
            }
        }
    };

    const getUserHistoryHandler = async ({ userId }, callback) => {
        try {
            // Authenticated users: merge sessions found by Firebase UID + linked guest UUID
            if (socket.firebaseUid) {
                const history = await getHistoryByFirebaseUid(socket.firebaseUid);
                return callback(history);
            }
            // Guest: fall back to UUID-only query
            if (!userId) return callback([]);
            const history = await getHistoryByUserId(userId);
            callback(history);
        } catch (err) {
            console.error('[getUserHistory] failed:', err.message);
            callback([]);
        }
    };

    /**
     * Link a guest UUID to the authenticated Firebase user document.
     * Only stores guestUuid if not already set (preserves earliest linkage).
     * No-op for guests (socket.firebaseUid is null).
     */
    const linkGuestUidHandler = async ({ guestUuid }, callback) => {
        try {
            const uid = socket.firebaseUid;
            if (!uid || !guestUuid) return callback?.({ ok: false });
            await upsertUser(uid, { guestUuid });
            callback?.({ ok: true });
        } catch (err) {
            console.error('[linkGuestUid] failed:', err.message);
            callback?.({ ok: false });
        }
    };

    /**
     * Load a user's stored profile (name, avatarSeed) from Firestore.
     * Returns {} for guests or if no profile stored.
     */
    const loadUserProfileHandler = async (_, callback) => {
        try {
            const uid = socket.firebaseUid;
            if (!uid) return callback({});
            const profile = await getUserProfile(uid);
            if (profile) {
                console.log(`[Auth] Profile loaded from Firestore for ${uid}`);
            }
            callback(profile ?? {});
        } catch (err) {
            console.error('[loadUserProfile] failed:', err.message);
            callback({});
        }
    };

    const getUserActiveRoomsHandler = ({ userId }, callback) => {
        if (!userId) return callback([]);
        const activeRooms = getActiveRoomsByUserId(userId);
        callback(activeRooms);
    };

    socket.on("check_room", checkRoomHandler);
    socket.on("create_room", createRoomHandler);
    socket.on("join_room", joinRoomHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("toggle_fun_features", updateRoomSettingsHandler); // keeping legacy name for backwards compatibility temporarily
    socket.on("update_room_settings", updateRoomSettingsHandler);
    socket.on("send_reaction", reactionHandler);
    socket.on("update_avatar", updateProfileHandler); // fallback for existing UI
    socket.on("update_profile", updateProfileHandler);
    socket.on("end_session", endSessionHandler);
    socket.on("get_user_history", getUserHistoryHandler);
    socket.on("get_active_rooms", getUserActiveRoomsHandler);
    socket.on("link_guest_uid", linkGuestUidHandler);
    socket.on("load_user_profile", loadUserProfileHandler);
    socket.on("save_user_profile", async ({ name, avatarSeed, avatarPhotoURL } = {}, callback) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('save_user_profile')) return;

        try {
            const uid = socket.firebaseUid;
            if (!uid) return callback?.({ ok: false });
            await upsertUser(uid, {
                ...(name           !== undefined ? { name: sanitize(name, 50) }           : {}),
                ...(avatarSeed     !== undefined ? { avatarSeed: sanitize(avatarSeed, 200) } : {}),
                ...(avatarPhotoURL !== undefined ? { avatarPhotoURL: sanitize(avatarPhotoURL, 500) } : {}),
            });
            callback?.({ ok: true });
        } catch (err) {
            console.error('[saveUserProfile] failed:', err.message);
            callback?.({ ok: false });
        }
    });
};
