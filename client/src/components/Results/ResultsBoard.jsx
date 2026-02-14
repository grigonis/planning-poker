import React from 'react';

const ResultsBoard = ({ averages, votes, users, onReset, onRevotePartial, isHost }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto mt-8 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Voting Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Helper to calculate distribution or just show avg */}

                <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Implementation Effort</h3>
                    <div className="text-5xl font-bold text-blue-600">{averages.dev || '-'}</div>
                    <p className="text-sm text-blue-400 mt-2">Developers Average</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Testing Effort</h3>
                    <div className="text-5xl font-bold text-green-600">{averages.qa || '-'}</div>
                    <p className="text-sm text-green-400 mt-2">QA Average</p>
                </div>
            </div>

            {isHost && (
                <div className="flex flex-col md:flex-row gap-4 justify-center border-t pt-6">
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 font-medium"
                    >
                        Start New Round (Reset All)
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onRevotePartial('DEV')}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                        >
                            Re-vote Developers
                        </button>
                        <button
                            onClick={() => onRevotePartial('QA')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
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
