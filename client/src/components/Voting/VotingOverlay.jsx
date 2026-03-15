import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const VotingOverlay = ({ onVote, currentVote, role, votingSystem }) => {
    const cards = votingSystem?.values || [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'];
    const cardCount = cards.length;

    // Responsive card width: 5-per-row on mobile, 6 on wider screens.
    // Larger max so cards feel substantial on desktop.
    const rowCols = typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 6;
    const cardStyle = {
        width: `clamp(52px, calc((100vw - 48px) / ${Math.min(cardCount, rowCols)} - 12px), 130px)`,
        aspectRatio: '2 / 3',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-4 py-4 overflow-y-auto font-sans bg-background/90 backdrop-blur-xl transition-colors duration-500"
            >
                {/* Soft Central Glow */}
                <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-primary/10 blur-[120px]" />

                <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-0">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-4 sm:mb-6 md:mb-8 text-center"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-tight drop-shadow-2xl">
                            Cast Your Vote
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                            Votes are hidden until everyone has selected a card to ensure an unbiased result
                        </p>
                    </motion.div>

                    {/* Card Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="w-full flex justify-center"
                    >
                        <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 px-2 w-full">
                            {cards.map((val, index) => {
                                const isSelected = currentVote === val;
                                const displayVal = val === 'COFFEE' ? '☕' : val;
                                const isLong = String(displayVal).length > 3;
                                const shortcut = index < 9 ? (index + 1) : null;

                                return (
                                    <button
                                        key={val}
                                        onClick={() => onVote(val)}
                                        style={cardStyle}
                                        className={`group relative transition-all duration-400 transform shrink-0
                                            ${isSelected
                                                ? 'scale-110 z-20 -translate-y-2 sm:-translate-y-3'
                                                : 'hover:-translate-y-3 hover:scale-105 z-10 opacity-85 hover:opacity-100'
                                            }`}
                                    >
                                        <Card className={`w-full h-full rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center transition-all duration-400 shadow-xl relative overflow-hidden
                                            ${isSelected
                                                ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_40px_oklch(var(--primary)/0.35)] ring-2 ring-primary ring-offset-2 ring-offset-background'
                                                : 'bg-card text-card-foreground hover:bg-muted group-hover:border-primary/50'
                                            }`}
                                        >
                                            <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center relative">
                                                {/* Corner accents */}
                                                <div className={`absolute top-1.5 left-1.5 font-bold text-[9px] sm:text-xs opacity-40 ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/30'}`}>
                                                    {displayVal}
                                                </div>

                                                {/* Keyboard Shortcut Hint */}
                                                {shortcut && !isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 size-4 rounded-full border border-muted-foreground/20 flex items-center justify-center text-[8px] font-bold text-muted-foreground/40">
                                                        {shortcut}
                                                    </div>
                                                )}

                                                <div className={`absolute bottom-1.5 right-1.5 font-bold text-[9px] sm:text-xs opacity-40 rotate-180 ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/30'}`}>
                                                    {displayVal}
                                                </div>

                                                {/* Card Value */}
                                                <span className={`font-black tracking-tighter leading-none transition-all duration-400 px-1
                                                    ${isLong
                                                        ? 'text-sm sm:text-base md:text-xl'
                                                        : 'text-xl sm:text-2xl md:text-4xl'
                                                    }`}
                                                >
                                                    {displayVal}
                                                </span>
                                            </CardContent>

                                            {/* Shine */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                                        </Card>

                                        {/* Selection check badge */}
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 flex size-6 sm:size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl border-2 border-background z-30 animate-in zoom-in duration-400">
                                                <svg className="size-3 sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Skip Vote */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-4 sm:mt-6 md:mt-8"
                    >
                        <Button
                            variant="ghost"
                            size="default"
                            onClick={() => onVote('?')}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full px-6"
                        >
                            Skip Vote
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VotingOverlay;
