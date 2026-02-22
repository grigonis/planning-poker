import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import PokerTable from '../components/Room/PokerTable';
import InviteModal from '../components/InviteModal';
import GuestJoinModal from '../components/GuestJoinModal';
import RoomSettingsModal from '../components/Room/RoomSettingsModal';
import EmojiReactions from '../components/Room/EmojiReactions';
import { Users, Crown, Settings } from 'lucide-react';

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

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
                        alert("Room not found");
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
                        funFeatures: response.funFeatures
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
                if (me && (me.isHost !== currentUser.isHost || me.role !== currentUser.role)) {
                    setCurrentUser(prev => ({ ...prev, isHost: me.isHost, role: me.role }));
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

        const onRevealed = ({ votes: revealedVotes, averages }) => {
            setPhase('REVEALED');
            setAverages(averages);
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
                                colors: ['#4b2bee', '#facc15', '#ffffff'] // Primary, Banana, White
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

        const onReset = () => {
            setPhase('IDLE');
            setMyVote(null);
            setVotes({});
            setAverages({});
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
        };

        const onSessionEnded = () => {
            alert('The host has ended this session.');
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

        socket.on('user_joined', onUserJoined);
        socket.on('vote_started', onVoteStarted);
        socket.on('vote_update', onVoteUpdate);
        socket.on('revealed', onRevealed);
        socket.on('reset', onReset);
        socket.on('partial_revote', onPartialRevote);
        socket.on('room_settings_updated', onRoomSettingsUpdated);
        socket.on('session_ended', onSessionEnded);
        socket.on('show_reaction', onShowReaction);

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

    const handleEndSession = () => {
        socket.emit('end_session', { roomId });
    };

    // Derived state
    const isMeHost = users.find(u => u.id === currentUser.id)?.isHost || false;
    const validUser = viewState === 'ROOM';
    const needsGuestJoin = viewState === 'GUEST_INPUT';

    const showOverlay = (phase === 'VOTING' && currentUser.role !== 'OBSERVER') ||
        (phase === 'PARTIAL_VOTE_DEV' && currentUser.role === 'DEV') ||
        (phase === 'PARTIAL_VOTE_QA' && currentUser.role === 'QA');

    // Show Loading Detection - Now correctly placed after hooks
    if (viewState === 'LOADING') {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-banana-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-heading">
                        {!socket ? 'Initializing Socket...' : !isConnected ? 'Connecting to Server...' : 'Joining Room...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 font-sans text-white selection:bg-banana-500/30 flex flex-col relative">

            {/* Background Effects */}
            <div className="absolute inset-0 aurora z-0" />
            <div className="absolute inset-0 modern-grid z-0" />

            {/* Unified Navbar with Invite Button */}
            <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
                <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo/Room Info */}
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold font-heading text-banana-500 leading-none">BananaPoker</h1>
                        <span className="text-xs text-gray-400 font-mono mt-1">Room: {roomId}</span>
                    </div>
                    {/* Game Mode Badge */}
                    <div className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-400 font-heading uppercase tracking-wider border border-white/5">
                        {roomMode} Mode
                    </div>

                    {/* Actions */}
                    {validUser && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-dark-800 px-3 py-1.5 rounded-full border border-white/5 hide-on-mobile">
                                <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-300 font-bold">{currentUser.name}</span>
                                <span className="text-xs text-gray-500 border-l border-white/10 pl-2 ml-1">{currentUser.role}</span>
                            </div>

                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold font-heading px-4 py-2 rounded-full transition-colors border border-white/5 flex items-center gap-2"
                            >
                                <Users size={16} />
                                Invite
                            </button>

                            {isMeHost && (
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="p-2 ml-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
                                >
                                    <Settings className="w-5 h-5" />
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
                            />
                        )}

                        {/* Glassmorphic Poker Table */}
                        <PokerTable
                            users={users}
                            currentUser={currentUser}
                            votes={votes}
                            myVote={myVote}
                            phase={phase}
                            roomMode={roomMode}
                            averages={averages}
                            activeReactions={activeReactions}
                            isHost={isMeHost}
                            funFeatures={funFeatures}
                            autoReveal={autoReveal}
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
                onUpdateSettings={handleUpdateSettings}
                onEndSession={handleEndSession}
            />
        </div>
    );
};

export default Room;
