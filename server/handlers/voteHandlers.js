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

        // Calculate overall averages (arithmetic mean, ignoring non-numeric values)
        let total = 0;
        let count = 0;
        
        room.votes.forEach((val, userId) => {
            const u = room.users.get(userId);
            if (u && u.role !== 'SPECTATOR') {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    total += num;
                    count++;
                }
            }
        });
        
        const averageValue = count > 0 ? (total / count) : 0;
        const roundedAverage = Math.round(averageValue * 10) / 10;

        const averages = {
            total: roundedAverage,
            count: count
        };
        room.averages = averages;

        // Per-group averages (only when groups are enabled and groups exist)
        const groupAverages = [];
        let groupSum = 0;
        let hasGroupVotes = false;

        if (room.groupsEnabled && room.groups.size > 0) {
            room.groups.forEach((group) => {
                let gTotal = 0;
                let gCount = 0;
                room.users.forEach((u) => {
                    if (u.groupId !== group.id) return;
                    if (u.role === 'SPECTATOR') return;
                    const voteVal = room.votes.get(u.id);
                    if (voteVal === undefined) return;
                    const num = parseFloat(voteVal);
                    if (!isNaN(num)) {
                        gTotal += num;
                        gCount++;
                    }
                });
                const gAvg = gCount > 0 ? Math.round((gTotal / gCount) * 10) / 10 : null;
                if (gAvg !== null) {
                    groupSum += gAvg;
                    hasGroupVotes = true;
                }
                groupAverages.push({
                    groupId: group.id,
                    name: group.name,
                    color: group.color,
                    average: gAvg,
                    count: gCount
                });
            });

            // If groups are enabled, the total is the SUM of group averages (per requirement example 5+3=8)
            if (hasGroupVotes) {
                averages.total = Math.round(groupSum * 10) / 10;
            }
            
            console.log(`Room ${roomId} groupAverages:`, JSON.stringify(groupAverages));
        }

        // If an active task is selected, save the combined result to it
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
            groupAverages,
            groupsEnabled: room.groupsEnabled,
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
