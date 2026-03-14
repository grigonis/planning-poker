import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import PokerTable from '../components/Room/PokerTable';
import { toast } from "sonner";
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
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';
import SignInDialog from '../components/SignInDialog';

const Room = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { userId: globalUserId, name: globalName, avatarSeed: globalAvatarSeed } = useProfile();
    const { user: authUser, signOut } = useAuthContext();

    const [viewState, setViewState] = useState(
        // userId present = existing session/create-room old flow → go straight to room
        // hostUserId present = host just created room, needs profile setup → GUEST_INPUT
        // Neither = new visitor, check localStorage → LOADING
        location.state?.userId ? 'ROOM' : 'LOADING'
    ); // 'LOADING' | 'GUEST_INPUT' | 'ROOM'
    const [users, setUsers] = useState(location.state?.users || []);
    const [phase, setPhase] = useState('IDLE');
    const [votes, setVotes] = useState({});
    const [myVote, setMyVote] = useState(null);
    const [averages, setAverages] = useState({});
    const [groupAverages, setGroupAverages] = useState([]);
    const [activeReactions, setActiveReactions] = useState({});
    const [roomMode, setRoomMode] = useState(location.state?.gameMode || 'STANDARD');
    const [funFeatures, setFunFeatures] = useState(location.state?.funFeatures || false);
    const [autoReveal, setAutoReveal] = useState(location.state?.autoReveal || false);
    const [anonymousMode, setAnonymousMode] = useState(location.state?.anonymousMode || false);
    const [votingSystem, setVotingSystem] = useState(location.state?.votingSystem || {
        type: 'FIBONACCI_MODIFIED',
        name: 'Modified Fibonacci',
        values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
    });
    const [roomName, setRoomName] = useState(location.state?.roomName || '');
    const [roomDescription, setRoomDescription] = useState(location.state?.roomDescription || '');
    const [groups, setGroups] = useState(location.state?.groups || []);
    const [groupsEnabled, setGroupsEnabled] = useState(location.state?.groupsEnabled || false);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
    const [isCustomizeCardsOpen, setIsCustomizeCardsOpen] = useState(false);
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [isTasksOpen, setIsTasksOpen] = useState(
        localStorage.getItem(`keystimate_tasks_open_${roomId}`) === 'true'
    );
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);

    // Tasks State
    const [tasks, setTasks] = useState(location.state?.tasks || []);
    const [activeTaskId, setActiveTaskId] = useState(location.state?.activeTaskId || null);

    // QA-13: Reuse a single AudioContext across all vote events to avoid browser limit
    const audioCtxRef = useRef(null);
    useEffect(() => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            audioCtxRef.current = new AudioCtx();
        }
        return () => {
            audioCtxRef.current?.close();
            audioCtxRef.current = null;
        };
    }, []);

    // Guest / Session State
    const [currentUser, setCurrentUser] = useState(location.state || {});

    // Initial Load & Session Check
    useEffect(() => {
        console.log("Room.jsx Effect: Socket:", !!socket, "Connected:", isConnected, "ViewState:", viewState, "LocState:", location.state);
        if (!socket || !isConnected) return; // Wait for connection

        const tryJoin = (userData) => {
            const { name, role, userId, avatarSeed } = userData;
            socket.emit('join_room', {
                roomId,
                name,
                role,
                userId
            }, (response) => {
                if (response.error) {
                    if (response.error === 'Room not found') {
                        toast.error("Room not found");
                        navigate('/');
                        return;
                    }
                    setViewState('GUEST_INPUT');
                    localStorage.removeItem(`keystimate_session_${roomId}`);
                } else {
                    setPhase(response.phase);
                    setUsers(response.users);
                    if (response.mode) setRoomMode(response.mode);
                    if (response.funFeatures !== undefined) setFunFeatures(response.funFeatures);
                    if (response.autoReveal !== undefined) setAutoReveal(response.autoReveal);
                    if (response.anonymousMode !== undefined) setAnonymousMode(response.anonymousMode);
                    if (response.votingSystem) setVotingSystem(response.votingSystem);
                    if (response.roomName !== undefined) setRoomName(response.roomName);
                    if (response.roomDescription !== undefined) setRoomDescription(response.roomDescription);
                    if (response.groups) setGroups(response.groups);
                    if (response.groupsEnabled !== undefined) setGroupsEnabled(response.groupsEnabled);
                    if (response.tasks) setTasks(response.tasks);
                    if (response.activeTaskId) setActiveTaskId(response.activeTaskId);

                    // Restore vote state on rejoin (both VOTING masked votes and REVEALED real votes)
                    if (response.votes && response.votes.length > 0) {
                        const votesMap = {};
                        response.votes.forEach(([uid, val]) => votesMap[uid] = val);
                        setVotes(votesMap);
                        // If we were already in voting phase and had cast a vote, restore myVote
                        // to a sentinel so the overlay doesn't re-appear
                        if (response.phase !== 'IDLE' && votesMap[response.userId] !== undefined) {
                            setMyVote('VOTED');
                        }
                    }

                    const serverMe = response.users.find(u => u.id === response.userId);
                    
                    // Sync avatar to server if we have a seed and server doesn't match
                    if (avatarSeed && serverMe && serverMe.avatarSeed !== avatarSeed) {
                        socket.emit('update_profile', { roomId, name, avatarSeed });
                    }

                    const updatedUser = {
                        name: serverMe?.name || name,
                        role: serverMe?.role || role,
                        id: response.userId,
                        isHost: serverMe?.isHost || false,
                        gameMode: response.mode,
                        funFeatures: response.funFeatures,
                        avatarSeed: serverMe?.avatarSeed || avatarSeed || name
                    };

                    setCurrentUser(updatedUser);
                    setViewState('ROOM');

                    localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
                        userId: response.userId,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        avatarSeed: updatedUser.avatarSeed,
                        roomId
                    }));
                }
            });
        };

        if (location.state?.userId && location.state?.name) {
            // Priority 1: Navigation state (passed from /create)
            tryJoin(location.state);
        } else {
            const storedSession = localStorage.getItem(`keystimate_session_${roomId}`);

            if (storedSession) {
                // Priority 2: Active session for this specific room
                try {
                    tryJoin(JSON.parse(storedSession));
                } catch (e) {
                    setViewState('GUEST_INPUT');
                }
            } else if (globalName) {
                // Priority 3: Global identity auto-join
                try {
                    const hostUserId = location.state?.hostUserId;
                    const hostRole = location.state?.hostRole || 'DEV';

                    // Use hostUserId if we are the host (just redirected from /create)
                    // Otherwise use globalUserId so history is linked
                    tryJoin({
                        name: globalName,
                        role: hostUserId ? hostRole : 'DEV',
                        userId: hostUserId || globalUserId,
                        avatarSeed: globalAvatarSeed || globalName
                    });
                } catch (e) {
                    setViewState('GUEST_INPUT');
                }
            } else {
                setViewState('GUEST_INPUT');
            }
        }
    }, [socket, isConnected, roomId]);

    // Socket Event Listeners - MOVED UP before any conditional return
    useEffect(() => {
        if (!socket) return;

        const onUserJoined = (updatedUsers) => {
            setUsers(updatedUsers);
            if (currentUser.id) {
                const me = updatedUsers.find(u => u.id === currentUser.id);
                if (me && (me.isHost !== currentUser.isHost || me.role !== currentUser.role || me.name !== currentUser.name || me.avatarSeed !== currentUser.avatarSeed)) {
                    setCurrentUser(prev => {
                        const next = { ...prev, isHost: me.isHost, role: me.role, name: me.name, avatarSeed: me.avatarSeed };
                        // Persist session info on changes
                        localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
                            userId: next.id,
                            name: next.name,
                            role: next.role,
                            avatarSeed: next.avatarSeed,
                            roomId
                        }));
                        return next;
                    });
                }
            }
        };

        const onVoteStarted = ({ phase }) => {
            setPhase(phase);
            setMyVote(null);
            setVotes({});
        };

        const onVoteUpdate = ({ userId }) => {
            setVotes(prev => ({ ...prev, [userId]: 'VOTED' }));

            // Play a soft sound when someone votes (if funFeatures is enabled)
            if (funFeatures) {
                try {
                    const audioContext = audioCtxRef.current;
                    if (audioContext && audioContext.state !== 'closed') {
                        // Resume context if suspended (browser autoplay policy)
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
                } catch (e) {
                    // Audio failure is non-critical — silently ignore
                }
            }
        };

        const onRevealed = ({ votes: revealedVotes, averages, groupAverages: ga, groupsEnabled: ge, tasks: updatedTasks, activeTaskId: updatedActiveTaskId }) => {
            setPhase('REVEALED');
            setAverages(averages);
            if (ga !== undefined) setGroupAverages(ga);
            if (ge !== undefined) setGroupsEnabled(ge);
            if (updatedTasks) setTasks(updatedTasks);
            if (updatedActiveTaskId !== undefined) setActiveTaskId(updatedActiveTaskId);
            const votesMap = {};
            revealedVotes.forEach(([uid, val]) => {
                votesMap[uid] = val;
            });
            setVotes(votesMap);

            // Check for consensus if funFeatures is enabled
            if (funFeatures && revealedVotes.length > 0) {
                // Ignore "?" and "COFFEE" for consensus
                const numericalVotes = revealedVotes
                    .map(v => v[1])
                    .filter(val => val !== '?' && val !== 'COFFEE' && val !== 'questionMark');

                if (numericalVotes.length > 1) {
                    const allSame = numericalVotes.every(val => val === numericalVotes[0]);
                    if (allSame) {
                        import('canvas-confetti').then((confetti) => {
                            confetti.default({
                                particleCount: 150,
                                spread: 70,
                                origin: { y: 0.6 },
                                colors: ['#2563eb', '#60a5fa', '#ffffff'] // Primary, Accent Blue, White
                            });
                        });

                        try {
                            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();

                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);

                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                            oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
                            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5

                            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
                            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.5);
                        } catch (e) {
                            console.log('Audio error:', e);
                        }
                    }
                }
            }
        };

        const onReset = ({ activeTaskId: updatedActiveTaskId } = {}) => {
            setPhase('IDLE');
            setMyVote(null);
            setVotes({});
            setAverages({});
            setGroupAverages([]);
            if (updatedActiveTaskId !== undefined) setActiveTaskId(updatedActiveTaskId);
        };

        const onPartialRevote = ({ phase }) => {
            setPhase(phase);
            if (
                (phase === 'PARTIAL_VOTE_DEV' && currentUser.role === 'DEV') ||
                (phase === 'PARTIAL_VOTE_QA' && currentUser.role === 'QA')
            ) {
                setMyVote(null);
            }
        };

        const onRoomSettingsUpdated = ({ settings }) => {
            if (settings.funFeatures !== undefined) setFunFeatures(settings.funFeatures);
            if (settings.autoReveal !== undefined) setAutoReveal(settings.autoReveal);
            if (settings.anonymousMode !== undefined) setAnonymousMode(settings.anonymousMode);
            if (settings.votingSystem) setVotingSystem(settings.votingSystem);
            if (settings.roomName !== undefined) setRoomName(settings.roomName);
            if (settings.roomDescription !== undefined) setRoomDescription(settings.roomDescription);
            if (settings.groupsEnabled !== undefined) setGroupsEnabled(settings.groupsEnabled);
        };

        const onRoomGroupsUpdated = ({ groups: updatedGroups, groupsEnabled: updatedEnabled }) => {
            if (updatedGroups !== undefined) setGroups(updatedGroups);
            if (updatedEnabled !== undefined) setGroupsEnabled(updatedEnabled);
        };

        const onSessionEnded = () => {
            toast.error('The host has ended this session.');
            navigate('/');
        };

        const onShowReaction = ({ userId, emojiIcon }) => {
            if (!funFeatures) return; // ignore if off
            const reactId = Math.random().toString(36).substr(2, 9);
            setActiveReactions(prev => ({ ...prev, [userId]: { icon: emojiIcon, id: reactId } }));
            setTimeout(() => {
                setActiveReactions(prev => {
                    if (prev[userId]?.id === reactId) {
                        const next = { ...prev };
                        delete next[userId];
                        return next;
                    }
                    return prev;
                });
            }, 6000); // Show for 6 seconds
        };

        const onTasksUpdated = ({ tasks, activeTaskId }) => {
            if (tasks) setTasks(tasks);
            if (activeTaskId !== undefined) setActiveTaskId(activeTaskId);
        };

        socket.on('user_joined', onUserJoined);
        socket.on('vote_started', onVoteStarted);
        socket.on('vote_update', onVoteUpdate);
        socket.on('revealed', onRevealed);
        socket.on('reset', onReset);
        socket.on('partial_revote', onPartialRevote);
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
            socket.off('partial_revote', onPartialRevote);
            socket.off('room_settings_updated', onRoomSettingsUpdated);
            socket.off('room_groups_updated', onRoomGroupsUpdated);
            socket.off('session_ended', onSessionEnded);
            socket.off('show_reaction', onShowReaction);
            socket.off('tasks_updated', onTasksUpdated);
        };
    }, [socket, currentUser.role, currentUser.id, funFeatures, autoReveal, navigate]);


    const handleGuestJoinSuccess = (user) => {
        setCurrentUser({
            name: user.name,
            role: user.role,
            id: user.userId,
            isHost: user.isHost || false,
            avatarSeed: user.avatarSeed || user.name,
        });

        if (user.users) setUsers(user.users);
        if (user.gameMode) setRoomMode(user.gameMode);
        if (user.funFeatures !== undefined) setFunFeatures(user.funFeatures);
        if (user.autoReveal !== undefined) setAutoReveal(user.autoReveal);
        if (user.anonymousMode !== undefined) setAnonymousMode(user.anonymousMode);
        if (user.votingSystem) setVotingSystem(user.votingSystem);
        if (user.roomName !== undefined) setRoomName(user.roomName);
        if (user.roomDescription !== undefined) setRoomDescription(user.roomDescription);
        if (user.groups) setGroups(user.groups);
        if (user.groupsEnabled !== undefined) setGroupsEnabled(user.groupsEnabled);

        // Note: phase and votes are not passed by GuestJoinModal directly right now,
        // but it doesn't matter because once viewState === 'ROOM', tryJoin is triggered!
        // Wait, tryJoin is not triggered again because it's only in an effect on mount. 
        // Emitting 'join_room' again is safe and fetches the phase/votes natively.
        socket.emit('join_room', {
            roomId,
            name: user.name,
            role: user.role,
            userId: user.userId
        }, (response) => {
            if (!response.error) {
                setPhase(response.phase);
                if (response.votes && response.votes.length > 0) {
                    const votesMap = {};
                    response.votes.forEach(([uid, val]) => { votesMap[uid] = val; });
                    setVotes(votesMap);
                    if (response.phase !== 'IDLE' && votesMap[response.userId] !== undefined) {
                        setMyVote('VOTED');
                    }
                }
                if (response.groups) setGroups(response.groups);
                if (response.groupsEnabled !== undefined) setGroupsEnabled(response.groupsEnabled);
            }
        });

        setViewState('ROOM');
        // Persist
        localStorage.setItem(`keystimate_session_${roomId}`, JSON.stringify({
            userId: user.userId,
            name: user.name,
            role: user.role,
            avatarSeed: user.avatarSeed,
            roomId
        }));
    };

    const handleStartVote = () => {
        socket.emit('start_vote', { roomId });
    };

    const handleVote = (value) => {
        setMyVote(value);
        socket.emit('cast_vote', { roomId, value });
    };

    const handleReveal = () => {
        socket.emit('reveal', { roomId });
    };

    const handleReset = () => {
        socket.emit('reset', { roomId });
    };

    // handleRevote: partial revote not yet implemented on server — placeholder for future feature
    const handleRevote = () => {}; // no-op until server handler is implemented

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

    const handleUpdateProfile = ({ name, avatarSeed }) => {
        socket.emit('update_profile', { roomId, name, avatarSeed });
    };

    const handleEndSession = () => {
        socket.emit('end_session', { roomId });
    };

    // Task Management
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

    // Derived state
    const isMeHost = users.find(u => u.id === currentUser.id)?.isHost || false;
    const validUser = viewState === 'ROOM';
    const needsGuestJoin = viewState === 'GUEST_INPUT';

    const showOverlay = (phase === 'VOTING' && currentUser.role !== 'SPECTATOR') ||
        (phase === 'PARTIAL_VOTE_DEV' && currentUser.role === 'DEV') ||
        (phase === 'PARTIAL_VOTE_QA' && currentUser.role === 'QA');

    // Show Loading Detection - Now correctly placed after hooks
    if (viewState === 'LOADING') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 ">
                        {!socket ? 'Initializing Socket...' : !isConnected ? 'Connecting to Server...' : 'Joining Room...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 font-sans text-gray-900 dark:text-white selection:bg-primary/30 flex flex-col relative transition-colors duration-300">

            {/* Background Effects */}
            <div className="absolute inset-0 aurora z-0" />
            <div className="absolute inset-0 modern-grid z-0" />

            {/* Unified Navbar */}
            <RoomNavbar 
                roomId={roomId}
                roomName={roomName}
                roomDescription={roomDescription}
                socketStatus={socket?.connected}
                tasksCount={tasks.length}
                isHost={isMeHost}
                isTasksOpen={isTasksOpen}
                currentUser={currentUser}
                onToggleTasks={() => {
                    setIsTasksOpen(prev => {
                        const next = !prev;
                        localStorage.setItem(`keystimate_tasks_open_${roomId}`, next);
                        return next;
                    });
                }}
                onOpenEditRoom={() => setIsEditRoomOpen(true)}
                onOpenCustomizeCards={() => setIsCustomizeCardsOpen(true)}
                onOpenSettings={() => setIsSettingsDialogOpen(true)}
                onOpenManageGroups={() => setIsManageGroupsOpen(true)}
                onOpenInvite={() => setIsInviteModalOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                authUser={authUser}
                onSignIn={() => setIsSignInOpen(true)}
                onSignOut={signOut}
            />


            {/* Participant Panel — fixed left-side, hidden below md */}
            {validUser && (
                <ParticipantPanel
                    users={users}
                    votes={votes}
                    phase={phase}
                    currentUser={currentUser}
                    roomId={roomId}
                    anonymousMode={anonymousMode}
                    groups={groups}
                    groupsEnabled={groupsEnabled}
                    isHost={isMeHost}
                    onAssignGroup={handleAssignGroup}
                />
            )}

            {/* Main Table Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">

                {/* Profile Setup / Guest Join Modal */}
                <GuestJoinModal
                    isOpen={needsGuestJoin}
                    roomId={roomId}
                    onJoinSuccess={handleGuestJoinSuccess}
                    hostUserId={location.state?.hostUserId || null}
                    hostRole={location.state?.hostRole || 'DEV'}
                />

                {validUser && (
                    <>
                        {/* Voting Overlay */}
                        {showOverlay && !myVote && (
                            <VotingOverlay
                                role={currentUser.role}
                                onVote={handleVote}
                                currentVote={myVote}
                                votingSystem={votingSystem}
                            />
                        )}

                        {/* Glassmorphic Poker Table */}
                        <PokerTable
                            users={users}
                            currentUser={currentUser}
                            votes={votes}
                            myVote={myVote}
                            phase={phase}
                            averages={averages}
                            groupAverages={groupAverages}
                            groupsEnabled={groupsEnabled}
                            groups={groups}
                            activeReactions={activeReactions}
                            isHost={isMeHost}
                            funFeatures={funFeatures}
                            autoReveal={autoReveal}
                            anonymousMode={anonymousMode}
                            roomMode={roomMode}
                            votingSystem={votingSystem}
                            tasks={tasks}
                            activeTaskId={activeTaskId}
                            onStartVote={handleStartVote}
                            onReveal={handleReveal}
                            onReset={handleReset}
                            onRevotePartial={handleRevote}
                            onUpdateSettings={handleUpdateSettings}
                        />
                        {/* Emoji Reactions System */}
                        {funFeatures && (
                            <EmojiReactions
                                roomId={roomId}
                                currentUserId={currentUser.id}
                                phase={phase}
                            />
                        )}

                    </>
                )}
            </main>

            {validUser && (
                <TasksPane
                    isOpen={isTasksOpen}
                    onClose={() => {
                        setIsTasksOpen(false);
                        localStorage.setItem(`keystimate_tasks_open_${roomId}`, 'false');
                    }}
                    tasks={tasks}
                    activeTaskId={activeTaskId}
                    isHost={isMeHost}
                    onCreateTask={handleCreateTask}
                    onBulkCreate={handleBulkCreate}
                    onDeleteTask={handleDeleteTask}
                    onSelectTask={handleSelectTask}
                />
            )}

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roomId={roomId}
            />
            <SettingsDialog
                isOpen={isSettingsDialogOpen}
                onClose={() => setIsSettingsDialogOpen(false)}
                funFeatures={funFeatures}
                autoReveal={autoReveal}
                anonymousMode={anonymousMode}
                onUpdateSettings={handleUpdateSettings}
                onEndSession={handleEndSession}
            />
            <EditRoomDetailsDialog
                isOpen={isEditRoomOpen}
                onClose={() => setIsEditRoomOpen(false)}
                roomName={roomName}
                roomDescription={roomDescription}
                onSave={(settings) => {
                    handleUpdateSettings(settings);
                    toast.success("Room details updated");
                }}
            />
            <CustomizeCardsDialog
                isOpen={isCustomizeCardsOpen}
                onClose={() => setIsCustomizeCardsOpen(false)}
                votingSystem={votingSystem}
                onSave={(settings) => {
                    handleUpdateSettings(settings);
                    toast.success("Card values updated");
                }}
            />
            <EditProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
            />
            <ManageGroupsDialog
                isOpen={isManageGroupsOpen}
                onClose={() => setIsManageGroupsOpen(false)}
                groups={groups}
                groupsEnabled={groupsEnabled}
                users={users}
                currentUser={currentUser}
                onToggleGroups={handleToggleGroups}
                onCreateGroup={handleCreateGroup}
                onDeleteGroup={handleDeleteGroup}
                onAssignGroup={handleAssignGroup}
            />
            {/* Sign-in dialog */}
            <SignInDialog
                open={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />
        </div>
    );
};

export default Room;
