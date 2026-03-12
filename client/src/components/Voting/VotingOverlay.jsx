import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const VotingOverlay = ({ onVote, currentVote, role, votingSystem }) => {
    // Default to Modified Fibonacci if votingSystem is missing
    const cards = votingSystem?.values || [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'];

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 min-h-screen overflow-y-auto font-sans bg-background/90 backdrop-blur-xl transition-colors duration-500"
            >
                {/* Soft Central Glow */}
                <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-primary/10 blur-[120px]"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">

                    {/* Modern Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-12 md:mb-16 text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5 border border-border mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Active Estimation</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-tight max-w-4xl mx-auto drop-shadow-2xl">
                            Point this Task
                        </h1>
                        <p className="mt-4 text-base md:text-xl text-muted-foreground font-medium tracking-wide">Select a card to reach team consensus</p>
                    </motion.div>

                    {/* Floating Card Layout */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="w-full flex justify-center overflow-x-hidden md:overflow-visible"
                    >
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
                                        <Card className={`w-full h-full rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden
                                            ${isSelected 
                                                ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_50px_oklch(var(--primary)/0.4)] ring-2 ring-primary ring-offset-2 ring-offset-background' 
                                                : 'bg-card text-card-foreground hover:bg-muted group-hover:border-primary/50'}`}>
                                            
                                            <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center relative">
                                                {/* Corner Accents */}
                                                <div className={`absolute top-3 left-3 font-bold text-xs opacity-40 ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/30'}`}>
                                                    {displayVal}
                                                </div>
                                                <div className={`absolute bottom-3 right-3 font-bold text-xs opacity-40 rotate-180 ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/30'}`}>
                                                    {displayVal}
                                                </div>

                                                {/* Card Value */}
                                                <div className="relative flex items-center justify-center w-full h-full p-4">
                                                    <span className={`font-black tracking-tighter leading-none transition-all duration-500
                                                        ${isLong ? 'text-xl sm:text-2xl md:text-3xl' : 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl'}`}>
                                                        {displayVal}
                                                    </span>
                                                </div>
                                            </CardContent>

                                            {/* Subtle Highlight Reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                                        </Card>

                                        {/* Selection Glow Indicator */}
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 flex w-8 h-8 md:w-12 md:h-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl border-[3px] border-background z-30 animate-in zoom-in duration-500 spin-in-90 fill-mode-both">
                                                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Skip Vote Button */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 md:mt-16"
                    >
                        <Button 
                            variant="ghost" 
                            size="lg"
                            onClick={() => onVote('?')}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full px-8"
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
