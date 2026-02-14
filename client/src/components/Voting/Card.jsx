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
                    selected ? "ring-4 ring-primary -translate-y-2" : "hover:-translate-y-1",
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
                    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xl md:text-3xl font-bold text-slate-800">
                            {value === 'COFFEE' ? '☕' : value}
                        </span>
                    </div>
                )}

                {/* Back Face (Pattern) */}
                {faceDown && (
                    <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-700">
                        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-slate-600 rounded-full opacity-50"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
