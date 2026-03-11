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

        // Calculate averages (Arithmetic mean, ignoring non-numeric values)
        let total = 0;
        let count = 0;
        
        room.votes.forEach((val, userId) => {
            const u = room.users.get(userId);
            if (u && u.role !== 'SPECTATOR') {
                // Ignore non-numeric cards (e.g., ☕, ?, symbols)
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    total += num;
                    count++;
                }
            }
        });
        
        const averageValue = count > 0 ? (total / count) : 0;
        // Round to 1 decimal place
        const roundedAverage = Math.round(averageValue * 10) / 10;

        let averages = {
            total: roundedAverage,
            count: count
        };
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
            tasks: room.tasks
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

        // If the active task was completed, clear it so host can pick next one
        if (room.activeTaskId) {
            const task = room.tasks.find(t => t.id === room.activeTaskId);
            if (task && task.status === 'COMPLETED') {
                room.activeTaskId = null;
            }
        }

        io.to(roomId).emit("reset", { activeTaskId: room.activeTaskId });
    };

    socket.on("start_vote", startVoteHandler);
    socket.on("cast_vote", castVoteHandler);
    socket.on("reveal", revealHandler);
    socket.on("reset", resetHandler);
};
