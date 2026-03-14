// InMemory Store — live room state only
// History is persisted in Firestore (see server/firestore.js)
//
// Structure:
// rooms = new Map<roomId, RoomObject>
// RoomObject = {
//   id: string,
//   hostId: string,
//   phase: 'IDLE' | 'VOTING' | 'REVEALED',
//   users: Map<userId, UserObject>,
//   votes: Map<userId, VoteValue>
// }

const rooms = new Map();

module.exports = {
    rooms,
    getActiveRoomsByUserId: (userId) => {
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
    createRoom: (roomId, hostId, roomConfig = {}) => {
        rooms.set(roomId, {
            id: roomId,
            hostId,
            phase: 'IDLE',
            users: new Map(),
            votes: new Map(),
            votingSystem: roomConfig.votingSystem || {
                type: 'FIBONACCI_MODIFIED',
                name: 'Modified Fibonacci',
                values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
            },
            tasks: [],
            activeTaskId: null,
            groups: new Map(),
            groupsEnabled: false,
            ...roomConfig
        });
        return rooms.get(roomId);
    },
    getRoom: (roomId) => rooms.get(roomId),
    deleteRoom: (roomId) => rooms.delete(roomId)
};
