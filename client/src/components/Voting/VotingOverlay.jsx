import React from 'react';
import Card from './Card';

const VALUES = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', 'COFFEE', '?'];

const VotingOverlay = ({ onVote, currentVote, role }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
                {role === 'DEV' ? 'Estimate Implementation Effort' : 'Estimate Testing Effort'}
            </h2>
            <p className="text-gray-400 mb-8">Select a card to cast your vote</p>

            <div className="grid grid-cols-4 md:grid-cols-7 gap-4 max-w-4xl">
                {VALUES.map((val) => (
                    <Card
                        key={val}
                        value={val}
                        selected={currentVote === val}
                        onClick={() => onVote(val)}
                        className="bg-white hover:bg-gray-50"
                    />
                ))}
            </div>
        </div>
    );
};

export default VotingOverlay;
