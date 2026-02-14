const { getRoom } = require("../store");

module.exports = (io, socket) => {
    const startVote = ({ roomId }) => {
        const room = getRoom(roomId);
        if (!room) return;
        if (room.hostId !== socket.id) return; // Only host

        room.phase = 'VOTING';
        room.votes.clear(); // Reset previous votes

        io.to(roomId).emit("vote_started", { phase: 'VOTING' });
    };

    const castVote = ({ roomId, value }) => {
        const room = getRoom(roomId);
        if (!room) return;

        // Check if user is allowed to vote in current phase
        // e.g. if PARTIAL_VOTE_DEV, only DEV can vote.
        const user = room.users.get(socket.id);
        if (!user || user.role === 'HOST') return;

        if (room.phase === 'PARTIAL_VOTE_DEV' && user.role !== 'DEV') return;
        if (room.phase === 'PARTIAL_VOTE_QA' && user.role !== 'QA') return;
        if (room.phase === 'REVEALED') return; // User cannot vote in revealed state? usually no.

        room.votes.set(user.id, value);

        // Emit generic "someone voted" to update progress bars
        io.to(roomId).emit("vote_update", {
            userId: user.id,
            hasVoted: true
        });
    };

    const reveal = ({ roomId }) => {
        const room = getRoom(roomId);
        if (!room || room.hostId !== socket.id) return;

        room.phase = 'REVEALED';

        // Calculate averages
        let devSum = 0, devCount = 0;
        let qaSum = 0, qaCount = 0;

        room.votes.forEach((val, userId) => {
            // Find user role
            // Note: userId in votes is socket.id currently.
            const u = room.users.get(userId);
            if (u) {
                // Handle numeric values only for average
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    if (u.role === 'DEV') { devSum += num; devCount++; }
                    if (u.role === 'QA') { qaSum += num; qaCount++; }
                }
            }
        });

        const devAvg = devCount ? (devSum / devCount).toFixed(1) : 0;
        const qaAvg = qaCount ? (qaSum / qaCount).toFixed(1) : 0;

        io.to(roomId).emit("revealed", {
            votes: Array.from(room.votes.entries()),
            averages: { dev: devAvg, qa: qaAvg }
        });
    };

    const reset = ({ roomId }) => {
        const room = getRoom(roomId);
        if (!room || room.hostId !== socket.id) return;

        room.phase = 'IDLE';
        room.votes.clear();
        io.to(roomId).emit("reset");
    };

    const revotePartial = ({ roomId, targetRole }) => {
        // targetRole: 'DEV' | 'QA'
        const room = getRoom(roomId);
        if (!room || room.hostId !== socket.id) return;

        const newPhase = targetRole === 'DEV' ? 'PARTIAL_VOTE_DEV' : 'PARTIAL_VOTE_QA';
        room.phase = newPhase;

        // Clear votes ONLY for that role? 
        // "QA cards remain locked... Only Developers get voting overlay"
        // So we should remove old votes for the revoting group?
        // Or keep them until they vote new?
        // Usually clear them so we know who hasn't revoted.

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

    socket.on("start_vote", startVote);
    socket.on("cast_vote", castVote);
    socket.on("reveal", reveal);
    socket.on("reset", reset);
    socket.on("revote_partial", revotePartial);
};
