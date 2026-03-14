import React, { useState, useEffect, useRef } from 'react';
import PlayerAvatar from './PlayerAvatar';
import Card from '../Voting/Card';
import { Eye, RotateCcw, Play, ArrowRight, RefreshCw } from 'lucide-react';
import { Progress } from '../ui/progress';

import playerFaceDownSVG from '../../assets/TBD_face_down_player.svg';

const SIDE_ASSIGNMENTS = ['TOP', 'BOT', 'LEFT', 'RIGHT', 'BOT', 'TOP', 'BOT', 'TOP', 'LEFT', 'RIGHT', 'BOT', 'TOP', 'LEFT', 'RIGHT', 'BOT', 'TOP'];

const VoteChip = ({ user, votes, myVote, phase, currentUserId }) => {
    // 1. Spectators do not show any card slot
    if (user.role === 'SPECTATOR') {
        return null;
    }

    const isMe = user.id === currentUserId;
    const hasVoted = votes[user.id] !== undefined;
    const voteVal = votes[user.id] !== undefined ? votes[user.id] : (isMe ? myVote : undefined);

    // 2. Voting Finished: Show actual face-up card
    if (phase === 'REVEALED' && voteVal !== undefined) {
        return <Card value={voteVal} className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] text-xs md:text-sm" />;
    }

    const isVotingPhase = phase === 'VOTING' || phase.startsWith('PARTIAL');
    let isParticipating = true;

    if (!isParticipating && phase !== 'IDLE') {
        return <div className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px]" />;
    }

    // 3. Voting Started
    if (isVotingPhase) {
        if (hasVoted) {
            // Player has voted: Face-down player card
            return (
                <img src={playerFaceDownSVG} alt="Voted" className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg animate-in zoom-in duration-300 drop-shadow-primary/30" />
            );
        } else {
            // Player is deciding: Card dashed placeholder
            return (
                <div className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg border-2 border-dashed border-primary/40 dark:border-white/20 flex flex-col items-center justify-center bg-primary/5 dark:bg-white/5 opacity-80 shadow-inner">
                    <div className="flex space-x-1">
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/80 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/80 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary/80 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            );
        }
    }

    // 4. Voting Not Started (IDLE): Empty card dashed placeholder
    return (
        <div className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg border-2 border-dashed border-gray-400/30 dark:border-white/10 flex items-center justify-center opacity-50 bg-gray-500/5">
        </div>
    );
};



const PlayerSlot = ({ user, votes, myVote, phase, currentUserId, roomMode, style = {}, avatarSize = 48, activeReaction, x = 50, y = 50, anonymousMode = false, shuffleState = 'idle', isRevealed = true, groups = [], groupsEnabled = false }) => {
    // Determine dynamic layout direction based on coordinates to point cards towards center of table
    // Extreme left/right edges (x <= 15 or x >= 85) are considered "side" seats
    const isSide = x <= 15 || x >= 85;

    let flexClass = 'flex-col';
    if (isSide) {
        flexClass = x < 50 ? 'flex-row' : 'flex-row-reverse';
    } else {
        flexClass = y < 50 ? 'flex-col' : 'flex-col-reverse';
    }

    let visualClass = '';
    let transitionClass = '';
    let zIndex = 20;

    if (shuffleState === 'poof-out') {
        visualClass = 'opacity-0 scale-125 blur-sm';
        transitionClass = 'transition-all duration-[400ms] ease-in';
    } else if (shuffleState === 'hidden' || (shuffleState === 'poof-in' && !isRevealed)) {
        visualClass = 'opacity-0 scale-50 blur-none';
        transitionClass = 'transition-none';
    } else if (shuffleState === 'poof-in' && isRevealed) {
        visualClass = 'opacity-100 scale-100 blur-0';
        transitionClass = 'transition-all duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]';
        zIndex = 30; // Bring to front when appearing
    } else if (shuffleState === 'idle') {
        visualClass = 'opacity-100 scale-100 blur-0';
        transitionClass = 'transition-all duration-700 ease-in-out';
    }

    return (
        <div
            className={`absolute flex items-center gap-2 sm:gap-3 ${transitionClass} ${visualClass} ${flexClass}`}
            style={{
                ...style,
                transform: `translate(-50%, -50%)`,
                zIndex: zIndex
            }}
        >
            {shuffleState === 'poof-out' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 mix-blend-screen dark:mix-blend-color-dodge">
                    <span
                        className="text-5xl drop-shadow-[0_0_15px_rgba(200,200,200,0.8)] animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_forwards] opacity-80"
                        style={{ animationDelay: `${Math.random() * 0.1}s` }}
                    >💨</span>
                </div>
            )}
            <PlayerAvatar user={user} roomMode={roomMode} size={avatarSize} isCurrentUser={currentUserId === user.id} activeReaction={activeReaction} anonymousMode={anonymousMode} groups={groups} groupsEnabled={groupsEnabled} />
            <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
        </div>
    );
};

const PokerTable = ({
    users,
    currentUser,
    votes,
    myVote,
    phase,
    roomMode,
    averages = {},
    groupAverages = [],
    groupsEnabled = false,
    activeReactions = {},
    anonymousMode = false,
    isHost = false,
    votingSystem = { values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'] },
    tasks = [],
    activeTaskId = null,
    groups = [],
    onStartVote,
    onReveal,
    onReset,
    onRevote
}) => {
    // Seat shuffle for anonymous mode
    const [displayUsers, setDisplayUsers] = useState(users);
    const [shuffleState, setShuffleState] = useState('idle');
    const [revealedCount, setRevealedCount] = useState(0);
    const prevAnon = useRef(false);

    useEffect(() => {
        const turningOn = anonymousMode && !prevAnon.current;
        const turningOff = !anonymousMode && prevAnon.current;

        if (turningOn || turningOff) {
            prevAnon.current = anonymousMode;
            setShuffleState('poof-out');

            setTimeout(() => {
                setShuffleState('hidden');
                setDisplayUsers(turningOn
                    ? [...users].sort(() => Math.random() - 0.5)
                    : [...users]);
                setRevealedCount(0);

                setTimeout(() => {
                    setShuffleState('poof-in');
                }, 150);
            }, 400); // Wait for poof out
        }
    }, [anonymousMode, users]);

    useEffect(() => {
        if (shuffleState === 'poof-in') {
            if (revealedCount < displayUsers.length) {
                const timer = setTimeout(() => {
                    setRevealedCount(prev => prev + 1);
                }, 100); // Speed up appearance slightly
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    setShuffleState('idle');
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [shuffleState, revealedCount, displayUsers.length]);

    // Sync when users join/leave without reshuffling
    useEffect(() => {
        if (shuffleState !== 'idle') return; // Don't sync during animation
        if (!anonymousMode) {
            setDisplayUsers(users);
        } else {
            setDisplayUsers(prev => {
                const updated = prev
                    .filter(p => users.some(u => u.id === p.id))
                    .map(p => users.find(u => u.id === p.id));
                const newUsers = users.filter(u => !prev.some(p => p.id === u.id));
                return [...updated, ...newUsers];
            });
        }
    }, [users, anonymousMode, shuffleState]);

    const allTableUsers = displayUsers;

    const isSmallTable = allTableUsers.length <= 6;
    const avatarSize = isSmallTable ? 56 : 48;

    const isVotingPhase = phase === 'VOTING' || phase.startsWith('PARTIAL');
    let eligibleVotersCount = 0;
    let currentVotesCount = 0;

    if (isVotingPhase) {
        users.forEach(u => {
            if (u.role === 'SPECTATOR') return;
            let isParticipating = true;

            if (isParticipating) {
                eligibleVotersCount++;
                if (votes[u.id] !== undefined) {
                    currentVotesCount++;
                }
            }
        });
    }
    const voteProgress = eligibleVotersCount > 0 ? (currentVotesCount / eligibleVotersCount) * 100 : 0;

    return (
        <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-6 md:py-12 transition-all duration-700">



            {/* Elliptical Table Geometry Container */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[2.2/1] lg:aspect-[2.4/1] flex items-center justify-center mt-12 md:mt-16">

                {/* Table Surface (Realistic Glassmorphism per Figma) */}
                <div className="absolute inset-0 m-auto w-[60%] h-[55%] sm:w-[70%] sm:h-[60%] md:w-[75%] md:h-[65%] rounded-[60px] md:rounded-[120px] bg-white/10 dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center z-10 p-6 md:p-12 transition-all duration-700">
                    {/* Center Glow */}
                    <div className="absolute bg-primary/10 blur-[30px] rounded-[9999px] w-[80%] h-[70%] pointer-events-none transition-all duration-700" />
                    {/* Inner Edge Border Glow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] rounded-[inherit] pointer-events-none" />

                    {/* Phase-aware center content */}
                    {phase === 'IDLE' && (
                        <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-5 md:px-8 text-center">
                            <span className="text-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-70">
                                {activeTaskId ? 'Up Next' : 'Ready'}
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="text-base sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                    {activeTaskId ? (tasks.find(t => t.id === activeTaskId)?.title || 'Task Selection Error') : 'Waiting for round...'}
                                </h3>
                                {!activeTaskId && isHost && (
                                    <p className="text-gray-400 dark:text-white/40 text-sm italic">
                                        Select a task from the sidebar or just start
                                    </p>
                                )}
                            </div>
                            {isHost && (
                                <div className="flex flex-col items-center gap-4 mt-2">
                                    <button
                                        onClick={onStartVote}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all shadow-primary/20 active:scale-95"
                                    >
                                        <Play size={18} />
                                        {activeTaskId ? 'Start Voting Task' : 'Quick Start Round'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {isVotingPhase && (
                        <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-5 md:px-8 text-center">
                            <div className="flex items-center gap-3">
                                <span className="text-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-70">
                                    Currently Estimating
                                </span>
                            </div>

                            <p className="text-base sm:text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                {activeTaskId ? (tasks.find(t => t.id === activeTaskId)?.title || 'General Estimation') : 'General Pointing'}
                            </p>

                            {/* Dynamic Progress Bar inline */}
                            {eligibleVotersCount > 0 && (
                                <div className="flex items-center justify-center gap-3 w-full max-w-[240px] mt-1 animate-in fade-in zoom-in-95 duration-500">
                                    <Progress value={voteProgress} className="h-2" />
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-white bg-white/80 dark:bg-dark-800/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.1)] uppercase tracking-wider whitespace-nowrap">
                                        {currentVotesCount} / {eligibleVotersCount} Voted
                                    </span>
                                </div>
                            )}

                            {isHost && (
                                <button
                                    onClick={onReveal}
                                    className="mt-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 px-6 py-2 rounded-lg font-bold  flex items-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    <Eye size={14} />
                                    Force Reveal
                                </button>
                            )}
                        </div>
                    )}

                    {phase === 'REVEALED' && (
                        <div className="relative z-10 flex flex-col items-center gap-2 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex flex-col items-center gap-1 mb-2">
                                <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                                    Voting Results
                                </span>
                                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                                    {activeTaskId ? (tasks.find(t => t.id === activeTaskId)?.title || 'Task Result') : 'Session Result'}
                                </h3>
                            </div>

                            {/* Per-group breakdown */}
                            {groupsEnabled && groupAverages.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1.5 w-full">
                                    {groupAverages.map(ga => (
                                        <div
                                            key={ga.groupId}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold"
                                            style={{ borderColor: ga.color + '40', backgroundColor: ga.color + '15', color: ga.color }}
                                        >
                                            <span>{ga.name}:</span>
                                            <span className="text-sm font-extrabold">{ga.average ?? '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="glass-gold rounded-xl px-4 py-2 text-center w-full">
                                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-0.5">
                                    {groupsEnabled && groupAverages.length > 0 ? 'Combined' : 'Result'}
                                </p>
                                <div className="text-3xl md:text-4xl font-extrabold text-primary leading-none">{averages.total || '—'}</div>
                            </div>

                            {isHost && (
                                <div className="flex items-center gap-2 w-full pt-1">
                                    <button
                                        onClick={onRevote}
                                        className="glass hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all active:scale-95 flex-1 justify-center text-xs"
                                    >
                                        <RefreshCw size={13} />
                                        Revote
                                    </button>
                                    <button
                                        onClick={onReset}
                                        className="glass hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all active:scale-95 flex-1 justify-center text-xs"
                                    >
                                        <ArrowRight size={13} />
                                        Next Round
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dynamic Seats Loop */}
                {(() => {
                    const sides = { TOP: [], BOT: [], LEFT: [], RIGHT: [] };

                    allTableUsers.forEach((u, i) => {
                        const sideName = SIDE_ASSIGNMENTS[i % SIDE_ASSIGNMENTS.length];
                        sides[sideName].push(u);
                    });

                    const getPositionsForSide = (sideName, numPlayers) => {
                        const positions = [];
                        // We use up to 80% of the available width/height to distribute players
                        const spread = Math.min(60 + (numPlayers - 1) * 10, 85);
                        const spacing = spread / numPlayers;
                        const start = (100 - spread) / 2 + spacing / 2;

                        for (let i = 0; i < numPlayers; i++) {
                            const offset = start + (i * spacing);
                            if (sideName === 'TOP') positions.push({ x: offset, y: 5 });
                            else if (sideName === 'BOT') positions.push({ x: offset, y: 95 });
                            else if (sideName === 'LEFT') positions.push({ x: 5, y: offset });
                            else if (sideName === 'RIGHT') positions.push({ x: 95, y: offset });
                        }
                        return positions;
                    };

                    const sideToPositions = {
                        TOP: getPositionsForSide('TOP', sides.TOP.length),
                        BOT: getPositionsForSide('BOT', sides.BOT.length),
                        LEFT: getPositionsForSide('LEFT', sides.LEFT.length),
                        RIGHT: getPositionsForSide('RIGHT', sides.RIGHT.length)
                    };

                    const sideCounters = { TOP: 0, BOT: 0, LEFT: 0, RIGHT: 0 };

                    return allTableUsers.map((u, i) => {
                        const sideName = SIDE_ASSIGNMENTS[i % SIDE_ASSIGNMENTS.length];
                        const posIndex = sideCounters[sideName]++;
                        let { x, y } = sideToPositions[sideName][posIndex];

                        return (
                            <PlayerSlot
                                key={u.id}
                                user={u}
                                votes={votes}
                                myVote={myVote}
                                phase={phase}
                                currentUserId={currentUser.id}
                                roomMode={roomMode}
                                style={{ left: `${x}%`, top: `${y}%` }}
                                x={x}
                                y={y}
                                avatarSize={avatarSize}
                                activeReaction={activeReactions[u.id]}
                                anonymousMode={anonymousMode}
                                shuffleState={shuffleState}
                                isRevealed={i < revealedCount}
                                groups={groups}
                                groupsEnabled={groupsEnabled}
                            />
                        );
                    });
                })()}

            </div> {/* Close Geometry Container */}
        </div>
    );
};

export default PokerTable;
