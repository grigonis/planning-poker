const { v4: uuidv4 } = require('uuid');
const { rooms } = require('../store');

const GROUP_COLORS = [
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
];

const getUser = (socket) => {
    const roomId = socket.data.roomId;
    if (!roomId) return null;
    const room = rooms.get(roomId);
    if (!room) return null;
    const userId = socket.data.userId;
    if (!userId) return null;
    const user = room.users.get(userId);
    return { user, room, userId, roomId };
};

module.exports = (io, socket) => {
    /**
     * manage_groups — host creates or deletes a group
     * payload: { roomId, action: 'CREATE' | 'DELETE', groupId?, name? }
     */
    const manageGroupsHandler = ({ roomId, action, groupId, name }, callback) => {
        const result = getUser(socket);
        if (!result) return callback?.({ error: 'Not in a room' });
        const { user, room } = result;

        if (!user?.isHost) return callback?.({ error: 'Host only' });

        if (action === 'CREATE') {
            if (!name || !name.trim()) return callback?.({ error: 'Group name required' });
            const newId = uuidv4();
            const colorIndex = room.groups.size % GROUP_COLORS.length;
            const group = {
                id: newId,
                name: name.trim(),
                color: GROUP_COLORS[colorIndex]
            };
            room.groups.set(newId, group);
            console.log(`Room ${roomId}: group created "${group.name}" (${newId})`);

        } else if (action === 'DELETE') {
            if (!groupId || !room.groups.has(groupId)) return callback?.({ error: 'Group not found' });
            room.groups.delete(groupId);
            // Unassign any users who belonged to this group
            room.users.forEach(u => {
                if (u.groupId === groupId) u.groupId = null;
            });
            console.log(`Room ${roomId}: group deleted (${groupId})`);

        } else {
            return callback?.({ error: 'Unknown action' });
        }

        const groupsArray = Array.from(room.groups.values());
        const usersArray = Array.from(room.users.values());

        io.to(roomId).emit('room_groups_updated', {
            groups: groupsArray,
            groupsEnabled: room.groupsEnabled
        });
        // Emit updated user list so group assignments are reflected everywhere
        io.to(roomId).emit('user_joined', usersArray);

        callback?.({ ok: true, groups: groupsArray });
    };

    /**
     * assign_group — assign (or unassign) a user to a group
     * payload: { roomId, targetUserId, groupId }  (groupId: null = unassign)
     * Any connected user can self-assign; host can assign anyone.
     */
    const assignGroupHandler = ({ roomId, targetUserId, groupId }, callback) => {
        const result = getUser(socket);
        if (!result) return callback?.({ error: 'Not in a room' });
        const { user, room, userId } = result;

        // Host can assign anyone; non-host can only self-assign
        const isSelf = targetUserId === userId;
        if (!user?.isHost && !isSelf) return callback?.({ error: 'Host only for others' });

        const target = room.users.get(targetUserId);
        if (!target) return callback?.({ error: 'User not found' });

        // Validate groupId if provided
        if (groupId !== null && groupId !== undefined && !room.groups.has(groupId)) {
            return callback?.({ error: 'Group not found' });
        }

        target.groupId = groupId ?? null;
        console.log(`Room ${roomId}: user "${target.name}" assigned to group ${groupId ?? 'none'}`);

        const usersArray = Array.from(room.users.values());
        io.to(roomId).emit('user_joined', usersArray);
        callback?.({ ok: true });
    };

    socket.on('manage_groups', manageGroupsHandler);
    socket.on('assign_group', assignGroupHandler);
};
