/**
 * GuestJoinModal
 * 
 * Thin wrapper that renders ProfileSetupDialog in 'join' mode.
 * Handles the room check and passes groups/gameMode through.
 * 
 * When hostUserId is provided (host entering their own newly-created room),
 * join_room is called with that userId to reclaim the host slot.
 */

import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import ProfileSetupDialog from './ProfileSetupDialog';

const GuestJoinModal = ({ isOpen, roomId, onJoinSuccess, hostUserId = null, hostRole = 'DEV' }) => {
    const { socket } = useSocket();
    const [gameMode, setGameMode] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupsEnabled, setGroupsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Restore saved session data for pre-filling the profile form
    const savedSession = React.useMemo(() => {
        try {
            const raw = localStorage.getItem(`keystimate_session_${roomId}`);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, [roomId]);

    useEffect(() => {
        if (!isOpen || !socket || !roomId) return;

        setLoading(true);
        setError(null);
        socket.emit('check_room', { roomId }, (response) => {
            setLoading(false);
            if (response.exists) {
                setGameMode(response.mode);
                setGroups(response.groups || []);
                setGroupsEnabled(response.groupsEnabled || false);
            } else {
                setError("Room not found. Please check the URL.");
            }
        });
    }, [isOpen, socket, roomId]);

    /**
     * Wrapped join success handler.
     * For host mode: after join_room reconnects the host slot,
     * we also call update_profile to set the name + avatar.
     */
    const handleJoinSuccess = (user) => {
        onJoinSuccess(user);
    };

    return (
        <ProfileSetupDialog
            isOpen={isOpen}
            mode="join"
            roomId={roomId}
            hostUserId={hostUserId}
            hostRole={hostRole}
            onJoinSuccess={handleJoinSuccess}
            // Pass prefetched data to avoid a redundant check_room inside ProfileSetupDialog
            initialGroups={groups}
            initialGroupsEnabled={groupsEnabled}
            initialGameMode={gameMode}
            loading={loading}
            prefetchError={error}
            // Pre-fill from saved session so re-joins feel seamless
            initialName={savedSession?.name || ''}
            initialAvatarSeed={savedSession?.avatarSeed || null}
        />
    );
};

export default GuestJoinModal;
