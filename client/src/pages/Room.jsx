import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import PokerTable from '../components/Room/PokerTable';
import InviteModal from '../components/InviteModal';
import GuestJoinModal from '../components/GuestJoinModal';
import { Users, Crown } from 'lucide-react';

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
    const [roomMode, setRoomMode] = useState(location.state?.gameMode || 'STANDARD');

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
                        gameMode: response.mode
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
        };

        const onRevealed = ({ votes: revealedVotes, averages }) => {
            setPhase('REVEALED');
            setAverages(averages);
            const votesMap = {};
            revealedVotes.forEach(([uid, val]) => votesMap[uid] = val);
            setVotes(votesMap);
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

        socket.on('user_joined', onUserJoined);
        socket.on('vote_started', onVoteStarted);
        socket.on('vote_update', onVoteUpdate);
        socket.on('revealed', onRevealed);
        socket.on('reset', onReset);
        socket.on('partial_revote', onPartialRevote);

        return () => {
            socket.off('user_joined', onUserJoined);
            socket.off('vote_started', onVoteStarted);
            socket.off('vote_update', onVoteUpdate);
            socket.off('revealed', onRevealed);
            socket.off('reset', onReset);
            socket.off('partial_revote', onPartialRevote);
        };
    }, [socket, currentUser.role, currentUser.id]);


    // Handlers
    const handleGuestJoinSuccess = (user) => {
        setCurrentUser({
            name: user.name,
            role: user.role,
            id: user.userId,
            isHost: false
        });

        if (user.users) {
            setUsers(user.users);
        }

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
            <div className="absolute inset-0 noise z-0" />

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
                            <div className="flex items-center gap-2 bg-dark-800 px-3 py-1.5 rounded-full border border-white/5">
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
                            isHost={isMeHost}
                            onStartVote={handleStartVote}
                            onReveal={handleReveal}
                            onReset={handleReset}
                            onRevotePartial={handleRevote}
                        />
                    </>
                )}
            </main>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roomId={roomId}
            />

        </div>
    );
};

export default Room;
