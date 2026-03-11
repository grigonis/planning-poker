import React from 'react';

const VotingOverlay = ({ onVote, currentVote, role, votingSystem }) => {
    // Default to Modified Fibonacci if votingSystem is missing
    const cards = votingSystem?.values || [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'];

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 min-h-screen overflow-y-auto font-sans bg-black/70 dark:bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">

            {/* Soft Central Glow */}
            <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-banana-500/10 dark:bg-banana-500/5 blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">

                {/* Modern Header */}
                <div className="mb-12 md:mb-16 text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 border border-white/20 mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 ">Active Estimation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-tight max-w-4xl mx-auto drop-shadow-2xl">
                        Point this Task
                    </h1>
                    <p className="mt-4 text-base md:text-xl text-white/60 font-medium tracking-wide">Select a card to reach team consensus</p>
                </div>

                {/* Floating Card Layout */}
                <div className="w-full flex justify-center animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 fill-mode-both overflow-x-hidden md:overflow-visible">
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 w-full max-w-5xl">
                        {cards.map((val) => {
                            const isSelected = currentVote === val;
                            const displayVal = val === 'COFFEE' ? '☕' : val;
                            const isLong = displayVal.toString().length > 3;

                            return (
                                <button
                                    key={val}
                                    onClick={() => onVote(val)}
                                    className={`group relative transition-all duration-500 transform w-[28vw] xs:w-28 sm:w-32 md:w-36 lg:w-40 aspect-[2/3]
                                        ${isSelected
                                            ? 'scale-110 md:scale-125 z-20 translate-y-[-10px]'
                                            : 'hover:-translate-y-6 hover:scale-105 z-10 opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    {/* Glass Card UI */}
                                    <div className={`w-full h-full rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden
                                        ${isSelected 
                                            ? 'bg-gradient-to-br from-banana-400 to-banana-600 border-white text-dark-900 shadow-[0_0_50px_rgba(250,204,21,0.4)]' 
                                            : 'bg-white/5 backdrop-blur-2xl border-white/10 text-white group-hover:bg-white/10 group-hover:border-white/30'}`}>
                                        
                                        {/* Corner Accents */}
                                        <div className={`absolute top-3 left-3 font-bold text-xs opacity-40 ${isSelected ? 'text-dark-900/50' : 'text-white/30'}`}>
                                            {displayVal}
                                        </div>
                                        <div className={`absolute bottom-3 right-3 font-bold text-xs opacity-40 rotate-180 ${isSelected ? 'text-dark-900/50' : 'text-white/30'}`}>
                                            {displayVal}
                                        </div>

                                        {/* Card Value */}
                                        <div className="relative flex items-center justify-center w-full h-full p-4">
                                            <span className={`font-black tracking-tighter leading-none transition-all duration-500
                                                ${isLong ? 'text-xl sm:text-2xl md:text-3xl' : 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl'}`}>
                                                {displayVal}
                                            </span>
                                        </div>

                                        {/* Subtle Highlight Reflection */}
                                        <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                                    </div>

                                    {/* Selection Glow Indicator */}
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 flex w-8 h-8 md:w-12 md:h-12 items-center justify-center rounded-full bg-white text-dark-900 shadow-2xl border-[3px] border-dark-900 z-30 animate-in zoom-in duration-500 spin-in-90 fill-mode-both">
                                            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VotingOverlay;
