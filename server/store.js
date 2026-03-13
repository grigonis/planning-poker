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

module.exports = {
    rooms,
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
