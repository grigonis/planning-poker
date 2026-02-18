import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import ResultsBoard from '../components/Results/ResultsBoard';
import Card from '../components/Voting/Card';
import InviteModal from '../components/InviteModal';
import GuestJoinModal from '../components/GuestJoinModal';
import { Users, Crown, Coffee } from 'lucide-react';

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
        <div className="min-h-screen bg-dark-900 font-sans text-white selection:bg-banana-500/30 flex flex-col">

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
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">

                {/* Guest Modal */}
                <GuestJoinModal
                    isOpen={needsGuestJoin}
                    roomId={roomId}
                    onJoinSuccess={handleGuestJoinSuccess}
                />

                {validUser && (
                    <>
                        {/* Host Controls */}
                        {isMeHost && (
                            <div className="flex gap-4 justify-center mb-12 animate-in slide-in-from-top-4 duration-500">
                                {phase === 'IDLE' && (
                                    <button onClick={handleStartVote} className="bg-banana-500 text-dark-900 px-8 py-3 rounded-xl shadow-[0_4px_0_0_#e69900] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e69900] transition-all font-bold font-heading text-lg flex items-center gap-2">
                                        <Crown size={20} />
                                        Start Voting Round
                                    </button>
                                )}
                                {(phase === 'VOTING' || phase.startsWith('PARTIAL')) && (
                                    <button onClick={handleReveal} className="bg-dark-800 text-white border border-white/10 px-8 py-3 rounded-xl shadow-lg hover:bg-dark-800/80 font-bold font-heading text-lg">
                                        Reveal Cards
                                    </button>
                                )}
                                {phase === 'REVEALED' && (
                                    <div className="text-gray-400 font-bold font-heading">Round Complete</div>
                                )}
                            </div>
                        )}

                        {/* Status Message */}
                        {phase === 'VOTING' && (
                            <div className="text-center mb-12">
                                <p className="text-xl text-banana-400 animate-pulse font-heading font-bold">Voting in progress...</p>
                            </div>
                        )}


                        {/* Voting Overlay (Bottom Fixed or Modal-like) */}
                        {showOverlay && !myVote && (
                            <VotingOverlay
                                role={currentUser.role}
                                onVote={handleVote}
                                currentVote={myVote}
                            />
                        )}

                        {/* Results Board */}
                        {phase === 'REVEALED' && (
                            <ResultsBoard
                                averages={averages}
                                users={users}
                                votes={votes}
                                isHost={isMeHost}
                                onReset={handleReset}
                                onRevotePartial={handleRevote}
                            />
                        )}

                        {/* Users / Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                            {users
                                .filter(u => u.role !== 'OBSERVER') // Hide Observers from Table
                                .map((u) => {
                                    const hasVoted = votes[u.id] !== undefined;
                                    const voteVal = votes[u.id];
                                    // Match by ID (UUID) now
                                    const isMe = u.id === currentUser.id;

                                    let cardValue = null;
                                    let faceDown = true;

                                    if (phase === 'REVEALED') {
                                        cardValue = voteVal;
                                        faceDown = false;
                                    } else if (isMe && myVote) {
                                        cardValue = myVote;
                                        faceDown = false;
                                    } else if (hasVoted) {
                                        cardValue = '?';
                                        faceDown = true;
                                    }

                                    // Determine Badge Style
                                    let badgeStyle = '';
                                    if (roomMode === 'STANDARD') {
                                        badgeStyle = 'bg-gray-700/50 text-gray-300 border border-gray-600/50'; // Unify
                                    } else {
                                        badgeStyle = u.role === 'DEV'
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                                    }

                                    return (
                                        <div key={u.id} className={`flex flex-col items-center group ${!u.connected ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="mb-4 relative transition-transform duration-300 group-hover:-translate-y-2">
                                                {/* Card Placeholder */}
                                                {hasVoted || (isMe && myVote) ? (
                                                    <Card value={cardValue} faceDown={faceDown} className="cursor-default shadow-2xl" />
                                                ) : (
                                                    <div className="w-24 h-36 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/5">
                                                        <span className="text-xs text-gray-500 font-heading tracking-wider uppercase">Thinking</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-bold text-white font-heading flex items-center gap-2">
                                                    {u.name}
                                                    {u.isHost && <Crown size={12} className="text-yellow-500" />}
                                                    {!u.connected && (
                                                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono">OFFLINE</span>
                                                    )}
                                                </span>
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${badgeStyle}`}>
                                                    {roomMode === 'STANDARD' ? 'Estimator' : u.role}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
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
