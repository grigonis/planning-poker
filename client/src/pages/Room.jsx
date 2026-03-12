import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import PokerTable from '../components/Room/PokerTable';
import { toast } from "sonner";
import InviteModal from '../components/InviteModal';
import GuestJoinModal from '../components/GuestJoinModal';
import RoomSettingsModal from '../components/Room/RoomSettingsModal';
import EditProfileModal from '../components/Room/EditProfileModal';
import EmojiReactions from '../components/Room/EmojiReactions';
import TasksPane from '../components/Room/TasksPane';
import PlayerAvatar from '../components/Room/PlayerAvatar';
import { Users, Crown, Settings, LayoutList } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Room = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();

    const [viewState, setViewState] = useState(
        location.state?.userId ? 'ROOM' : 'LOADING'
    ); // 'LOADING' | 'GUEST_INPUT' | 'ROOM'
    const [users, setUsers] = useState(location.state?.users || []);
    const [phase, setPhase] = useState('IDLE');
    const [votes, setVotes] = useState({});
    const [myVote, setMyVote] = useState(null);
    const [averages, setAverages] = useState({});
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

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTasksOpen, setIsTasksOpen] = useState(
        localStorage.getItem(`banana_tasks_open_${roomId}`) === 'true'
    );
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Tasks State
    const [tasks, setTasks] = useState(location.state?.tasks || []);
    const [activeTaskId, setActiveTaskId] = useState(location.state?.activeTaskId || null);

    // Guest / Session State
    const [currentUser, setCurrentUser] = useState(location.state || {});

    // Initial Load & Session Check
    useEffect(() => {
        console.log("Room.jsx Effect: Socket:", !!socket, "Connected:", isConnected, "ViewState:", viewState, "LocState:", location.state);
        if (!socket || !isConnected) return; // Wait for connection

        const tryJoin = (userData) => {
            const { name, role, userId } = userData;
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
                    localStorage.removeItem(`banana_session_${roomId}`);
                } else {
                    setPhase(response.phase);
                    setUsers(response.users);
                    if (response.mode) setRoomMode(response.mode);
                    if (response.funFeatures !== undefined) setFunFeatures(response.funFeatures);
                    if (response.autoReveal !== undefined) setAutoReveal(response.autoReveal);
                    if (response.anonymousMode !== undefined) setAnonymousMode(response.anonymousMode);
                    if (response.votingSystem) setVotingSystem(response.votingSystem);
                    if (response.tasks) setTasks(response.tasks);
                    if (response.activeTaskId) setActiveTaskId(response.activeTaskId);

                    if (response.phase === 'REVEALED' && response.votes) {
                        const votesMap = {};
                        response.votes.forEach(([uid, val]) => votesMap[uid] = val);
                        setVotes(votesMap);
                    }

                    const serverMe = response.users.find(u => u.id === response.userId);
                    const updatedUser = {
                        name: serverMe?.name || name,
                        role: serverMe?.role || role,
                        id: response.userId,
                        isHost: serverMe?.isHost || false,
                        gameMode: response.mode,
                        funFeatures: response.funFeatures,
                        avatarSeed: serverMe?.avatarSeed || name
                    };

                    setCurrentUser(updatedUser);
                    setViewState('ROOM');

                    localStorage.setItem(`banana_session_${roomId}`, JSON.stringify({
                        userId: response.userId,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        roomId
                    }));
                }
            });
        };

        if (location.state?.userId && location.state?.name) {
            tryJoin(location.state);
        } else {
            const storedSession = localStorage.getItem(`banana_session_${roomId}`);
            if (storedSession) {
                try {
                    const sessionData = JSON.parse(storedSession);
                    tryJoin(sessionData);
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
                        localStorage.setItem(`banana_session_${roomId}`, JSON.stringify({
                            userId: next.id,
                            name: next.name,
                            role: next.role,
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

        const onVoteUpdate = ({ userId, hasVoted }) => {
            setVotes(prev => ({ ...prev, [userId]: 'VOTED' }));

            // Play a soft sound when someone votes (if funFeatures is enabled)
            if (funFeatures) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
                } catch (e) {
                    console.log('Audio error:', e);
                }
            }
        };

        const onRevealed = ({ votes: revealedVotes, averages, tasks: updatedTasks, activeTaskId: updatedActiveTaskId }) => {
            setPhase('REVEALED');
            setAverages(averages);
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
            isHost: false
        });

        if (user.users) setUsers(user.users);
        if (user.gameMode) setRoomMode(user.gameMode);
        if (user.funFeatures !== undefined) setFunFeatures(user.funFeatures);
        if (user.autoReveal !== undefined) setAutoReveal(user.autoReveal);
        if (user.anonymousMode !== undefined) setAnonymousMode(user.anonymousMode);
        if (user.votingSystem) setVotingSystem(user.votingSystem);

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
                if (response.votes && response.phase === 'REVEALED') {
                    const votesMap = {};
                    response.votes.forEach(([uid, val]) => { votesMap[uid] = val; });
                    setVotes(votesMap);
                }
            }
        });

        setViewState('ROOM');
        // Persist
        localStorage.setItem(`banana_session_${roomId}`, JSON.stringify({
            userId: user.userId,
            name: user.name,
            role: user.role,
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

    const handleRevote = (role) => {
        socket.emit('revote_partial', { roomId, targetRole: role });
    };

    const handleUpdateSettings = (settings) => {
        socket.emit('update_room_settings', { roomId, settings });
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
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                    {/* Logo/Room Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
                            <h1 className="text-xl font-black text-primary leading-none tracking-tight">BananaPoker</h1>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <span>Room: <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded ml-0.5 select-all">{roomId}</span></span>
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-white/10 ml-2"></div>
                        
                        {/* Status (Connected) */}
                        <div className="hidden md:flex items-center gap-1.5 ml-2">
                            <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{socket?.connected ? 'Live' : 'Offline'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    {validUser && (
                        <div className="flex items-center gap-2 md:gap-3">
                            <div 
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center justify-center transition-transform duration-200 cursor-pointer hover:scale-110 active:scale-95"
                            >
                                <div className="pointer-events-none">
                                    <PlayerAvatar user={{ ...currentUser, connected: true }} size={36} isCurrentUser={false} anonymousMode={false} hideDetails={true} />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setIsTasksOpen(prev => {
                                        const next = !prev;
                                        localStorage.setItem(`banana_tasks_open_${roomId}`, next);
                                        return next;
                                    });
                                }}
                                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full font-bold text-sm transition-all border ${isTasksOpen ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' : 'bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/[0.08]'}`}
                            >
                                <LayoutList size={16} />
                                <span className="hidden lg:inline">Tasks</span>
                                {tasks.length > 0 && <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md text-[10px] leading-none ml-0.5 shadow-sm">{tasks.length}</span>}
                            </button>

                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-sm font-bold px-3 lg:px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                            >
                                <Users size={16} />
                                <span className="hidden lg:inline">Invite</span>
                            </button>

                            <ThemeToggle />

                            {isMeHost && (
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="p-2 rounded-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.08] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                                >
                                    <Settings className="w-4.5 h-4.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Main Table Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">

                {/* Guest Modal */}
                <GuestJoinModal
                    isOpen={needsGuestJoin}
                    roomId={roomId}
                    onJoinSuccess={handleGuestJoinSuccess}
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
                            activeReactions={activeReactions}
                            isHost={isMeHost}
                            funFeatures={funFeatures}
                            autoReveal={autoReveal}
                            anonymousMode={anonymousMode}
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
                        localStorage.setItem(`banana_tasks_open_${roomId}`, 'false');
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
            <RoomSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                funFeatures={funFeatures}
                autoReveal={autoReveal}
                anonymousMode={anonymousMode}
                votingSystem={votingSystem}
                phase={phase}
                onUpdateSettings={handleUpdateSettings}
                onEndSession={handleEndSession}
            />
            <EditProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
            />
        </div>
    );
};

export default Room;
