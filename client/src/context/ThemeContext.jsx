import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        let saved = localStorage.getItem('keystimate-theme');
        if (saved === null) {
            // One-time migration from legacy key
            const legacy = localStorage.getItem('banana-poker-theme');
            if (legacy !== null) {
                saved = legacy;
                localStorage.setItem('keystimate-theme', saved);
            }
        }
        const dark = saved !== null
            ? saved === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;
        // Apply immediately to avoid flash
        document.documentElement.classList.toggle('dark', dark);
        return dark;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('keystimate-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
