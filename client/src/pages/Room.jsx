import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VotingOverlay from '../components/Voting/VotingOverlay';
import ResultsBoard from '../components/Results/ResultsBoard';
import Card from '../components/Voting/Card';
import { Users, Crown, Coffee } from 'lucide-react';

const Room = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    const [users, setUsers] = useState([]);
    const [phase, setPhase] = useState('IDLE'); // IDLE, VOTING, REVEALED, PARTIAL_VOTE_DEV, PARTIAL_VOTE_QA
    const [myVote, setMyVote] = useState(null);
    const [votes, setVotes] = useState({}); // userId -> value
    const [averages, setAverages] = useState({ dev: 0, qa: 0 });

    // User info from navigation state (Landing page)
    const [currentUser, setCurrentUser] = useState(location.state || {});

    useEffect(() => {
        if (!socket) return;
        if (!currentUser.name) {
            // Redirect to landing if no name (direct link access)
            // Ideally show a modal to enter name, but for MVP redirect.
            // alert("Please join via home page");
            // navigate('/');
            // Or keep on page and show "Join" modal. 
            // IMPLEMENTATION: For now, strict redirect.
            navigate('/');
            return;
        }

        // Join room
        socket.emit('join_room', {
            roomId,
            name: currentUser.name,
            role: currentUser.role
        }, (response) => {
            if (response.error) {
                alert(response.error);
                navigate('/');
            } else {
                setPhase(response.phase);
                setUsers(response.users);
                // Sync votes if provided (hidden or shown based on phase)
            }
        });

        // Event Listeners
        socket.on('user_joined', (updatedUsers) => setUsers(updatedUsers));

        socket.on('vote_started', ({ phase }) => {
            setPhase(phase);
            setMyVote(null);
            setVotes({}); // Clear local view of votes
        });

        socket.on('vote_update', ({ userId, hasVoted }) => {
            setVotes(prev => ({ ...prev, [userId]: 'VOTED' }));
        });

        socket.on('revealed', ({ votes: revealedVotes, averages }) => {
            setPhase('REVEALED');
            setAverages(averages);
            // revealedVotes is array of [userId, value]
            const votesMap = {};
            revealedVotes.forEach(([uid, val]) => votesMap[uid] = val);
            setVotes(votesMap);
        });

        socket.on('reset', () => {
            setPhase('IDLE');
            setMyVote(null);
            setVotes({});
            setAverages({ dev: 0, qa: 0 });
        });

        socket.on('partial_revote', ({ phase }) => {
            setPhase(phase);
            if (
                (phase === 'PARTIAL_VOTE_DEV' && currentUser.role === 'DEV') ||
                (phase === 'PARTIAL_VOTE_QA' && currentUser.role === 'QA')
            ) {
                setMyVote(null); // Allow re-vote
            }
        });

        return () => {
            socket.off('user_joined');
            socket.off('vote_started');
            socket.off('vote_update');
            socket.off('revealed');
            socket.off('reset');
            socket.off('partial_revote');
        };
    }, [socket, roomId, currentUser, navigate]);

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
    const isHost = currentUser.role === 'HOST'; // Or check flag from server
    // Actually, we set 'HOST' role in Landing.jsx if creating.

    const showOverlay = (phase === 'VOTING') ||
        (phase === 'PARTIAL_VOTE_DEV' && currentUser.role === 'DEV') ||
        (phase === 'PARTIAL_VOTE_QA' && currentUser.role === 'QA');

    if (!currentUser.name) return null;

    return (
        <div className="min-h-screen bg-dark-900 p-4 font-sans text-white selection:bg-banana-500/30">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-xl font-bold font-heading flex items-center gap-2 text-banana-500">
                        BananaPoker <span className="text-sm font-normal text-gray-400 font-sans">Room: {roomId}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-dark-800 px-3 py-1 rounded-full shadow-sm border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-300">{currentUser.name} ({currentUser.role})</span>
                    </div>
                </div>
            </header>

            {/* Main Table Area */}
            <main className="max-w-5xl mx-auto">

                {/* Host Controls */}
                {isHost && (
                    <div className="flex gap-4 justify-center mb-12">
                        {phase === 'IDLE' && (
                            <button onClick={handleStartVote} className="bg-banana-500 text-dark-900 px-8 py-3 rounded-xl shadow-[0_4px_0_0_#e69900] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#e69900] transition-all font-bold font-heading text-lg">
                                Start Voting Round
                            </button>
                        )}
                        {(phase === 'VOTING' || phase.startsWith('PARTIAL')) && (
                            <button onClick={handleReveal} className="bg-dark-800 text-white border border-white/10 px-8 py-3 rounded-xl shadow-lg hover:bg-dark-800/80 font-bold font-heading text-lg">
                                Reveal Cards
                            </button>
                        )}
                        {phase === 'REVEALED' && (
                            <button onClick={handleReset} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium transition-colors">
                                Reset Round
                            </button>
                        )}
                    </div>
                )}

                {/* Voting Overlay */}
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
                        isHost={isHost}
                        onReset={handleReset}
                        onRevotePartial={handleRevote}
                    />
                )}

                {/* Users / Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {users.map((u) => {
                        const hasVoted = votes[u.id] !== undefined;
                        const voteVal = votes[u.id];
                        const isMe = u.id === socket?.id;

                        // Show card if:
                        // 1. Revealed
                        // 2. It's ME and I voted
                        // 3. User has voted (show back)

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

                        // Don't show card for Host unless they can vote (they can't)
                        if (u.role === 'HOST') return null;

                        return (
                            <div key={u.id} className="flex flex-col items-center group">
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
                                    <span className="font-bold text-white font-heading">{u.name}</span>
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${u.role === 'DEV' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        }`}>
                                        {u.role}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Message if waiting */}
                {showOverlay && myVote && (
                    <div className="text-center mt-12 animate-pulse">
                        <p className="text-xl text-banana-400 font-bold font-heading">Vote cast! Waiting for others...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Room;
