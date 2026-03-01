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

        if (room.phase === 'PARTIAL_VOTE_DEV' && user.role !== 'DEV') return;
        if (room.phase === 'PARTIAL_VOTE_QA' && user.role !== 'QA') return;
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
                if (room.phase === 'PARTIAL_VOTE_DEV' && u.role !== 'DEV') return;
                if (room.phase === 'PARTIAL_VOTE_QA' && u.role !== 'QA') return;
                eligibleVoters++;
            });

            if (eligibleVoters > 0 && room.votes.size >= eligibleVoters) {
                performReveal(room, roomId);
            }
        }
    };

    const performReveal = (room, roomId) => {
        room.phase = 'REVEALED';

        // Calculate averages based on MODES
        let averages = {};

        if (room.gameMode === 'SPLIT') {
            let devMax = null, qaMax = null;

            room.votes.forEach((val, userId) => {
                const u = room.users.get(userId);
                if (u) {
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        if (u.role === 'DEV' || u.role === 'HOST') {
                            if (devMax === null || num > devMax) devMax = num;
                        }
                        if (u.role === 'QA') {
                            if (qaMax === null || num > qaMax) qaMax = num;
                        }
                    }
                }
            });

            averages.dev = devMax !== null ? devMax : 0;
            averages.qa = qaMax !== null ? qaMax : 0;

        } else {
            // STANDARD MODE — highest vote wins
            let max = null;
            room.votes.forEach((val, userId) => {
                const u = room.users.get(userId);
                if (u && u.role !== 'SPECTATOR') {
                    const num = parseFloat(val);
                    if (!isNaN(num) && (max === null || num > max)) max = num;
                }
            });
            averages.total = max !== null ? max : 0;
        }

        room.averages = averages;

        io.to(roomId).emit("revealed", {
            votes: Array.from(room.votes.entries()),
            averages
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
