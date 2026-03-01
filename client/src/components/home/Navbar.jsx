import React, { useState, useEffect } from 'react';
import ScrumkyLogo from '../ScrumkyLogo';
import ThemeToggle from '../ThemeToggle';

const Navbar = ({ onCreateSession }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-2.5 bg-gray-50/80 dark:bg-dark-900/80 backdrop-blur-md shadow-lg shadow-black/5 border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="relative flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                        <ScrumkyLogo className="h-10 w-auto" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-2xl font-medium tracking-tight text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
                            Scrumky
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-800/60 dark:text-neutral-200/60 font-medium mt-0.5 transition-colors duration-300">
                            Online planning poker
                        </span>
                    </div>
                </div>

                {/* Links - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-10">
                    {['How It Works', 'Features', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:opacity-70 transition-all duration-300 uppercase tracking-widest text-[11px]"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={onCreateSession}
                        className="group relative px-6 py-2 bg-banana-500 rounded-full text-[#181818] text-sm font-bold hover:bg-banana-400 transition-all duration-300 shadow-[0_10px_15px_-3px_rgba(238,173,43,0.2)]"
                    >
                        <span className="relative z-10">Create Room</span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-banana-500 to-[#ff5c00] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
