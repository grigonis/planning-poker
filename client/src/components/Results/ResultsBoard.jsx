import React from 'react';

const ResultsBoard = ({ averages, votes, users, onReset, onRevotePartial, isHost }) => {
    // Determine mode based on keys in averages
    const isStandard = averages.total !== undefined;

    return (
        <div className="bg-dark-800 border border-white/5 p-6 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto mt-8 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold font-heading text-center mb-8 text-white">Voting Results</h2>

            {isStandard ? (
                // STANDARD MODE DISPLAY
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="bg-banana-500/10 p-8 rounded-2xl text-center border border-banana-500/20 w-64">
                        <h3 className="text-xl font-bold font-heading text-banana-500 mb-2">Team Average</h3>
                        <div className="text-6xl font-bold text-banana-400">{averages.total || '-'}</div>
                        <p className="text-sm text-banana-300/60 mt-2 font-heading uppercase tracking-wider">Story Points</p>
                    </div>
                </div>
            ) : (
                // SPLIT MODE DISPLAY
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-indigo-500/10 p-6 rounded-xl text-center border border-indigo-500/20">
                        <h3 className="text-lg font-bold font-heading text-indigo-300 mb-2">Implementation Effort</h3>
                        <div className="text-5xl font-bold text-indigo-400">{averages.dev || '-'}</div>
                        <p className="text-sm text-indigo-300/60 mt-2 font-heading uppercase tracking-wider">Developers Average</p>
                    </div>

                    <div className="bg-rose-500/10 p-6 rounded-xl text-center border border-rose-500/20">
                        <h3 className="text-lg font-bold font-heading text-rose-300 mb-2">Testing Effort</h3>
                        <div className="text-5xl font-bold text-rose-400">{averages.qa || '-'}</div>
                        <p className="text-sm text-rose-300/60 mt-2 font-heading uppercase tracking-wider">QA Average</p>
                    </div>
                </div>
            )}

            {isHost && (
                <div className="flex flex-col items-center gap-6 border-t border-white/5 pt-6">
                    <button
                        onClick={onReset}
                        className="px-8 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 font-bold font-heading transition-colors border border-white/5 w-full md:w-auto"
                    >
                        Start New Round (Reset All)
                    </button>

                    {!isStandard && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => onRevotePartial('DEV')}
                                className="px-5 py-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/30 font-bold font-heading border border-indigo-500/30 transition-colors text-sm"
                            >
                                Re-vote Developers
                            </button>
                            <button
                                onClick={() => onRevotePartial('QA')}
                                className="px-5 py-2.5 bg-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-500/30 font-bold font-heading border border-rose-500/30 transition-colors text-sm"
                            >
                                Re-vote QA
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResultsBoard;
