// InMemory Store
// Structure:
// rooms = new Map<roomId, RoomObject>
// RoomObject = {
//   id: string,
//   hostId: string,
//   phase: 'IDLE' | 'VOTING' | 'REVEALED' | 'PARTIAL_VOTE_DEV' | 'PARTIAL_VOTE_QA',
//   users: Map<socketId, UserObject>,
//   votes: Map<userId, VoteValue> // or stored in UserObject
// }

const rooms = new Map();
const history = new Map(); // roomId -> snapshot

module.exports = {
    rooms,
    history,
    addHistory: (roomId, snapshot) => {
        history.set(roomId, {
            ...snapshot,
            endedAt: new Date().toISOString()
        });
    },
    getHistoryByUserId: (userId) => {
        // Return sessions where this user was a participant
        return Array.from(history.values())
            .filter(room => room.participants.some(p => p.id === userId))
            .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));
    },
    getActiveRoomsByUserId: (userId) => {
        // Return active rooms where this user is currently present
        return Array.from(rooms.values())
            .filter(room => Array.from(room.users.values()).some(u => u.id === userId))
            .map(room => ({
                id: room.id,
                roomName: room.roomName,
                roomDescription: room.roomDescription,
                gameMode: room.gameMode,
                votingSystem: room.votingSystem,
                participantCount: room.users.size,
                isHost: room.hostId === userId,
                phase: room.phase
            }));
    },
    // Helper methods can be added here
    createRoom: (roomId, hostId, roomConfig = {}) => {
        rooms.set(roomId, {
            id: roomId,
            hostId,
            phase: 'IDLE',
            users: new Map(), // socketId -> User
            votes: new Map(),  // userId -> Vote
            votingSystem: roomConfig.votingSystem || {
                type: 'FIBONACCI_MODIFIED',
                name: 'Modified Fibonacci',
                values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
            },
            tasks: [],
            activeTaskId: null,
            groups: new Map(),   // groupId -> { id, name, color }
            groupsEnabled: false,
            ...roomConfig
        });
        return rooms.get(roomId);
    },
    getRoom: (roomId) => rooms.get(roomId),
    deleteRoom: (roomId) => rooms.delete(roomId)
};
