import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ value, faceDown = false, selected = false, onClick, className }) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                clsx(
                    "relative w-[32px] h-[45px] sm:w-[50px] sm:h-[70px] md:w-[70px] md:h-[98px] rounded-lg shadow-md cursor-pointer transition-all duration-300 transform perspective-1000",
                    selected ? "ring-4 ring-primary -translate-y-2 shadow-primary/40" : "hover:-translate-y-1",
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
                    <div className="w-full h-full bg-card border-2 border-primary/50 rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
                        <span className="text-lg sm:text-xl md:text-3xl font-bold text-card-foreground">
                            {value === 'COFFEE' ? '☕' : value}
                        </span>
                    </div>
                )}

                {/* Back Face (Pattern) */}
                {faceDown && (
                    <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center border-2 border-white/20 shadow-inner">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
