import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from './ui/tooltip';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className={`rounded-full size-9 relative overflow-hidden ${className}`}
                >
                    <Sun
                        className="absolute size-4 transition-all duration-300 text-primary opacity-0 rotate-90 scale-50 dark:opacity-100 dark:rotate-0 dark:scale-100"
                    />
                    <Moon
                        className="absolute size-4 transition-all duration-300 text-muted-foreground opacity-100 rotate-0 scale-100 dark:opacity-0 dark:-rotate-90 dark:scale-50"
                    />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
        </Tooltip>
    );
};

export default ThemeToggle;
