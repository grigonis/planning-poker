import React from 'react';
import card1 from '../../assets/card1.svg';
import card2 from '../../assets/card2.svg';
import card3 from '../../assets/card3.svg';
import card4 from '../../assets/card4.svg';
import card5 from '../../assets/card5.svg';
import card6 from '../../assets/card6.svg';
import card7 from '../../assets/card7.svg';
import card8 from '../../assets/card8.svg';

const CARDS = [
    { value: '0', img: card1 },
    { value: '0.5', img: card2 },
    { value: '1', img: card3 },
    { value: '2', img: card4 },
    { value: '3', img: card5 },
    { value: '4', img: card6 },
    { value: '5', img: card7 },
    { value: '?', img: card8 }
];

const VotingOverlay = ({ onVote, currentVote, role }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 min-h-screen overflow-y-auto font-sans bg-black/50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">

            {/* Soft Central Glow */}
            <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-white/5 blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">

                {/* Modern Header */}
                <div className="mb-12 md:mb-16 text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 font-heading">Active Estimation</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-tight max-w-4xl mx-auto drop-shadow-lg">
                        {role === 'DEV' ? 'Development Complexity' : 'Testing Effort'}
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-white/50 font-medium tracking-wide">Select a card to reach team consensus</p>
                </div>

                {/* Floating Card Layout */}
                <div className="w-full flex justify-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both">
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 px-4 w-full">
                        {CARDS.map((card) => {
                            const isSelected = currentVote === card.value;
                            return (
                                <button
                                    key={card.value}
                                    onClick={() => onVote(card.value)}
                                    className={`group relative transition-all duration-300 transform w-[42vw] xs:w-32 sm:w-36 md:w-40 lg:w-36 xl:w-40 aspect-[2/3]
                                        ${isSelected
                                            ? 'scale-110 md:scale-125 z-20 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                                            : 'hover:-translate-y-4 hover:scale-110 z-10 opacity-75 hover:opacity-100'
                                        }`}
                                >
                                    {/* Direct SVG Image */}
                                    <div className="w-full h-full relative">
                                        <img
                                            src={card.img}
                                            alt={`Card ${card.value}`}
                                            className={`w-full h-full object-contain pointer-events-none transition-all duration-300 drop-shadow-2xl
                                                ${isSelected ? 'brightness-110 contrast-110' : 'group-hover:drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]'}`}
                                        />
                                    </div>

                                    {/* Minimalist Selection Marker */}
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 flex w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-white text-[#151921] shadow-2xl border-[3px] border-[#151921] z-30 animate-in zoom-in duration-300">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
