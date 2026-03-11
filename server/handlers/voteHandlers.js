const { rooms } = require("../store");

const getUser = (socket) => {
    const roomId = socket.data.roomId;
    if (!roomId) return null;

    const room = rooms.get(roomId);
    if (!room) return null;

    const userId = socket.data.userId;
    if (!userId) return null;

    const user = room.users.get(userId);
    return { user, room, userId };
};

module.exports = (io, socket) => {
    const startVoteHandler = ({ roomId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.phase = 'VOTING';
        room.votes.clear(); // Reset previous votes
        room.averages = {}; // Initialize averages

        io.to(roomId).emit("vote_started", { phase: 'VOTING' });
    };

    const castVoteHandler = ({ roomId, value }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room, userId } = result;

        // Spectator cannot vote
        if (user.role === 'SPECTATOR') return;

        if (room.phase === 'REVEALED') return;

        room.votes.set(userId, value);

        // Emit generic "someone voted" to update progress bars
        io.to(roomId).emit("vote_update", {
            userId: userId,
            hasVoted: true
        });

        // Auto-reveal logic
        if (room.autoReveal) {
            let eligibleVoters = 0;
            room.users.forEach(u => {
                if (u.role === 'SPECTATOR') return;
                if (!u.connected) return;
                eligibleVoters++;
            });

            if (eligibleVoters > 0 && room.votes.size >= eligibleVoters) {
                performReveal(room, roomId);
            }
        }
    };

    const performReveal = (room, roomId) => {
        room.phase = 'REVEALED';

        // Calculate averages (Highest vote wins, ignoring non-numeric values)
        let averages = {};
        let max = null;
        
        room.votes.forEach((val, userId) => {
            const u = room.users.get(userId);
            if (u && u.role !== 'SPECTATOR') {
                if (val === '☕' || val === '?' || val === 'COFFEE' || val === 'questionMark') return;
                const num = parseFloat(val);
                if (!isNaN(num) && (max === null || num > max)) max = num;
            }
        });
        
        averages.total = max !== null ? max : 0;
        room.averages = averages;

        // If an active task is selected, save the result to it
        if (room.activeTaskId) {
            const task = room.tasks.find(t => t.id === room.activeTaskId);
            if (task) {
                task.votes = averages.total;
                task.status = 'COMPLETED';
            }
        }

        io.to(roomId).emit("revealed", {
            votes: Array.from(room.votes.entries()),
            averages,
            tasks: room.tasks // Sync tasks back
        });
    };

    const revealHandler = ({ roomId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        performReveal(room, roomId);
    };

    const resetHandler = ({ roomId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.phase = 'IDLE';
        room.votes.clear();
        room.averages = {}; // Clear averages on reset
        io.to(roomId).emit("reset");
    };

    socket.on("start_vote", startVoteHandler);
    socket.on("cast_vote", castVoteHandler);
    socket.on("reveal", revealHandler);
    socket.on("reset", resetHandler);
};
