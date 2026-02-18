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

        // Observer cannot vote
        if (user.role === 'OBSERVER') return;

        if (room.phase === 'PARTIAL_VOTE_DEV' && user.role !== 'DEV') return;
        if (room.phase === 'PARTIAL_VOTE_QA' && user.role !== 'QA') return;
        if (room.phase === 'REVEALED') return;

        room.votes.set(userId, value);

        // Emit generic "someone voted" to update progress bars
        io.to(roomId).emit("vote_update", {
            userId: userId,
            hasVoted: true
        });
    };

    const revealHandler = ({ roomId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.phase = 'REVEALED';

        // Calculate averages based on MODES
        let averages = {};

        if (room.gameMode === 'SPLIT') {
            // Calculate averages
            let devSum = 0, devCount = 0;
            let qaSum = 0, qaCount = 0;

            room.votes.forEach((val, userId) => {
                const u = room.users.get(userId);
                if (u) {
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        if (u.role === 'DEV' || u.role === 'HOST') { devSum += num; devCount++; }
                        if (u.role === 'QA') { qaSum += num; qaCount++; }
                    }
                }
            });

            averages.dev = devCount ? (devSum / devCount).toFixed(1) : 0;
            averages.qa = qaCount ? (qaSum / qaCount).toFixed(1) : 0;

        } else {
            // STANDARD MODE - Single average
            let sum = 0, count = 0;
            room.votes.forEach((val, userId) => {
                const u = room.users.get(userId);
                // Observers shouldn't have votes, but check anyway
                if (u && u.role !== 'OBSERVER') {
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        sum += num; count++;
                    }
                }
            });
            averages.total = count ? (sum / count).toFixed(1) : 0;
        }

        room.averages = averages;

        io.to(roomId).emit("revealed", {
            votes: Array.from(room.votes.entries()),
            averages
        });
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

    const revotePartialHandler = ({ roomId, targetRole }) => {
        // targetRole: 'DEV' | 'QA'
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        const newPhase = targetRole === 'DEV' ? 'PARTIAL_VOTE_DEV' : 'PARTIAL_VOTE_QA';
        room.phase = newPhase;

        // Clear votes ONLY for that role?
        const usersToClear = [];
        room.votes.forEach((val, userId) => {
            const u = room.users.get(userId);
            if (u && u.role === targetRole) {
                usersToClear.push(userId);
            }
        });
        usersToClear.forEach(uid => room.votes.delete(uid));

        io.to(roomId).emit("partial_revote", { phase: newPhase });
    };

    socket.on("start_vote", startVoteHandler);
    socket.on("cast_vote", castVoteHandler);
    socket.on("reveal", revealHandler);
    socket.on("reset", resetHandler);
    socket.on("revote_partial", revotePartialHandler);
};
