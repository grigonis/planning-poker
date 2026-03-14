import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useRoomSocket = (socket, roomId, room, navigate) => {
    useEffect(() => {
        if (!socket) return;

        const onUserJoined = (updatedUsers) => {
            room.setUsers(updatedUsers);
            if (room.currentUser.id) {
                const me = updatedUsers.find(u => u.id === room.currentUser.id);
                if (me && (
                    me.isHost !== room.currentUser.isHost || 
                    me.role !== room.currentUser.role || 
                    me.name !== room.currentUser.name || 
                    me.avatarSeed !== room.currentUser.avatarSeed || 
                    me.avatarPhotoURL !== room.currentUser.avatarPhotoURL
                )) {
                    room.setCurrentUser(prev => {
                        const next = { 
                            ...prev, 
                            isHost: me.isHost, 
                            role: me.role, 
                            name: me.name, 
                            avatarSeed: me.avatarSeed, 
                            avatarPhotoURL: me.avatarPhotoURL || null 
                        };
                        localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
                            userId: next.id,
                            name: next.name,
                            role: next.role,
                            avatarSeed: next.avatarSeed,
                            avatarPhotoURL: next.avatarPhotoURL || null,
                            roomId
                        }));
                        return next;
                    });
                }
            }
        };

        const onVoteStarted = ({ phase }) => {
            room.setPhase(phase);
            room.setMyVote(null);
            room.setVotes({});
        };

        const onVoteUpdate = ({ userId }) => {
            room.setVotes(prev => ({ ...prev, [userId]: 'VOTED' }));
            if (room.funFeatures) {
                try {
                    const audioContext = room.audioCtxRef.current;
                    if (audioContext && audioContext.state !== 'closed') {
                        if (audioContext.state === 'suspended') audioContext.resume();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
                        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.2);
                    }
                } catch (e) {}
            }
        };

        const onRevealed = ({ votes: revealedVotes, averages, groupAverages: ga, groupsEnabled: ge, tasks: updatedTasks, activeTaskId: updatedActiveTaskId }) => {
            room.setPhase('REVEALED');
            room.setAverages(averages);
            if (ga !== undefined) room.setGroupAverages(ga);
            if (ge !== undefined) room.setGroupsEnabled(ge);
            if (updatedTasks) room.setTasks(updatedTasks);
            if (updatedActiveTaskId !== undefined) room.setActiveTaskId(updatedActiveTaskId);
            const votesMap = {};
            revealedVotes.forEach(([uid, val]) => { votesMap[uid] = val; });
            room.setVotes(votesMap);

            if (room.funFeatures && revealedVotes.length > 0) {
                const numericalVotes = revealedVotes
                    .map(v => v[1])
                    .filter(val => val !== '?' && val !== 'COFFEE' && val !== 'questionMark' && val !== '☕');
                if (numericalVotes.length > 1) {
                    const allSame = numericalVotes.every(val => val === numericalVotes[0]);
                    if (allSame) {
                        import('canvas-confetti').then((confetti) => {
                            confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#60a5fa', '#ffffff'] });
                        });
                        try {
                            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                            oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
                            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
                            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
                            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.5);
                        } catch (e) {}
                    }
                }
            }
        };

        const onReset = ({ activeTaskId: updatedActiveTaskId } = {}) => {
            room.setPhase('IDLE');
            room.setMyVote(null);
            room.setVotes({});
            room.setAverages({});
            room.setGroupAverages([]);
            if (updatedActiveTaskId !== undefined) room.setActiveTaskId(updatedActiveTaskId);
        };

        const onRoomSettingsUpdated = ({ settings }) => {
            if (settings.funFeatures !== undefined) room.setFunFeatures(settings.funFeatures);
            if (settings.autoReveal !== undefined) room.setAutoReveal(settings.autoReveal);
            if (settings.anonymousMode !== undefined) room.setAnonymousMode(settings.anonymousMode);
            if (settings.votingSystem) room.setVotingSystem(settings.votingSystem);
            if (settings.roomName !== undefined) room.setRoomName(settings.roomName);
            if (settings.roomDescription !== undefined) room.setRoomDescription(settings.roomDescription);
            if (settings.groupsEnabled !== undefined) room.setGroupsEnabled(settings.groupsEnabled);
        };

        const onRoomGroupsUpdated = ({ groups: updatedGroups, groupsEnabled: updatedEnabled }) => {
            if (updatedGroups !== undefined) room.setGroups(updatedGroups);
            if (updatedEnabled !== undefined) room.setGroupsEnabled(updatedEnabled);
        };

        const onSessionEnded = () => {
            toast.error('The host has ended this session.');
            navigate('/');
        };

        const onShowReaction = ({ userId, emojiIcon }) => {
            if (!room.funFeatures) return;
            const reactId = Math.random().toString(36).substr(2, 9);
            room.setActiveReactions(prev => ({ ...prev, [userId]: { icon: emojiIcon, id: reactId } }));
            setTimeout(() => {
                room.setActiveReactions(prev => {
                    if (prev[userId]?.id === reactId) {
                        const next = { ...prev };
                        delete next[userId];
                        return next;
                    }
                    return prev;
                });
            }, 6000);
        };

        const onTasksUpdated = ({ tasks, activeTaskId }) => {
            if (tasks) room.setTasks(tasks);
            if (activeTaskId !== undefined) room.setActiveTaskId(activeTaskId);
        };

        socket.on('user_joined', onUserJoined);
        socket.on('vote_started', onVoteStarted);
        socket.on('vote_update', onVoteUpdate);
        socket.on('revealed', onRevealed);
        socket.on('reset', onReset);
        socket.on('room_settings_updated', onRoomSettingsUpdated);
        socket.on('room_groups_updated', onRoomGroupsUpdated);
        socket.on('session_ended', onSessionEnded);
        socket.on('show_reaction', onShowReaction);
        socket.on('tasks_updated', onTasksUpdated);

        return () => {
            socket.off('user_joined', onUserJoined);
            socket.off('vote_started', onVoteStarted);
            socket.off('vote_update', onVoteUpdate);
            socket.off('revealed', onRevealed);
            socket.off('reset', onReset);
            socket.off('room_settings_updated', onRoomSettingsUpdated);
            socket.off('room_groups_updated', onRoomGroupsUpdated);
            socket.off('session_ended', onSessionEnded);
            socket.off('show_reaction', onShowReaction);
            socket.off('tasks_updated', onTasksUpdated);
        };
    }, [socket, room.currentUser.id, room.funFeatures, navigate, roomId]);
};
