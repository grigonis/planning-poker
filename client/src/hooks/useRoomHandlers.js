export const useRoomHandlers = (socket, roomId, room, updateProfile, authUser) => {
    const handleStartVote = () => {
        socket.emit('start_vote', { roomId });
    };

    const handleVote = (value) => {
        room.setMyVote(value);
        socket.emit('cast_vote', { roomId, value });
    };

    const handleReveal = () => {
        socket.emit('reveal', { roomId });
    };

    const handleReset = () => {
        socket.emit('reset', { roomId });
    };

    const handleUpdateSettings = (settings) => {
        socket.emit('update_room_settings', { roomId, settings });
    };

    const handleToggleGroups = (enabled) => {
        socket.emit('update_room_settings', { roomId, settings: { groupsEnabled: enabled } });
    };

    const handleCreateGroup = (name) => {
        socket.emit('manage_groups', { roomId, action: 'CREATE', name });
    };

    const handleDeleteGroup = (groupId) => {
        socket.emit('manage_groups', { roomId, action: 'DELETE', groupId });
    };

    const handleAssignGroup = (targetUserId, groupId) => {
        socket.emit('assign_group', { roomId, targetUserId, groupId: groupId || null });
    };

    const handleUpdateProfile = ({ name, avatarSeed, avatarPhotoURL }) => {
        socket.emit('update_profile', { roomId, name, avatarSeed, avatarPhotoURL: avatarPhotoURL ?? null });
        updateProfile({ name, avatarSeed, avatarPhotoURL });
        if (authUser && socket) {
            socket.emit('save_user_profile', { name, avatarSeed, avatarPhotoURL }, () => {});
        }
        room.setCurrentUser(prev => ({
            ...prev,
            name: name ?? prev.name,
            avatarSeed: avatarSeed ?? prev.avatarSeed,
            avatarPhotoURL: avatarPhotoURL !== undefined ? avatarPhotoURL : prev.avatarPhotoURL
        }));
    };

    const handleEndSession = () => {
        socket.emit('end_session', { roomId });
    };

    const handleCreateTask = (title) => {
        socket.emit('create_task', { roomId, title });
    };

    const handleBulkCreate = (titles) => {
        socket.emit('bulk_create_tasks', { roomId, titles });
    };

    const handleDeleteTask = (taskId) => {
        socket.emit('delete_task', { roomId, taskId });
    };

    const handleSelectTask = (taskId) => {
        socket.emit('select_task', { roomId, taskId });
    };

    return {
        handleStartVote, handleVote, handleReveal, handleReset,
        handleUpdateSettings, handleToggleGroups, handleCreateGroup,
        handleDeleteGroup, handleAssignGroup, handleUpdateProfile,
        handleEndSession, handleCreateTask, handleBulkCreate,
        handleDeleteTask, handleSelectTask
    };
};
