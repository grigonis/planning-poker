import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ value, faceDown = false, selected = false, onClick, className }) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                clsx(
                    "relative w-16 h-24 md:w-20 md:h-32 rounded-lg shadow-md cursor-pointer transition-all duration-300 transform perspective-1000",
                    selected ? "ring-4 ring-banana-500 -translate-y-2 shadow-[0_0_15px_rgba(255,184,0,0.5)]" : "hover:-translate-y-1",
                    className
                )
            )}
        >
            <div className={clsx(
                "w-full h-full absolute top-0 left-0 backface-hidden transition-transform duration-500 transform-style-3d",
                faceDown ? "rotate-y-180" : ""
            )}>
                {/* Front Face (Value) */}
                {!faceDown && (
                    <div className="w-full h-full bg-dark-800 border-2 border-banana-500/50 rounded-lg flex items-center justify-center shadow-lg shadow-banana-500/10">
                        <span className="text-xl md:text-3xl font-bold font-heading text-white">
                            {value === 'COFFEE' ? '☕' : value}
                        </span>
                    </div>
                )}

                {/* Back Face (Pattern) */}
                {faceDown && (
                    <div className="w-full h-full bg-linear-to-br from-banana-500 to-orange-500 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-inner">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
