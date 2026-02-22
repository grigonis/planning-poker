const { v4: uuidv4 } = require('uuid');
const { rooms } = require('../store');

module.exports = (io, socket) => {
    const checkRoomHandler = ({ roomId }, callback) => {
        const room = rooms.get(roomId);
        if (room) {
            callback({ exists: true, mode: room.gameMode });
        } else {
            callback({ exists: false });
        }
    };

    const createRoomHandler = ({ name, role, gameMode }, callback) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const userId = uuidv4();

        const room = {
            id: roomId,
            users: new Map(), // Key: userId, Value: User Object
            votes: new Map(), // Key: userId, Value: Vote
            phase: 'IDLE',
            gameMode: gameMode || 'STANDARD',
            funFeatures: false, // Default to false
            autoReveal: true, // Default to true
            averages: {}
        };

        // Validate role or default to HOST (which acts as DEV usually)
        // If user explicitly selected OBSERVER, we respect that.
        // If they selected DEV/QA, we respect that.
        // If nothing, 'HOST' (legacy) or 'DEV'.
        const hostRole = role || 'DEV';

        const host = {
            id: userId,
            name: name || "Host",
            role: hostRole,
            isHost: true, // explicit flag for privileges
            socketId: socket.id,
            connected: true
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
            users: Array.from(room.users.values())
        });
        console.log(`Room created: ${roomId} by ${socket.id} (${name}) as ${hostRole} in ${room.gameMode} mode`);
    };

    const updateRoomSettingsHandler = ({ roomId, settings }) => {
        const room = rooms.get(roomId);
        if (room) {
            if (settings.funFeatures !== undefined) room.funFeatures = settings.funFeatures;
            if (settings.autoReveal !== undefined) room.autoReveal = settings.autoReveal;
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
            const newUserId = uuidv4();
            // Standardize role based on mode
            let finalRole = role;
            if (room.gameMode === 'STANDARD') {
                finalRole = role === 'OBSERVER' ? 'OBSERVER' : 'DEV'; // Map Estimator to DEV
            }

            user = {
                id: newUserId,
                name,
                role: finalRole,
                isHost: false,
                socketId: socket.id,
                connected: true
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
            votes: room.phase === 'REVEALED' ? votesList : [], // Hide votes if hidden
            // Send back their own userId so they can save it
            userId: user.id,
            mode: room.gameMode,
            funFeatures: room.funFeatures,
            autoReveal: room.autoReveal
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

    const updateAvatarHandler = ({ roomId }) => {
        const userId = socket.data.userId;
        const room = rooms.get(roomId);
        if (room && userId) {
            const user = room.users.get(userId);
            if (user) {
                // Generate a random seed
                user.avatarSeed = Math.random().toString(36).substring(7);
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
                io.to(roomId).emit('session_ended');
                io.socketsLeave(roomId);
                rooms.delete(roomId);
                console.log(`Room ${roomId} ended by host ${user.name}`);
            }
        }
    };

    socket.on("check_room", checkRoomHandler);
    socket.on("create_room", createRoomHandler);
    socket.on("join_room", joinRoomHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("toggle_fun_features", updateRoomSettingsHandler); // keeping legacy name for backwards compatibility temporarily
    socket.on("update_room_settings", updateRoomSettingsHandler);
    socket.on("send_reaction", reactionHandler);
    socket.on("update_avatar", updateAvatarHandler);
    socket.on("end_session", endSessionHandler);
};
