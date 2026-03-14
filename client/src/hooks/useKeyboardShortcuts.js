import { useEffect } from 'react';

/**
 * Custom hook to handle keyboard shortcuts for the Room page.
 */
export const useKeyboardShortcuts = ({
    onVote,
    onReveal,
    onReset,
    onToggleTasks,
    onOpenInvite,
    onOpenSettings,
    onOpenHelp,
    isHost,
    votingSystem,
    disabled
}) => {
    useEffect(() => {
        if (disabled) return;

        const handleKeyDown = (e) => {
            // Ignore if typing in an input, textarea or contenteditable
            if (
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.isContentEditable
            ) return;

            // Numeric keys 1-9 for voting
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (votingSystem && votingSystem.values && votingSystem.values[index] !== undefined) {
                    onVote(votingSystem.values[index]);
                }
            }

            // Host-only shortcuts
            if (isHost) {
                // Reveal: R
                if (e.key.toLowerCase() === 'r') {
                    e.preventDefault();
                    onReveal();
                }
                // New Round: N
                if (e.key.toLowerCase() === 'n') {
                    e.preventDefault();
                    onReset();
                }
            }

            // Global shortcuts
            // Toggle Tasks: T
            if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                onToggleTasks();
            }
            // Open Invite: I
            if (e.key.toLowerCase() === 'i') {
                e.preventDefault();
                onOpenInvite();
            }
            // Open Settings: S
            if (e.key.toLowerCase() === 's') {
                e.preventDefault();
                onOpenSettings();
            }
            // Open Help: ?
            if (e.key === '?') {
                e.preventDefault();
                onOpenHelp();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onVote, onReveal, onReset, onToggleTasks, onOpenInvite, onOpenSettings, isHost, votingSystem, disabled]);
};
