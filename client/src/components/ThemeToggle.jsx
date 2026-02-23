import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 relative overflow-hidden
                ${isDark
                    ? 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-banana-500/40'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                } ${className}`}
        >
            <Sun
                size={15}
                className={`absolute transition-all duration-300 text-banana-400 ${isDark
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-90 scale-50'
                }`}
            />
            <Moon
                size={15}
                className={`absolute transition-all duration-300 text-gray-600 ${!isDark
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-50'
                }`}
            />
        </button>
    );
};

export default ThemeToggle;
