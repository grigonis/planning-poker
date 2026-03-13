import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, LayoutList, Pencil, Layers, UsersRound } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../ui/tooltip';
import ThemeToggle from '../ThemeToggle';
import PlayerAvatar from './PlayerAvatar';
import KeystimateLogo from '../KeystimateLogo';
import { cn } from '../../lib/utils';

/**
 * SettingsDropdown
 *
 * Custom dropdown that avoids the Radix Popper positioning bug inside sticky/backdrop-blur containers.
 * Renders absolutely positioned relative to the trigger button.
 */
const SettingsDropdown = ({ onOpenEditRoom, onOpenCustomizeCards, onOpenManageGroups, onOpenSettings }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    const handleSelect = (fn) => {
        setOpen(false);
        fn?.();
    };

    return (
        <div ref={containerRef} className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full size-9"
                aria-label="Room Settings"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen(v => !v)}
            >
                <Settings className="size-4" />
            </Button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 w-52 rounded-lg bg-popover border border-border shadow-md ring-1 ring-foreground/10 py-1 z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
                    style={{ marginTop: '6px' }}
                >
                    <button
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors"
                        onClick={() => handleSelect(onOpenEditRoom)}
                    >
                        <Pencil className="size-4 shrink-0" />
                        Edit Room Details
                    </button>
                    <button
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors"
                        onClick={() => handleSelect(onOpenCustomizeCards)}
                    >
                        <Layers className="size-4 shrink-0" />
                        Customize Cards
                    </button>
                    <button
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors"
                        onClick={() => handleSelect(onOpenManageGroups)}
                    >
                        <UsersRound className="size-4 shrink-0" />
                        Manage Groups
                    </button>
                    <div className="my-1 h-px bg-border -mx-1" role="separator" />
                    <button
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors"
                        onClick={() => handleSelect(onOpenSettings)}
                    >
                        <Settings className="size-4 shrink-0" />
                        Settings
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * RoomNavbar
 *
 * - Logo: KeystimateLogo icon + "Keystimate" text (same as landing page)
 * - Room name + description: shown below logo text, truncated with tooltip
 * - Tasks / Invite: icon + label buttons
 * - Settings: custom dropdown (avoids Radix Popper bug inside sticky/backdrop-blur)
 */
const RoomNavbar = ({
    roomId,
    roomName,
    roomDescription,
    socketStatus,
    tasksCount = 0,
    isHost = false,
    isTasksOpen = false,
    currentUser,
    minimal = false,
    onToggleTasks,
    onOpenEditRoom,
    onOpenCustomizeCards,
    onOpenSettings,
    onOpenManageGroups,
    onOpenInvite,
    onOpenProfile
}) => {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-2 flex items-center justify-between gap-3">

                {/* Logo / Room Name — pushed left */}
                <div
                    className="flex items-center gap-2.5 cursor-pointer shrink-0 group min-w-0"
                    onClick={() => navigate('/')}
                >
                    <KeystimateLogo className="w-auto h-8 shrink-0" />
                    <div className="flex flex-col justify-center leading-none min-w-0">
                        <span
                            className="text-xl tracking-tight text-neutral-800 dark:text-neutral-200 transition-all duration-300 flex items-center whitespace-nowrap"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span className="font-semibold">Key</span><span className="font-normal">stimate</span>
                        </span>
                        {!minimal && roomName && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[130px] sm:max-w-[200px] md:max-w-[300px] leading-none mt-0.5 cursor-default block">
                                        {roomDescription ? `${roomName} — ${roomDescription}` : roomName}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="max-w-[360px] text-xs">
                                    <p className="font-bold">{roomName}</p>
                                    {roomDescription && <p className="text-muted-foreground mt-0.5">{roomDescription}</p>}
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {minimal && (
                            <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-none whitespace-nowrap">Online planning poker</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                    {!minimal && currentUser && (
                        <>
                            {/* Profile/Avatar Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onOpenProfile}
                                        className="rounded-full size-9 p-0 hover:scale-105 active:scale-95 transition-transform"
                                        aria-label="Edit Profile"
                                    >
                                        <PlayerAvatar
                                            user={{ ...currentUser, connected: true }}
                                            size={32}
                                            isCurrentUser={false}
                                            anonymousMode={false}
                                            hideDetails={true}
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Profile</TooltipContent>
                            </Tooltip>

                            {/* Tasks Button — icon + label */}
                            <Button
                                variant={isTasksOpen ? "secondary" : "ghost"}
                                onClick={onToggleTasks}
                                className={cn(
                                    "rounded-full h-9 px-3 gap-1.5 text-sm font-medium relative",
                                    isTasksOpen && "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                aria-label="Toggle Tasks"
                            >
                                <LayoutList className="size-4 shrink-0" />
                                <span className="hidden sm:inline">Tasks</span>
                                {tasksCount > 0 && (
                                    <span className="bg-primary text-primary-foreground text-[9px] font-black leading-none size-4 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                        {tasksCount > 9 ? '9+' : tasksCount}
                                    </span>
                                )}
                            </Button>

                            {/* Invite Button — icon + label */}
                            <Button
                                variant="ghost"
                                onClick={onOpenInvite}
                                className="rounded-full h-9 px-3 gap-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                                aria-label="Invite players"
                            >
                                <Users className="size-4 shrink-0" />
                                <span className="hidden sm:inline">Invite</span>
                            </Button>
                        </>
                    )}

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Settings — custom dropdown (avoids Radix Popper sticky/backdrop-filter bug) */}
                    {!minimal && isHost && (
                        <SettingsDropdown
                            onOpenEditRoom={onOpenEditRoom}
                            onOpenCustomizeCards={onOpenCustomizeCards}
                            onOpenManageGroups={onOpenManageGroups}
                            onOpenSettings={onOpenSettings}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomNavbar;
