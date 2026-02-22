import React from 'react';
import PlayerAvatar from './PlayerAvatar';
import Card from '../Voting/Card';
import { Crown, Eye, RotateCcw, Play } from 'lucide-react';

/**
 * Distributes players into positional slots around an oval table.
 * Layout: top row, bottom row, left side, right side.
 * Supports responsive scaling beyond 12 players.
 */
const distributeSlots = (players) => {
    const n = players.length;
    if (n === 0) return { top: [], bottom: [], left: [], right: [] };
    if (n === 1) return { top: [players[0]], bottom: [], left: [], right: [] };
    if (n === 2) return { top: [players[0]], bottom: [players[1]], left: [], right: [] };
    if (n === 3) return { top: [players[0], players[1]], bottom: [players[2]], left: [], right: [] };
    if (n === 4) return { top: [players[0], players[1]], bottom: [players[2], players[3]], left: [], right: [] };
    if (n <= 6) {
        const topCount = Math.ceil((n - 2) / 2) + 1;
        const botCount = n - topCount;
        return { top: players.slice(0, topCount), bottom: players.slice(topCount, topCount + botCount), left: [], right: [] };
    }
    if (n <= 8) {
        return {
            top: players.slice(0, 3),
            bottom: players.slice(3, 6),
            left: [players[6]],
            right: players[7] ? [players[7]] : [],
        };
    }
    if (n <= 12) {
        return {
            top: players.slice(0, 4),
            bottom: players.slice(4, 8),
            left: players.slice(8, 10),
            right: players.slice(10, 12),
        };
    }
    // > 12: Scale top/bottom evenly, overflow sides
    const sideCount = Math.min(Math.floor((n - 8) / 2), 4);
    const mainCount = n - sideCount * 2;
    const topCount = Math.ceil(mainCount / 2);
    const botCount = mainCount - topCount;
    return {
        top: players.slice(0, topCount),
        bottom: players.slice(topCount, topCount + botCount),
        left: players.slice(topCount + botCount, topCount + botCount + sideCount),
        right: players.slice(topCount + botCount + sideCount),
    };
};

const VoteChip = ({ user, votes, myVote, phase, currentUserId }) => {
    const isMe = user.id === currentUserId;
    const hasVoted = votes[user.id] !== undefined;
    const voteVal = votes[user.id];

    if (phase === 'REVEALED' && voteVal !== undefined) {
        return (
            <div className="w-9 h-13 rounded-lg glass-gold flex items-center justify-center shadow-lg text-sm font-bold text-banana-400">
                {voteVal === 'COFFEE' ? '☕' : (voteVal === 'questionMark' ? '?' : voteVal)}
            </div>
        );
    }

    if (isMe && myVote) {
        return (
            <div className="w-9 h-13 rounded-lg glass-gold flex items-center justify-center shadow-lg text-sm font-bold text-banana-400">
                {myVote === 'COFFEE' ? '☕' : (myVote === 'questionMark' ? '?' : myVote)}
            </div>
        );
    }

    const isVotingPhase = phase === 'VOTING' || phase.startsWith('PARTIAL');
    let isParticipating = true;
    if (phase === 'PARTIAL_VOTE_DEV' && user.role !== 'DEV') isParticipating = false;
    if (phase === 'PARTIAL_VOTE_QA' && user.role !== 'QA') isParticipating = false;

    if (isVotingPhase && isParticipating) {
        if (hasVoted) {
            return (
                <div className="w-9 h-13 rounded-lg glass border border-green-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-green-500/10 animate-in zoom-in duration-300">
                    <svg className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        } else {
            return (
                <div className="w-9 h-13 rounded-lg glass border border-white/10 flex items-center justify-center bg-white/5 shadow-inner">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            );
        }
    }

    if (hasVoted) {
        return (
            <div className="w-9 h-13 rounded-lg glass-gold flex items-center justify-center shadow-[0_0_15px_rgba(238,173,43,0.2)]">
                <svg className="w-4 h-4 text-banana-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        );
    }

    return (
        <div className="w-9 h-13 rounded-lg glass border-dashed border-white/20 flex items-center justify-center opacity-40 transition-all duration-300">
        </div>
    );
};

const PlayerSlot = ({ user, votes, myVote, phase, currentUserId, roomMode, direction = 'vertical', avatarSize = 48, activeReaction }) => {
    const isVerticalTop = direction === 'vertical-top';
    const isVerticalBottom = direction === 'vertical-bottom';
    const isHorizontal = direction === 'horizontal-left' || direction === 'horizontal-right';

    if (isHorizontal) {
        const isLeft = direction === 'horizontal-left';
        return (
            <div className={`flex items-center gap-3 transition-all duration-500 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                <PlayerAvatar user={user} roomMode={roomMode} size={avatarSize} isCurrentUser={currentUserId === user.id} activeReaction={activeReaction} />
                <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
            </div>
        );
    }

    // Vertical - top: avatar above, card below. Bottom: card above, avatar below.
    return (
        <div className="flex flex-col items-center gap-2 transition-all duration-500 animate-in zoom-in-90 fade-in duration-300">
            {isVerticalTop && (
                <>
                    <PlayerAvatar user={user} roomMode={roomMode} size={avatarSize} isCurrentUser={currentUserId === user.id} activeReaction={activeReaction} />
                    <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
                </>
            )}
            {isVerticalBottom && (
                <>
                    <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
                    <PlayerAvatar user={user} roomMode={roomMode} size={avatarSize} isCurrentUser={currentUserId === user.id} activeReaction={activeReaction} />
                </>
            )}
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
    const activePlayers = users.filter(u => u.role !== 'OBSERVER');
    const { top, bottom, left, right } = distributeSlots(activePlayers);
    const isSmallTable = activePlayers.length <= 5;
    const avatarSize = isSmallTable ? 56 : 48;

    const isVotingPhase = phase === 'VOTING' || phase.startsWith('PARTIAL');
    let eligibleVotersCount = 0;
    let currentVotesCount = 0;

    if (isVotingPhase) {
        activePlayers.forEach(u => {
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
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-16 md:py-20 transition-all duration-700">

            {/* Dynamic Progress Bar */}
            {isVotingPhase && eligibleVotersCount > 0 && (
                <div className="absolute top-0 md:-top-4 left-1/2 -translate-x-1/2 w-64 md:w-80 animate-in fade-in slide-in-from-top-4 duration-500 z-30">
                    <div className="flex justify-between items-end mb-1.5 px-1">
                        <span className="text-[10px] font-bold font-heading uppercase text-banana-500/80 tracking-widest">Estimating</span>
                        <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/5">{currentVotesCount} / {eligibleVotersCount} Voted</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                            className="h-full bg-banana-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(238,173,43,0.5)]"
                            style={{ width: `${voteProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Top Row */}
            <div className="absolute -top-2 md:top-0 left-0 right-0 flex justify-center gap-6 md:gap-10 z-20 transition-all duration-500">
                {top.map(u => (
                    <PlayerSlot
                        key={u.id}
                        user={u}
                        votes={votes}
                        myVote={myVote}
                        phase={phase}
                        currentUserId={currentUser.id}
                        roomMode={roomMode}
                        direction="vertical-top"
                        avatarSize={avatarSize}
                        activeReaction={activeReactions[u.id]}
                    />
                ))}
            </div>

            {/* Left Side */}
            {left.length > 0 && (
                <div className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20 transition-all duration-500">
                    {left.map(u => (
                        <PlayerSlot
                            key={u.id}
                            user={u}
                            votes={votes}
                            myVote={myVote}
                            phase={phase}
                            currentUserId={currentUser.id}
                            roomMode={roomMode}
                            direction="horizontal-left"
                            avatarSize={avatarSize}
                            activeReaction={activeReactions[u.id]}
                        />
                    ))}
                </div>
            )}

            {/* Right Side */}
            {right.length > 0 && (
                <div className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20 transition-all duration-500">
                    {right.map(u => (
                        <PlayerSlot
                            key={u.id}
                            user={u}
                            votes={votes}
                            myVote={myVote}
                            phase={phase}
                            currentUserId={currentUser.id}
                            roomMode={roomMode}
                            direction="horizontal-right"
                            avatarSize={avatarSize}
                            activeReaction={activeReactions[u.id]}
                        />
                    ))}
                </div>
            )}

            {/* Table Surface */}
            <div className={`glass rounded-[60px] md:rounded-[100px] w-full transition-all duration-700 ease-out flex flex-col items-center justify-center text-center p-6 md:p-12 relative overflow-hidden shadow-2xl ${isSmallTable ? 'aspect-[18/9] max-w-3xl' : 'aspect-[21/9]'}`}>
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[100px]" />

                {/* Phase-aware center content */}
                {phase === 'IDLE' && (
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <span className="text-banana-500 text-[10px] md:text-xs font-bold font-heading tracking-[0.2em] uppercase opacity-70">
                            Planning Poker
                        </span>
                        <p className="text-white/40 text-sm md:text-base font-heading">
                            Waiting for host to start voting...
                        </p>
                        {isHost && (
                            <div className="flex flex-col items-center gap-4 mt-2">
                                <button
                                    onClick={onStartVote}
                                    className="bg-banana-500 hover:bg-banana-400 text-dark-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold font-heading flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(238,173,43,0.3)] active:scale-95"
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
                        <span className="text-banana-500 text-[10px] md:text-xs font-bold font-heading tracking-[0.2em] uppercase opacity-70">
                            Current Estimation
                        </span>
                        <p className="text-lg md:text-2xl font-extrabold text-white font-heading animate-pulse">
                            Voting in progress...
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-banana-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-banana-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-banana-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="ml-1 text-[11px] uppercase tracking-wider font-bold">Waiting for votes</span>
                        </div>
                        {isHost && (
                            <button
                                onClick={onReveal}
                                className="mt-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-lg font-bold font-heading flex items-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider"
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
                                <span className="text-banana-500 text-[10px] font-bold font-heading tracking-[0.2em] uppercase opacity-70">
                                    Voting Results
                                </span>

                                {isStandard ? (
                                    <div className="glass-gold rounded-xl px-4 py-2 text-center w-full">
                                        <p className="text-[10px] font-bold font-heading text-banana-500/70 uppercase tracking-widest mb-0.5">Team Average</p>
                                        <div className="text-3xl md:text-4xl font-extrabold text-banana-400 leading-none">{averages.total || '—'}</div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-indigo-500/20">
                                            <p className="text-[9px] font-bold font-heading text-indigo-400/70 uppercase tracking-widest mb-0.5">Dev</p>
                                            <div className="text-2xl font-extrabold text-indigo-400 leading-none">{averages.dev || '—'}</div>
                                        </div>
                                        <div className="glass rounded-xl px-3 py-2 text-center flex-1 border border-rose-500/20">
                                            <p className="text-[9px] font-bold font-heading text-rose-400/70 uppercase tracking-widest mb-0.5">QA</p>
                                            <div className="text-2xl font-extrabold text-rose-400 leading-none">{averages.qa || '—'}</div>
                                        </div>
                                    </div>
                                )}

                                {isHost && (
                                    <div className="flex flex-col items-center gap-2 w-full pt-1">
                                        <button
                                            onClick={onReset}
                                            className="glass hover:bg-white/5 text-slate-200 px-5 py-2.5 rounded-lg font-bold font-heading flex items-center gap-2 transition-all active:scale-95 w-full justify-center text-sm"
                                        >
                                            <RotateCcw size={15} />
                                            New Round
                                        </button>
                                        {!isStandard && (
                                            <div className="flex gap-2 w-full">
                                                <button
                                                    onClick={() => onRevotePartial('DEV')}
                                                    className="flex-1 px-3 py-2 rounded-lg font-bold font-heading border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors text-xs"
                                                >
                                                    Re-vote DEV
                                                </button>
                                                <button
                                                    onClick={() => onRevotePartial('QA')}
                                                    className="flex-1 px-3 py-2 rounded-lg font-bold font-heading border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors text-xs"
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
            </div >

            {/* Bottom Row */}
            <div className="absolute -bottom-2 md:bottom-0 left-0 right-0 flex justify-center gap-6 md:gap-10 z-20 transition-all duration-500">
                {
                    bottom.map(u => (
                        <PlayerSlot
                            key={u.id}
                            user={u}
                            votes={votes}
                            myVote={myVote}
                            phase={phase}
                            currentUserId={currentUser.id}
                            roomMode={roomMode}
                            direction="vertical-bottom"
                            avatarSize={avatarSize}
                            activeReaction={activeReactions[u.id]}
                        />
                    ))
                }
            </div>
        </div >
    );
};

export default PokerTable;
