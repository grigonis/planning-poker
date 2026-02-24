import React, { useMemo } from 'react';
import DealingCards from './DealingCards';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Generate static avatars for the mockup
const FakeAvatar = ({ name, role, seed, bgColors }) => {
    const avatarSvg = useMemo(() => {
        const avatar = createAvatar(avataaars, {
            seed,
            size: 48,
            backgroundColor: bgColors,
        });
        return avatar.toDataUri();
    }, [seed, bgColors]);

    return (
        <div className="flex flex-col items-center gap-1.5 min-w-0 transition-opacity duration-500 ease-in-out">
            <div className="relative flex-shrink-0 group">
                <div
                    className="rounded-full overflow-hidden border-2 bg-slate-800 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border-white/10 ring-2 ring-white/5"
                    style={{ width: 48, height: 48 }}
                >
                    <img
                        src={avatarSvg}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Name */}
            <span className="font-bold font-heading text-gray-900 dark:text-gray-200 text-xs md:text-xs leading-tight text-center truncate max-w-[80px]">
                {name}
            </span>

            {/* Role badge */}
            <span className={`
                text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold leading-none shadow-sm
                ${role === 'DEV'
                    ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/20 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30'
                    : 'bg-gradient-to-r from-rose-600/20 to-rose-500/20 text-rose-400 dark:text-rose-300 border border-rose-500/30'
                }
            `}>
                {role}
            </span>
        </div>
    );
};

// Layout for vertical orientation (top/bottom)
const VerticalSlot = ({ name, role, seed, bgColors, position }) => {
    return (
        <div className="flex flex-col items-center gap-2 animate-in zoom-in-90 fade-in duration-700 delay-100">
            {position === 'top' && (
                <>
                    <FakeAvatar name={name} role={role} seed={seed} bgColors={bgColors} />
                    <div className="w-8 h-12 rounded opacity-0"></div> {/* spacer for card */}
                </>
            )}
            {position === 'bottom' && (
                <>
                    <div className="w-8 h-12 rounded opacity-0"></div> {/* spacer for card */}
                    <FakeAvatar name={name} role={role} seed={seed} bgColors={bgColors} />
                </>
            )}
        </div>
    );
};

// Layout for horizontal orientation (left/right)
const HorizontalSlot = ({ name, role, seed, bgColors, isLeft }) => {
    return (
        <div className={`flex items-center gap-2 animate-in zoom-in-90 fade-in duration-700 delay-200 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
            <FakeAvatar name={name} role={role} seed={seed} bgColors={bgColors} />
            <div className="w-6 h-8 rounded opacity-0"></div> {/* spacer for card */}
        </div>
    );
};

const HeroPokerTable = () => {
    return (
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 md:py-16 transition-all duration-700 select-none pointer-events-none">

            {/* Top Row */}
            <div className="absolute top-2 left-0 right-0 flex justify-center gap-12 z-20">
                <VerticalSlot name="Alex" role="DEV" seed="Alexy" bgColors={['b6e3f4', 'c0aede']} position="top" />
                <VerticalSlot name="Sam" role="QA" seed="Samantha" bgColors={['d1d4f9', 'ffd5dc']} position="top" />
            </div>

            {/* Left Side */}
            <div className="absolute left-2 xl:-left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-20 hidden sm:flex">
                <HorizontalSlot name="Jamie" role="DEV" seed="Jameson" bgColors={['ffdfbf', 'b6e3f4']} isLeft={true} />
            </div>

            {/* Right Side */}
            <div className="absolute right-2 xl:-right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-20 hidden sm:flex">
                <HorizontalSlot name="Taylor" role="QA" seed="Tylor" bgColors={['c0aede', 'ffd5dc']} isLeft={false} />
            </div>

            {/* Bottom Row */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-12 z-20">
                <VerticalSlot name="Chris" role="DEV" seed="ChrisT" bgColors={['d1d4f9', 'ffdfbf']} position="bottom" />
                <VerticalSlot name="Riley" role="DEV" seed="Riley" bgColors={['b6e3f4', 'ffd5dc']} position="bottom" />
            </div>

            {/* Table Surface */}
            <div className="glass rounded-[80px] w-full max-w-xl transition-all duration-700 ease-out flex flex-col items-center justify-center text-center p-8 relative overflow-hidden shadow-2xl aspect-[18/10] md:aspect-[21/10]">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[80px]" />

                {/* Dealing Cards inside table */}
                <div className="relative z-10 scale-[0.45] md:scale-[0.55] flex items-center justify-center pt-2">
                    <DealingCards />
                </div>
            </div>
        </div>
    );
};

export default HeroPokerTable;
