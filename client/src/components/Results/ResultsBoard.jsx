import React from 'react';

const ResultsBoard = ({ averages, votes, users, onReset, onRevotePartial, isHost }) => {
    return (
        <div className="bg-dark-800 border border-white/5 p-6 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto mt-8 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold font-heading text-center mb-8 text-white">Voting Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Helper to calculate distribution or just show avg */}

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

            {isHost && (
                <div className="flex flex-col md:flex-row gap-4 justify-center border-t border-white/5 pt-6">
                    <button
                        onClick={onReset}
                        className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 font-bold font-heading transition-colors border border-white/5"
                    >
                        Start New Round (Reset All)
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onRevotePartial('DEV')}
                            className="px-6 py-3 bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/30 font-bold font-heading border border-indigo-500/30 transition-colors"
                        >
                            Re-vote Developers
                        </button>
                        <button
                            onClick={() => onRevotePartial('QA')}
                            className="px-6 py-3 bg-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-500/30 font-bold font-heading border border-rose-500/30 transition-colors"
                        >
                            Re-vote QA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsBoard;
