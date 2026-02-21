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
                {voteVal === 'COFFEE' ? '☕' : voteVal}
            </div>
        );
    }

    if (isMe && myVote) {
        return (
            <div className="w-9 h-13 rounded-lg glass-gold flex items-center justify-center shadow-lg text-sm font-bold text-banana-400">
                {myVote === 'COFFEE' ? '☕' : myVote}
            </div>
        );
    }

    if (hasVoted) {
        return (
            <div className="w-9 h-13 rounded-lg glass-gold flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-banana-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        );
    }

    return (
        <div className="w-9 h-13 rounded-lg glass border-dashed border-white/20 flex items-center justify-center opacity-40">
        </div>
    );
};

const PlayerSlot = ({ user, votes, myVote, phase, currentUserId, roomMode, direction = 'vertical' }) => {
    const isVerticalTop = direction === 'vertical-top';
    const isVerticalBottom = direction === 'vertical-bottom';
    const isHorizontal = direction === 'horizontal-left' || direction === 'horizontal-right';

    if (isHorizontal) {
        const isLeft = direction === 'horizontal-left';
        return (
            <div className={`flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                <PlayerAvatar user={user} roomMode={roomMode} size={48} />
                <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
            </div>
        );
    }

    // Vertical - top: avatar above, card below. Bottom: card above, avatar below.
    return (
        <div className="flex flex-col items-center gap-2">
            {isVerticalTop && (
                <>
                    <PlayerAvatar user={user} roomMode={roomMode} size={48} />
                    <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
                </>
            )}
            {isVerticalBottom && (
                <>
                    <VoteChip user={user} votes={votes} myVote={myVote} phase={phase} currentUserId={currentUserId} />
                    <PlayerAvatar user={user} roomMode={roomMode} size={48} />
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
    isHost,
    onStartVote,
    onReveal,
    onReset,
    onRevotePartial,
}) => {
    const activePlayers = users.filter(u => u.role !== 'OBSERVER');
    const { top, bottom, left, right } = distributeSlots(activePlayers);

    return (
        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center py-16 md:py-20">
            {/* Top Row */}
            <div className="absolute -top-2 md:top-0 left-0 right-0 flex justify-center gap-6 md:gap-10 z-20">
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
                    />
                ))}
            </div>

            {/* Left Side */}
            {left.length > 0 && (
                <div className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
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
                        />
                    ))}
                </div>
            )}

            {/* Right Side */}
            {right.length > 0 && (
                <div className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
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
                        />
                    ))}
                </div>
            )}

            {/* Table Surface */}
            <div className="glass rounded-[60px] md:rounded-[100px] w-full aspect-[21/9] flex flex-col items-center justify-center text-center p-6 md:p-12 relative overflow-hidden shadow-2xl">
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
                            <button
                                onClick={onStartVote}
                                className="mt-2 bg-banana-500 hover:bg-banana-400 text-dark-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold font-heading flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(238,173,43,0.3)] active:scale-95"
                            >
                                <Play size={18} />
                                Start Voting Round
                            </button>
                        )}
                    </div>
                )}

                {(phase === 'VOTING' || phase.startsWith('PARTIAL')) && (
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <span className="text-banana-500 text-[10px] md:text-xs font-bold font-heading tracking-[0.2em] uppercase opacity-70">
                            Current Estimation
                        </span>
                        <p className="text-lg md:text-2xl font-extrabold text-white font-heading animate-pulse">
                            Voting in progress...
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{activePlayers.length} Participants</span>
                        </div>
                        {isHost && (
                            <button
                                onClick={onReveal}
                                className="mt-2 bg-banana-500 hover:bg-banana-400 text-dark-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold font-heading flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(238,173,43,0.3)] active:scale-95"
                            >
                                <Eye size={18} />
                                Reveal All Votes
                            </button>
                        )}
                    </div>
                )}

                {phase === 'REVEALED' && (() => {
                    const isStandard = averages.total !== undefined;
                    return (
                        <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                            <span className="text-banana-500 text-[10px] font-bold font-heading tracking-[0.2em] uppercase opacity-70">
                                Voting Results
                            </span>

                            {isStandard ? (
                                <div className="glass-gold rounded-xl px-6 py-3 text-center w-full">
                                    <p className="text-[10px] font-bold font-heading text-banana-500/70 uppercase tracking-widest mb-0.5">Team Average</p>
                                    <div className="text-4xl md:text-5xl font-extrabold text-banana-400 leading-none">{averages.total || '—'}</div>
                                    <p className="text-[9px] text-banana-300/50 mt-1 font-heading uppercase tracking-wider">Story Points</p>
                                </div>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <div className="glass rounded-xl px-4 py-3 text-center flex-1 border border-indigo-500/20">
                                        <p className="text-[9px] font-bold font-heading text-indigo-400/70 uppercase tracking-widest mb-0.5">Dev</p>
                                        <div className="text-3xl font-extrabold text-indigo-400 leading-none">{averages.dev || '—'}</div>
                                    </div>
                                    <div className="glass rounded-xl px-4 py-3 text-center flex-1 border border-rose-500/20">
                                        <p className="text-[9px] font-bold font-heading text-rose-400/70 uppercase tracking-widest mb-0.5">QA</p>
                                        <div className="text-3xl font-extrabold text-rose-400 leading-none">{averages.qa || '—'}</div>
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
                })()}
            </div>

            {/* Bottom Row */}
            <div className="absolute -bottom-2 md:bottom-0 left-0 right-0 flex justify-center gap-6 md:gap-10 z-20">
                {bottom.map(u => (
                    <PlayerSlot
                        key={u.id}
                        user={u}
                        votes={votes}
                        myVote={myVote}
                        phase={phase}
                        currentUserId={currentUser.id}
                        roomMode={roomMode}
                        direction="vertical-bottom"
                    />
                ))}
            </div>
        </div>
    );
};

export default PokerTable;
