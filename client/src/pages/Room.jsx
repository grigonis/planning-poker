import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRoomState } from '../hooks/useRoomState';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useRoomHandlers } from '../hooks/useRoomHandlers';
import { useRoomModals } from '../hooks/useRoomModals';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSocket } from '../context/SocketContext';
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';
import { toast } from "sonner";

// Components
import VotingOverlay from '../components/Voting/VotingOverlay';
import PokerTable from '../components/Room/PokerTable';
import InviteModal from '../components/InviteModal';
import GuestJoinModal from '../components/GuestJoinModal';
import SettingsDialog from '../components/Room/SettingsDialog';
import EditRoomDetailsDialog from '../components/Room/EditRoomDetailsDialog';
import CustomizeCardsDialog from '../components/Room/CustomizeCardsDialog';
import EditProfileModal from '../components/Room/EditProfileModal';
import ManageGroupsDialog from '../components/Room/ManageGroupsDialog';
import EmojiReactions from '../components/Room/EmojiReactions';
import TasksPane from '../components/Room/TasksPane';
import RoomNavbar from '../components/Room/RoomNavbar';
import ParticipantPanel from '../components/Room/ParticipantPanel';
import SignInDialog from '../components/SignInDialog';
import KeyboardShortcutsDialog from '../components/Room/KeyboardShortcutsDialog';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket, isConnected } = useSocket();
    const { 
        userId: globalUserId, 
        name: globalName, 
        avatarSeed: globalAvatarSeed, 
        avatarPhotoURL: globalAvatarPhotoURL, 
        updateProfile 
    } = useProfile();
    const { user: authUser, signOut } = useAuthContext();

    const room = useRoomState(roomId);
    const modals = useRoomModals();
    useRoomSocket(socket, roomId, room, navigate);
    const handlers = useRoomHandlers(socket, roomId, room, updateProfile, authUser);
    
    useKeyboardShortcuts({
        onVote: handlers.handleVote,
        onReveal: handlers.handleReveal,
        onReset: handlers.handleReset,
        onToggleTasks: () => room.setIsTasksOpen(v => !v),
        onOpenInvite: () => modals.setIsInviteOpen(true),
        onOpenSettings: () => modals.setIsSettingsOpen(true),
        onOpenHelp: () => modals.setIsKeyboardShortcutsOpen(true),
        isHost: room.users.find(u => u.id === room.currentUser.id)?.isHost || false,
        votingSystem: room.votingSystem,
        disabled: room.viewState !== 'ROOM'
    });

    useEffect(() => {
        if (socket && isConnected && authUser) {
            socket.emit('load_user_profile', {}, (profile) => {
                if (profile && (profile.name || profile.avatarSeed || profile.avatarPhotoURL)) {
                    updateProfile({
                        name: profile.name || globalName,
                        avatarSeed: profile.avatarSeed || globalAvatarSeed,
                        avatarPhotoURL: profile.avatarPhotoURL || globalAvatarPhotoURL
                    });
                }
            });
        }
    }, [socket, isConnected, !!authUser]);

    useEffect(() => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            room.audioCtxRef.current = new AudioCtx();
        }
        return () => {
            room.audioCtxRef.current?.close();
            room.audioCtxRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const tryJoin = (userData) => {
            const { name, role, userId, avatarSeed, avatarPhotoURL } = userData;
            socket.emit('join_room', {
                roomId,
                name,
                role,
                userId,
                avatarPhotoURL: avatarPhotoURL || null
            }, (response) => {
                if (response.error) {
                    if (response.error === 'Room not found') {
                        toast.error("Room not found");
                        navigate('/');
                        return;
                    }
                    room.setViewState('GUEST_INPUT');
                    localStorage.removeItem(`keystimate_session_${roomId}`);
                } else {
                    room.setPhase(response.phase);
                    room.setUsers(response.users);
                    if (response.mode) room.setRoomMode(response.mode);
                    if (response.funFeatures !== undefined) room.setFunFeatures(response.funFeatures);
                    if (response.autoReveal !== undefined) room.setAutoReveal(response.autoReveal);
                    if (response.anonymousMode !== undefined) room.setAnonymousMode(response.anonymousMode);
                    if (response.groupScopedVoting !== undefined) room.setGroupScopedVoting(response.groupScopedVoting);
                    if (response.votingGroups !== undefined) room.setVotingGroups(response.votingGroups);
                    if (response.votingSystem) room.setVotingSystem(response.votingSystem);
                    if (response.roomName !== undefined) room.setRoomName(response.roomName);
                    if (response.roomDescription !== undefined) room.setRoomDescription(response.roomDescription);
                    if (response.groups) room.setGroups(response.groups);
                    if (response.groupsEnabled !== undefined) room.setGroupsEnabled(response.groupsEnabled);
                    if (response.tasks) room.setTasks(response.tasks);
                    if (response.activeTaskId) room.setActiveTaskId(response.activeTaskId);

                    if (response.votes && response.votes.length > 0) {
                        const votesMap = {};
                        response.votes.forEach(([uid, val]) => votesMap[uid] = val);
                        room.setVotes(votesMap);
                        if (response.phase !== 'IDLE' && votesMap[response.userId] !== undefined) {
                            room.setMyVote('VOTED');
                        }
                    }

                    const serverMe = response.users.find(u => u.id === response.userId);
                    if (serverMe && (
                        (avatarSeed && serverMe.avatarSeed !== avatarSeed) ||
                        (avatarPhotoURL && serverMe.avatarPhotoURL !== avatarPhotoURL)
                    )) {
                        socket.emit('update_profile', { roomId, name, avatarSeed, avatarPhotoURL: avatarPhotoURL || null });
                    }

                    room.setCurrentUser({
                        name: serverMe?.name || name,
                        role: serverMe?.role || role,
                        id: response.userId,
                        isHost: serverMe?.isHost || false,
                        gameMode: response.mode,
                        funFeatures: response.funFeatures,
                        avatarSeed: serverMe?.avatarSeed || avatarSeed || name,
                        avatarPhotoURL: serverMe?.avatarPhotoURL || avatarPhotoURL || null,
                        groupId: serverMe?.groupId || null
                    });
                    room.setViewState('ROOM');

                    // Persist session for reconnect on page refresh
                    localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
                        userId: response.userId,
                        name: serverMe?.name || name,
                        role: serverMe?.role || role,
                        avatarSeed: serverMe?.avatarSeed || avatarSeed || name,
                        avatarPhotoURL: serverMe?.avatarPhotoURL || avatarPhotoURL || null,
                        roomId
                    }));
                }
            });
        };

        if (location.state?.userId && location.state?.name) {
            tryJoin(location.state);
        } else {
            const storedSession = localStorage.getItem(`keystimate_session_${roomId}`);
            if (storedSession) {
                try { tryJoin(JSON.parse(storedSession)); } catch (e) { room.setViewState('GUEST_INPUT'); }
            } else if (globalName) {
                const hostUserId = location.state?.hostUserId;
                tryJoin({
                    name: globalName,
                    role: hostUserId ? (location.state?.hostRole || 'DEV') : 'DEV',
                    userId: hostUserId || globalUserId,
                    avatarSeed: globalAvatarSeed || globalName,
                    avatarPhotoURL: globalAvatarPhotoURL || null
                });
            } else {
                room.setViewState('GUEST_INPUT');
            }
        }
    }, [socket, isConnected, roomId]);

    const handleGuestJoinSuccess = (user) => {
        room.setCurrentUser({
            name: user.name,
            role: user.role,
            id: user.userId,
            isHost: user.isHost || false,
            avatarSeed: user.avatarSeed || user.name,
            avatarPhotoURL: user.avatarPhotoURL || null,
            groupId: user.groupId || null,
        });

        if (user.users) room.setUsers(user.users);
        if (user.gameMode) room.setRoomMode(user.gameMode);
        if (user.funFeatures !== undefined) room.setFunFeatures(user.funFeatures);
        if (user.autoReveal !== undefined) room.setAutoReveal(user.autoReveal);
        if (user.anonymousMode !== undefined) room.setAnonymousMode(user.anonymousMode);
        if (user.groupScopedVoting !== undefined) room.setGroupScopedVoting(user.groupScopedVoting);
        if (user.votingGroups !== undefined) room.setVotingGroups(user.votingGroups);
        if (user.votingSystem) room.setVotingSystem(user.votingSystem);
        if (user.roomName !== undefined) room.setRoomName(user.roomName);
        if (user.roomDescription !== undefined) room.setRoomDescription(user.roomDescription);
        if (user.groups) room.setGroups(user.groups);
        if (user.groupsEnabled !== undefined) room.setGroupsEnabled(user.groupsEnabled);

        // Persist session for reconnect on page refresh
        localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
            userId: user.userId,
            name: user.name,
            role: user.role,
            avatarSeed: user.avatarSeed || user.name,
            avatarPhotoURL: user.avatarPhotoURL || null,
            roomId
        }));

        room.setViewState('ROOM');
    };

    const isMeHost = room.users.find(u => u.id === room.currentUser.id)?.isHost || false;
    const isMyGroupVoting = !room.votingGroups || (room.currentUser.groupId && room.votingGroups.includes(room.currentUser.groupId));
    const showOverlay = (room.phase === 'VOTING' && room.currentUser.role !== 'SPECTATOR' && isMyGroupVoting) ||
        (room.phase === 'PARTIAL_VOTE_DEV' && room.currentUser.role === 'DEV') ||
        (room.phase === 'PARTIAL_VOTE_QA' && room.currentUser.role === 'QA');

    if (room.viewState === 'LOADING') {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative">
            <RoomNavbar 
                roomId={roomId} roomName={room.roomName} roomDescription={room.roomDescription}
                socketStatus={socket?.connected} tasksCount={room.tasks.length} isHost={isMeHost}
                isTasksOpen={room.isTasksOpen} currentUser={room.currentUser}
                onToggleTasks={() => room.setIsTasksOpen(v => !v)}
                onOpenEditRoom={() => modals.setIsEditRoomOpen(true)}
                onOpenCustomizeCards={() => modals.setIsCustomizeCardsOpen(true)}
                onOpenSettings={() => modals.setIsSettingsOpen(true)}
                onOpenManageGroups={() => modals.setIsManageGroupsOpen(true)}
                onOpenInvite={() => modals.setIsInviteOpen(true)}
                onOpenProfile={() => modals.setIsProfileOpen(true)}
                onOpenHelp={() => modals.setIsKeyboardShortcutsOpen(true)}
                onToggleSpectator={handlers.handleToggleSpectator}
                onSignIn={() => modals.setIsSignInOpen(true)}
                authUser={authUser} onSignOut={signOut}
            />

            {room.viewState === 'ROOM' && (
                <>
                    <ParticipantPanel
                        users={room.users} votes={room.votes} phase={room.phase}
                        currentUser={room.currentUser} roomId={roomId} anonymousMode={room.anonymousMode}
                        groups={room.groups} groupsEnabled={room.groupsEnabled} isHost={isMeHost}
                        votingGroups={room.votingGroups}
                        onAssignGroup={handlers.handleAssignGroup}
                        onKickUser={handlers.handleKickUser}
                    />
                    <main className="flex-1 p-4">
                        {showOverlay && !room.myVote && (
                            <VotingOverlay
                                role={room.currentUser.role} onVote={handlers.handleVote}
                                currentVote={room.myVote} votingSystem={room.votingSystem}
                            />
                        )}
                        <PokerTable
                            users={room.users} currentUser={room.currentUser} votes={room.votes}
                            myVote={room.myVote} phase={room.phase} averages={room.averages}
                            groupAverages={room.groupAverages} groupsEnabled={room.groupsEnabled}
                            groups={room.groups} activeReactions={room.activeReactions} isHost={isMeHost}
                            funFeatures={room.funFeatures} autoReveal={room.autoReveal}
                            anonymousMode={room.anonymousMode} roomMode={room.roomMode}
                            groupScopedVoting={room.groupScopedVoting} votingGroups={room.votingGroups}
                            votingSystem={room.votingSystem} tasks={room.tasks} activeTaskId={room.activeTaskId}
                            onStartVote={handlers.handleStartVote} onReveal={handlers.handleReveal}
                            onReset={handlers.handleReset} onRevote={handlers.handleRevote}
                            onUpdateSettings={handlers.handleUpdateSettings}
                        />
                        {/* Emoji Reactions System */}
                        {room.funFeatures && (
                            <EmojiReactions
                                roomId={roomId}
                                currentUserId={room.currentUser.id}
                                phase={room.phase}
                            />
                        )}
                    </main>
                    <TasksPane
                        isOpen={room.isTasksOpen} onClose={() => room.setIsTasksOpen(false)}
                        tasks={room.tasks} activeTaskId={room.activeTaskId} isHost={isMeHost}
                        onCreateTask={handlers.handleCreateTask} onBulkCreate={handlers.handleBulkCreate}
                        onDeleteTask={handlers.handleDeleteTask} onSelectTask={handlers.handleSelectTask}
                    />
                </>
            )}

            <GuestJoinModal isOpen={room.viewState === 'GUEST_INPUT'} roomId={roomId} onJoinSuccess={handleGuestJoinSuccess} hostUserId={location.state?.hostUserId || null} hostRole={location.state?.hostRole || 'DEV'} />
            <InviteModal isOpen={modals.isInviteOpen} onClose={() => modals.setIsInviteOpen(false)} roomId={roomId} />
            <SettingsDialog isOpen={modals.isSettingsOpen} onClose={() => modals.setIsSettingsOpen(false)} funFeatures={room.funFeatures} autoReveal={room.autoReveal} anonymousMode={room.anonymousMode} onUpdateSettings={handlers.handleUpdateSettings} onEndSession={handlers.handleEndSession} />
            <EditRoomDetailsDialog isOpen={modals.isEditRoomOpen} onClose={() => modals.setIsEditRoomOpen(false)} roomName={room.roomName} roomDescription={room.roomDescription} onSave={handlers.handleUpdateSettings} />
            <CustomizeCardsDialog isOpen={modals.isCustomizeCardsOpen} onClose={() => modals.setIsCustomizeCardsOpen(false)} votingSystem={room.votingSystem} onSave={handlers.handleUpdateSettings} />
            <EditProfileModal isOpen={modals.isProfileOpen} onClose={() => modals.setIsProfileOpen(false)} currentUser={room.currentUser} onUpdateProfile={handlers.handleUpdateProfile} />
            <ManageGroupsDialog isOpen={modals.isManageGroupsOpen} onClose={() => modals.setIsManageGroupsOpen(false)} groups={room.groups} groupsEnabled={room.groupsEnabled} groupScopedVoting={room.groupScopedVoting} users={room.users} currentUser={room.currentUser} onToggleGroups={handlers.handleToggleGroups} onToggleGroupScopedVoting={(enabled) => handlers.handleUpdateSettings({ groupScopedVoting: enabled })} onCreateGroup={handlers.handleCreateGroup} onDeleteGroup={handlers.handleDeleteGroup} onAssignGroup={handlers.handleAssignGroup} />
            <SignInDialog open={modals.isSignInOpen} onClose={() => modals.setIsSignInOpen(false)} />
            <KeyboardShortcutsDialog isOpen={modals.isKeyboardShortcutsOpen} onClose={() => modals.setIsKeyboardShortcutsOpen(false)} isHost={isMeHost} />
        </div>
    );
};

export default Room;
