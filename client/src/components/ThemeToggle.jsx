import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 relative overflow-hidden bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-300 dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15 dark:hover:border-banana-500/40 ${className}`}
        >
            <Sun
                size={15}
                className="absolute transition-all duration-300 text-banana-400 opacity-0 rotate-90 scale-50 dark:opacity-100 dark:rotate-0 dark:scale-100"
            />
            <Moon
                size={15}
                className="absolute transition-all duration-300 text-gray-600 opacity-100 rotate-0 scale-100 dark:opacity-0 dark:-rotate-90 dark:scale-50"
            />
        </button>
    );
};

export default ThemeToggle;
