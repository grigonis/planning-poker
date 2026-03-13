const { v4: uuidv4 } = require('uuid');
const { rooms, addHistory, getHistoryByUserId, getActiveRoomsByUserId } = require('../store');

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
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
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
            roomName: roomName || '',
            roomDescription: '',
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
            avatarSeed: null
        };

        room.users.set(userId, host);
        rooms.set(roomId, room);

        socket.join(roomId);
        // Store userId on socket for easy lookup
        socket.data.userId = userId;
        socket.data.roomId = roomId;

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
        const room = rooms.get(roomId);
        if (room) {
            if (settings.funFeatures !== undefined) room.funFeatures = settings.funFeatures;
            if (settings.autoReveal !== undefined) room.autoReveal = settings.autoReveal;
            if (settings.anonymousMode !== undefined) room.anonymousMode = settings.anonymousMode;
            if (settings.votingSystem !== undefined) room.votingSystem = settings.votingSystem;
            if (settings.roomName !== undefined) room.roomName = settings.roomName;
            if (settings.roomDescription !== undefined) room.roomDescription = settings.roomDescription;
            if (settings.groupsEnabled !== undefined) room.groupsEnabled = settings.groupsEnabled;
            
            io.to(roomId).emit('room_settings_updated', { settings });
            console.log(`Room ${roomId} settings updated:`, settings);
        }
    };

    const joinRoomHandler = ({ roomId, name, role, userId }, callback) => {
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

            // Re-sync name if changed?
            if (name && name !== user.name) user.name = name;

        } else {
            // NEW JOIN
            const newUserId = userId || uuidv4();
            // Enforce STANDARD roles 
            let finalRole = role === 'SPECTATOR' ? 'SPECTATOR' : 'DEV'; // Map all estimators to DEV

            user = {
                id: newUserId,
                name,
                role: finalRole,
                isHost: false,
                socketId: socket.id,
                connected: true,
                groupId: null
            };
            room.users.set(newUserId, user);
        }

        socket.join(roomId);
        socket.data.userId = user.id;
        socket.data.roomId = roomId;

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
                }
            }
        }
    };

    const reactionHandler = ({ roomId, emojiId, emojiIcon }) => {
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user) {
                io.to(roomId).emit('show_reaction', {
                    emojiId,
                    emojiIcon,
                    userId,
                    userName: user.name
                });
            }
        }
    };

    const updateProfileHandler = ({ roomId, name, avatarSeed }) => {
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user) {
                if (name) user.name = name;
                if (avatarSeed) user.avatarSeed = avatarSeed;
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
                // S02: Capture snapshot for history
                const snapshot = {
                    id: roomId,
                    roomName: room.roomName,
                    roomDescription: room.roomDescription,
                    gameMode: room.gameMode,
                    votingSystem: room.votingSystem,
                    participants: Array.from(room.users.values()).map(u => ({
                        id: u.id,
                        name: u.name,
                        role: u.role,
                        avatarSeed: u.avatarSeed
                    })),
                    tasks: room.tasks,
                    averages: room.averages
                };
                // Save to history before deletion
                addHistory(roomId, snapshot);

                io.to(roomId).emit('session_ended');
                io.socketsLeave(roomId);
                rooms.delete(roomId);
                console.log(`Room ${roomId} ended by host ${user.name}. Snapshot recorded.`);
            }
        }
    };

    const getUserHistoryHandler = ({ userId }, callback) => {
        if (!userId) return callback([]);
        const userHistory = getHistoryByUserId(userId);
        callback(userHistory);
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
};
