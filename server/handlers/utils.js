const { rooms } = require('../store');

/**
 * Resolve the calling user and their room from socket.data.
 * Returns null if the socket isn't in a room or the user isn't found.
 * @param {import('socket.io').Socket} socket
 * @returns {{ user, room, userId, roomId } | null}
 */
const getUser = (socket) => {
    const roomId = socket.data.roomId;
    if (!roomId) return null;

    const room = rooms.get(roomId);
    if (!room) return null;

    const userId = socket.data.userId;
    if (!userId) return null;

    const user = room.users.get(userId);
    if (!user) return null;

    return { user, room, userId, roomId };
};

module.exports = { getUser };
