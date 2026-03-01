import React from 'react';
import PlayerAvatar from './PlayerAvatar';
import Card from '../Voting/Card';
import { Crown, Eye, RotateCcw, Play } from 'lucide-react';

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
    if (phase === 'PARTIAL_VOTE_DEV' && user.role !== 'DEV') isParticipating = false;
    if (phase === 'PARTIAL_VOTE_QA' && user.role !== 'QA') isParticipating = false;

    if (!isParticipating && phase !== 'IDLE') {
        return <div className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px]" />;
    }

    // 3. Voting Started
    if (isVotingPhase) {
        if (hasVoted) {
            // Player has voted: Face-down player card
            return (
                <img src={playerFaceDownSVG} alt="Voted" className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg animate-in zoom-in duration-300 drop-shadow-[0_0_15px_rgba(255,184,0,0.3)]" />
            );
        } else {
            // Player is deciding: Card dashed placeholder
            return (
                <div className="w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg border-2 border-dashed border-orange-500/40 dark:border-white/20 flex flex-col items-center justify-center bg-orange-500/5 dark:bg-white/5 opacity-80 shadow-inner">
                    <div className="flex space-x-1">
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-orange-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-orange-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-orange-400 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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

const PlayerSlot = ({ user, votes, myVote, phase, currentUserId, roomMode, style = {}, avatarSize = 48, activeReaction, x = 50, y = 50 }) => {
    // Determine dynamic layout direction based on coordinates to point cards towards center of table
    // Extreme left/right edges (x <= 15 or x >= 85) are considered "side" seats
    const isSide = x <= 15 || x >= 85;

    let flexClass = 'flex-col';
    if (isSide) {
        flexClass = x < 50 ? 'flex-row' : 'flex-row-reverse';
    } else {
        flexClass = y < 50 ? 'flex-col' : 'flex-col-reverse';
    }

    return (
        <div
            className={`absolute flex items-center gap-2 sm:gap-3 transition-all duration-700 animate-in zoom-in-90 fade-in ${flexClass}`}
            style={{
                ...style,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
            }}
        >
            <PlayerAvatar user={user} roomMode={roomMode} size={avatarSize} isCurrentUser={currentUserId === user.id} activeReaction={activeReaction} />
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
    activeReactions = {},
    isHost,
    funFeatures,
    autoReveal,
    onStartVote,
    onReveal,
    onReset,
    onRevotePartial
}) => {
    // All users sit at the table dynamically (including observers, per Figma logic "Seat logic separated from Voting logic")
    const allTableUsers = users;

    const isSmallTable = allTableUsers.length <= 6;
    const avatarSize = isSmallTable ? 56 : 48;

    const isVotingPhase = phase === 'VOTING' || phase.startsWith('PARTIAL');
    let eligibleVotersCount = 0;
    let currentVotesCount = 0;

    if (isVotingPhase) {
        users.forEach(u => {
            if (u.role === 'SPECTATOR') return;
            let isParticipating = true;
            if (phase === 'PARTIAL_VOTE_DEV' && u.role !== 'DEV') isParticipating = false;
            if (phase === 'PARTIAL_VOTE_QA' && u.role !== 'QA') isParticipating = false;

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
                    <div className="absolute bg-orange-500/10 dark:bg-[rgba(255,210,77,0.05)] blur-[30px] rounded-[9999px] w-[80%] h-[70%] pointer-events-none transition-all duration-700" />
                    {/* Inner Edge Border Glow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,184,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] rounded-[inherit] pointer-events-none" />

                    {/* Phase-aware center content */}
                    {phase === 'IDLE' && (
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <span className="text-orange-500 dark:text-banana-500 text-[10px] md:text-xs font-bold  tracking-[0.2em] uppercase opacity-70">
                                Planning Poker
                            </span>
                            <p className="text-gray-400 dark:text-white/40 text-sm md:text-base ">
                                Waiting for host to start voting...
                            </p>
                            {isHost && (
                                <div className="flex flex-col items-center gap-4 mt-2">
                                    <button
                                        onClick={onStartVote}
                                        className="bg-orange-500 dark:bg-banana-500 hover:bg-orange-600 dark:hover:bg-banana-400 text-white dark:text-dark-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold  flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(255,92,0,0.25)] dark:shadow-[0_0_30px_rgba(238,173,43,0.3)] active:scale-95"
                                    >
                                        <Play size={18} />
                                        Start Voting Round
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {isVotingPhase && (
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <span className="text-orange-500 dark:text-banana-500 text-[10px] md:text-xs font-bold  tracking-[0.2em] uppercase opacity-70">
                                Current Estimation
                            </span>
                            <p className="text-lg md:text-2xl font-extrabold text-gray-900 dark:text-white  animate-pulse mb-0 md:mb-1">
                                Voting in progress...
                            </p>

                            {/* Dynamic Progress Bar inline */}
                            {eligibleVotersCount > 0 && (
                                <div className="flex items-center justify-center gap-3 w-[200px] sm:w-[240px] md:w-[280px] mt-1 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex-1 h-2 bg-gray-200/50 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200/50 dark:border-white/5 shadow-inner backdrop-blur-sm relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 via-banana-400 to-orange-500 dark:from-banana-500 dark:via-orange-400 dark:to-banana-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,184,0,0.6)] dark:shadow-[0_0_12px_rgba(255,184,0,0.6)] relative"
                                            style={{ width: `${voteProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                                            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
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

                    {
                        phase === 'REVEALED' && (() => {
                            const isStandard = averages.total !== undefined;
                            return (
                                <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                                    <span className="text-orange-500 dark:text-banana-500 text-[10px] font-bold  tracking-[0.2em] uppercase opacity-70">
                                        Voting Results
                                    </span>

                                    {isStandard ? (
                                        <div className="glass-gold rounded-xl px-4 py-2 text-center w-full">
                                            <p className="text-[10px] font-bold  text-orange-500 dark:text-banana-500/70 uppercase tracking-widest mb-0.5">Team Average</p>
                                            <div className="text-3xl md:text-4xl font-extrabold text-orange-500 dark:text-banana-400 leading-none">{averages.total || '—'}</div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 w-full">
                                            <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-indigo-500/20">
                                                <p className="text-[9px] font-bold  text-indigo-400/70 uppercase tracking-widest mb-0.5">Dev</p>
                                                <div className="text-2xl font-extrabold text-indigo-400 leading-none">{averages.dev || '—'}</div>
                                            </div>
                                            <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-rose-500/20">
                                                <p className="text-[9px] font-bold  text-rose-400/70 uppercase tracking-widest mb-0.5">QA</p>
                                                <div className="text-2xl font-extrabold text-rose-400 leading-none">{averages.qa || '—'}</div>
                                            </div>
                                        </div>
                                    )}

                                    {isHost && (
                                        <div className="flex flex-col items-center gap-2 w-full pt-1">
                                            <button
                                                onClick={onReset}
                                                className="glass hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-slate-200 px-5 py-2.5 rounded-lg font-bold  flex items-center gap-2 transition-all active:scale-95 w-full justify-center text-sm"
                                            >
                                                <RotateCcw size={15} />
                                                New Round
                                            </button>
                                            {!isStandard && (
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => onRevotePartial('DEV')}
                                                        className="flex-1 px-3 py-2 rounded-lg font-bold  border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors text-xs"
                                                    >
                                                        Re-vote DEV
                                                    </button>
                                                    <button
                                                        onClick={() => onRevotePartial('QA')}
                                                        className="flex-1 px-3 py-2 rounded-lg font-bold  border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors text-xs"
                                                    >
                                                        Re-vote QA
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    }
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
                            />
                        );
                    });
                })()}

            </div> {/* Close Geometry Container */}
        </div>
    );
};

export default PokerTable;
