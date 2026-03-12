import React from 'react';
import { Target, Zap, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

// Ordered card scale — adjacency is based on index distance, not numeric distance
const CARD_SCALE = [0, 0.5, 1, 2, 3, 4, 5];

function computeGroupStats(groupUserVotes) {
    const numeric = groupUserVotes
        .map(({ user, vote }) => ({ user, num: parseFloat(vote) }))
        .filter(({ num }) => !isNaN(num));

    if (numeric.length === 0) return null;

    const nums = numeric.map(({ num }) => num);
    const highest = Math.max(...nums);
    const lowest = Math.min(...nums);

    const highestVoters = numeric.filter(({ num }) => num === highest).map(({ user }) => user);
    const lowestVoters = numeric.filter(({ num }) => num === lowest).map(({ user }) => user);

    const uniqueNums = [...new Set(nums)];
    const isExact = uniqueNums.length === 1;

    let isAdjacent = false;
    if (!isExact) {
        const indices = uniqueNums.map(n => CARD_SCALE.indexOf(n));
        if (indices.every(i => i !== -1)) {
            isAdjacent = Math.max(...indices) - Math.min(...indices) <= 1;
        }
    }

    const distribution = {};
    groupUserVotes.forEach(({ vote }) => {
        distribution[vote] = (distribution[vote] || 0) + 1;
    });

    return { result: highest, highest, lowest, highestVoters, lowestVoters, isExact, isAdjacent, distribution };
}

const VoteDistribution = ({ distribution }) => {
    const entries = Object.entries(distribution).sort((a, b) => {
        const na = parseFloat(a[0]), nb = parseFloat(b[0]);
        if (isNaN(na) && isNaN(nb)) return 0;
        if (isNaN(na)) return 1;
        if (isNaN(nb)) return -1;
        return na - nb;
    });

    return (
        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
            {entries.map(([value, count]) => (
                <div key={value} className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] rounded-lg border border-white/[0.07] text-xs font-bold text-gray-400">
                    <span className="text-white">{count}×</span>
                    <span>{value}</span>
                </div>
            ))}
        </div>
    );
};

const ConsensusBadge = ({ stats }) => {
    if (!stats) return null;
    if (stats.isExact) return (
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-bold uppercase tracking-wider">
            <Target size={10} />
            Consensus Reached
        </div>
    );
    if (stats.isAdjacent) return (
        <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-wider">
            <Zap size={10} />
            Near Consensus
        </div>
    );
    return null;
};

const GroupBlock = ({ stats, label, accentClass, borderClass, bgClass, labelClass }) => {
    const showOutliers = stats && !stats.isExact && stats.highest !== stats.lowest;

    return (
        <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${borderClass} ${bgClass} flex-1 min-w-[180px]`}>
            {label && (
                <p className={`text-[10px] font-bold uppercase tracking-widest ${labelClass}`}>{label}</p>
            )}

            {stats ? (
                <>
                    <ConsensusBadge stats={stats} />

                    <div className="text-center">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Result</p>
                        <div className={`text-5xl font-extrabold ${accentClass} leading-none`}>{stats.result}</div>
                    </div>

                    {showOutliers && (
                        <div className="w-full space-y-1.5 text-xs">
                            <div className="flex items-center gap-2 text-gray-400">
                                <TrendingUp size={12} className="text-green-400 shrink-0" />
                                <span className="text-gray-500 shrink-0">High:</span>
                                <span className="text-green-300 font-medium truncate">
                                    {stats.highestVoters.map(u => u.name).join(', ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <TrendingDown size={12} className="text-rose-400 shrink-0" />
                                <span className="text-gray-500 shrink-0">Low:</span>
                                <span className="text-rose-300 font-medium truncate">
                                    {stats.lowestVoters.map(u => u.name).join(', ')}
                                </span>
                            </div>
                        </div>
                    )}

                    <VoteDistribution distribution={stats.distribution} />
                </>
            ) : (
                <div className="text-center py-2">
                    <div className="text-3xl font-bold text-gray-600">—</div>
                    <p className="text-xs text-gray-600 mt-1">No votes</p>
                </div>
            )}
        </div>
    );
};

const ResultsBoard = ({ votes, users, onReset, onRevotePartial, isHost, roomMode }) => {
    const isStandard = roomMode !== 'SPLIT';

    const getGroupVotes = (roles) =>
        users
            .filter(u => roles.includes(u.role))
            .map(u => ({ user: u, vote: votes[u.id] }))
            .filter(({ vote }) => vote && vote !== 'VOTED');

    const standardStats = isStandard ? computeGroupStats(getGroupVotes(['DEV', 'HOST'])) : null;
    const devStats = !isStandard ? computeGroupStats(getGroupVotes(['DEV', 'HOST'])) : null;
    const qaStats = !isStandard ? computeGroupStats(getGroupVotes(['QA'])) : null;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 pb-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-[#101010] border border-gray-200 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Voting Results</span>
                </div>

                {/* Stats body */}
                <div className="p-5">
                    {isStandard ? (
                        <GroupBlock
                            stats={standardStats}
                            accentClass="text-primary"
                            borderClass="border-primary/20"
                            bgClass="bg-primary/[0.06]"
                            labelClass=""
                        />
                    ) : (
                        <div className="flex gap-3 flex-wrap">
                            <GroupBlock
                                stats={devStats}
                                label="Developers"
                                accentClass="text-indigo-400"
                                borderClass="border-indigo-500/20"
                                bgClass="bg-indigo-500/[0.06]"
                                labelClass="text-indigo-400/70"
                            />
                            <GroupBlock
                                stats={qaStats}
                                label="QA"
                                accentClass="text-rose-400"
                                borderClass="border-rose-500/20"
                                bgClass="bg-rose-500/[0.06]"
                                labelClass="text-rose-400/70"
                            />
                        </div>
                    )}
                </div>

                {/* Host controls */}
                {isHost && (
                    <div className="px-5 pb-5 flex flex-col gap-2 border-t border-gray-100 dark:border-white/5 pt-4">
                        <button
                            onClick={onReset}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm transition-colors border border-gray-200 dark:border-white/[0.07]"
                        >
                            <RotateCcw size={15} />
                            New Round
                        </button>
                        {!isStandard && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onRevotePartial('DEV')}
                                    className="flex-1 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/20 transition-colors"
                                >
                                    Re-vote DEV
                                </button>
                                <button
                                    onClick={() => onRevotePartial('QA')}
                                    className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/20 transition-colors"
                                >
                                    Re-vote QA
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsBoard;
