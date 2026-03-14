const { upsertTask } = require("../firestore");
const { getUser } = require("./utils");

module.exports = (io, socket) => {
    const startVoteHandler = ({ roomId, targetGroups = null }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.phase = 'VOTING';
        room.votes.clear(); // Reset previous votes
        room.averages = {}; // Initialize averages
        room.votingGroups = targetGroups; // null = all, or array of group IDs

        // Auto-select first pending task if tasks exist but none is active
        if (room.tasks.length > 0 && !room.activeTaskId) {
            const firstPending = room.tasks.find(t => t.status === 'PENDING');
            if (firstPending) {
                firstPending.status = 'VOTING';
                room.activeTaskId = firstPending.id;
                io.to(roomId).emit("tasks_updated", { tasks: room.tasks, activeTaskId: room.activeTaskId });
            }
        }

        io.to(roomId).emit("vote_started", { phase: 'VOTING', votingGroups: room.votingGroups });
    };

    const castVoteHandler = ({ roomId, value }) => {
        // SEC-06: Rate limit check
        if (!socket.checkRateLimit('cast_vote')) return;

        const result = getUser(socket);
        if (!result) return;
        const { user, room, userId } = result;

        // Spectator cannot vote
        if (user.role === 'SPECTATOR') return;

        if (room.phase === 'REVEALED') return;

        // SEC-03: Only accept values from the room's voting system (plus universal specials)
        const UNIVERSAL_SPECIALS = ['?', '☕', '∞', 'Pass'];
        const allowedValues = [
            ...room.votingSystem.values.map(String),
            ...UNIVERSAL_SPECIALS
        ];
        if (!allowedValues.includes(String(value))) return;

        room.votes.set(userId, value);
        room.lastActivity = Date.now();

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
                if (room.votingGroups && !room.votingGroups.includes(u.groupId)) return;
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
                if (room.votingGroups && !room.votingGroups.includes(u.groupId)) return;
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
                // If specific groups are voting, ignore unselected groups for group averages
                if (room.votingGroups && !room.votingGroups.includes(group.id)) return;

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
            
            if (process.env.DEBUG) console.log(`Room ${roomId} groupAverages:`, JSON.stringify(groupAverages));
        }

        // If an active task is selected, save the combined result to it
        if (room.activeTaskId) {
            const task = room.tasks.find(t => t.id === room.activeTaskId);
            if (task) {
                task.votes = averages.total;
                task.status = 'COMPLETED';

                // Persist resolved task to Firestore immediately (fire-and-forget)
                const participantSnapshot = Array.from(room.users.values()).map(u => ({
                    id: u.id,
                    name: u.name,
                    role: u.role,
                    avatarSeed: u.avatarSeed || null,
                }));
                upsertTask(roomId, task, participantSnapshot)
                    .catch(err => console.error('[Firestore] performReveal upsertTask failed:', err.message));
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
        room.votingGroups = null; // Clear voting group selection

        // If the active task was completed, auto-advance to next pending task
        if (room.activeTaskId) {
            const task = room.tasks.find(t => t.id === room.activeTaskId);
            if (task && task.status === 'COMPLETED') {
                // Find next pending task
                const nextPending = room.tasks.find(t => t.status === 'PENDING');
                if (nextPending) {
                    nextPending.status = 'VOTING';
                    room.activeTaskId = nextPending.id;
                } else {
                    room.activeTaskId = null;
                }
            }
        }

        io.to(roomId).emit("reset", { activeTaskId: room.activeTaskId, tasks: room.tasks, votingGroups: null });
    };

    /**
     * revote — host resets the round but keeps the same active task
     */
    const revoteHandler = ({ roomId }) => {
        const result = getUser(socket);
        if (!result) return;
        const { user, room } = result;

        if (!user || !user.isHost) return;

        room.phase = 'VOTING';
        room.votes.clear();
        room.averages = {};

        // Keep the same active task but reset its status to VOTING
        if (room.activeTaskId) {
            const task = room.tasks.find(t => t.id === room.activeTaskId);
            if (task) {
                task.status = 'VOTING';
                task.votes = null;
            }
        }

        io.to(roomId).emit("vote_started", { phase: 'VOTING', votingGroups: room.votingGroups });
        if (room.tasks.length > 0) {
            io.to(roomId).emit("tasks_updated", { tasks: room.tasks, activeTaskId: room.activeTaskId });
        }
    };

    socket.on("start_vote", startVoteHandler);
    socket.on("cast_vote", castVoteHandler);
    socket.on("reveal", revealHandler);
    socket.on("reset", resetHandler);
    socket.on("revote", revoteHandler);
};
