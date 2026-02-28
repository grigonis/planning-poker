import React, { useState, useEffect } from 'react';
import bananaLogo from '../../assets/banana-poker/banana-logo.svg';
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
        <nav className="fixed top-0 left-0 right-0 z-50 py-2.5 bg-gray-50/80 dark:bg-dark-900/10 backdrop-blur-md shadow-lg shadow-black/5 border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#8c421d] via-[#fbe67b] to-[#d4a041]">
                        <img src={bananaLogo} alt="Scrumorá Logo" className="w-5 h-5 block" />
                    </div>
                    <div className="hidden sm:flex flex-col justify-center">
                        <span className="text-[28px] font-bold font-golden text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-gray-900 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-400 leading-tight pt-1 drop-shadow-sm">
                            Scrumorá
                        </span>
                        <span className="text-[10px] font-light font-heading text-gray-500 dark:text-white/40 leading-tight -mt-0.5">
                            Scrum planning poker
                        </span>
                    </div>
                </div>

                {/* Links - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-10">
                    {['How It Works', 'Features', 'Pricing'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium font-heading text-gray-600 dark:text-[#ded5c4] hover:text-gray-900 dark:hover:text-white transition-colors">
                            {item}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={onCreateSession}
                        className="group relative px-6 py-2 bg-banana-500 rounded-full text-[#181818] text-sm font-bold font-heading hover:bg-banana-400 transition-all shadow-[0_10px_15px_-3px_rgba(238,173,43,0.2)]"
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
