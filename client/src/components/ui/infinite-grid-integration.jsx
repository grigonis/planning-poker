import React, { useState, useRef, useEffect } from 'react';
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useAnimationFrame
} from "framer-motion";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const GridPattern = ({ offsetX, offsetY, size }) => {
    return (
        <svg className="w-full h-full pointer-events-none">
            <defs>
                <motion.pattern
                    id="grid-pattern"
                    width={size}
                    height={size}
                    patternUnits="userSpaceOnUse"
                    x={offsetX}
                    y={offsetY}
                >
                    <path
                        d={`M ${size} 0 L 0 0 0 ${size}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-gray-900/10 dark:text-gray-100/10"
                    />
                </motion.pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" className="pointer-events-none" />
        </svg>
    );
};

export const InfiniteGrid = ({ children }) => {
    const [gridSize, setGridSize] = useState(60);
    const containerRef = useRef(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    const speedX = 0.15;
    const speedY = 0.15;

    useAnimationFrame(() => {
        const currentX = gridOffsetX.get();
        const currentY = gridOffsetY.get();
        gridOffsetX.set((currentX + speedX) % gridSize);
        gridOffsetY.set((currentY + speedY) % gridSize);
    });

    const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative w-full min-h-[600px] h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent"
            )}
        >
            {/* Mask wrapper to fade the grid out deeply at the bottom edge */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
                }}
            >
                {/* Layer 1: Subtle background grid (always visible) */}
                <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
                    <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                </div>

                {/* Layer 2: Highlighted grid (revealed by mouse mask) */}
                <motion.div
                    className="absolute inset-0 opacity-100 pointer-events-none"
                    style={{ maskImage: maskImage, WebkitMaskImage: maskImage }}
                >
                    <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                </motion.div>
            </div>

            {/* Global Application Content */}
            <div className="relative z-10 w-full flex-1 flex flex-col pointer-events-auto">
                {children}
            </div>

        </div>
    );
};
