import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Settings, LayoutList, Pencil, Layers, UsersRound,
    LogIn, LogOut, UserCog,
} from 'lucide-react';
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
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeAvatarUri = (seed, size = 32) =>
    createAvatar(avataaars, {
        seed,
        size,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    }).toDataUri();

// Custom dropdown — avoids Radix Popper positioning bug inside sticky/backdrop-blur containers.
const useDropdown = () => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return { open, setOpen, containerRef };
};

// ─── SettingsDropdown ─────────────────────────────────────────────────────────

const SettingsDropdown = ({ onOpenEditRoom, onOpenCustomizeCards, onOpenManageGroups, onOpenSettings }) => {
    const { open, setOpen, containerRef } = useDropdown();

    const handleSelect = (fn) => { setOpen(false); fn?.(); };

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
                    className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-popover border border-border shadow-lg ring-1 ring-foreground/5 py-1 z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
                >
                    <button role="menuitem" className="dropdown-item" onClick={() => handleSelect(onOpenEditRoom)}>
                        <Pencil className="size-4 shrink-0" />
                        Edit Room Details
                    </button>
                    <button role="menuitem" className="dropdown-item" onClick={() => handleSelect(onOpenCustomizeCards)}>
                        <Layers className="size-4 shrink-0" />
                        Customize Cards
                    </button>
                    <button role="menuitem" className="dropdown-item" onClick={() => handleSelect(onOpenManageGroups)}>
                        <UsersRound className="size-4 shrink-0" />
                        Manage Groups
                    </button>
                    <div className="my-1 h-px bg-border mx-2" role="separator" />
                    <button role="menuitem" className="dropdown-item" onClick={() => handleSelect(onOpenSettings)}>
                        <Settings className="size-4 shrink-0" />
                        Settings
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── UserDropdown ─────────────────────────────────────────────────────────────

/**
 * Single avatar trigger with two menu items:
 *   1. Avatar + display name — subtitle "User settings" — opens ProfileSetupDialog
 *   2. Sign in (guest) / Sign out (authenticated) — opens SignInDialog or calls signOut
 *
 * Used in both room mode and dashboard mode.
 */
const UserDropdown = ({
    currentUser,        // { id, name, avatarSeed }
    authUser,           // Firebase User | null
    onOpenProfile,      // () => void
    onSignIn,           // () => void
    onSignOut,          // () => void
    // Room-mode extras (not used in dashboard, but harmless to pass)
    isCurrentUser = true,
}) => {
    const { open, setOpen, containerRef } = useDropdown();

    const handleSelect = (fn) => { setOpen(false); fn?.(); };

    // Avatar: prefer Firebase photo → dicebear from seed → initials fallback
    const avatarSeed = currentUser?.avatarSeed;
    const displayName = authUser?.displayName || currentUser?.name || 'You';
    const firebasePhoto = authUser?.photoURL;

    return (
        <div ref={containerRef} className="relative">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => setOpen(v => !v)}
                        aria-expanded={open}
                        aria-haspopup="menu"
                        aria-label="Account menu"
                        className="size-9 rounded-full overflow-hidden border-2 border-transparent hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    >
                        {firebasePhoto ? (
                            <img
                                src={firebasePhoto}
                                alt={displayName}
                                className="size-full object-cover"
                            />
                        ) : avatarSeed ? (
                            <img
                                src={makeAvatarUri(avatarSeed, 36)}
                                alt={displayName}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="size-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                {displayName.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>Account</TooltipContent>
            </Tooltip>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-popover border border-border shadow-lg ring-1 ring-foreground/5 py-1.5 z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
                >
                    {/* ── Item 1: Profile / User settings ── */}
                    <button
                        role="menuitem"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors focus:outline-none focus-visible:bg-accent"
                        style={{ width: 'calc(100% - 8px)' }}
                        onClick={() => handleSelect(onOpenProfile)}
                    >
                        {/* Mini avatar */}
                        <div className="size-8 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
                            {firebasePhoto ? (
                                <img src={firebasePhoto} alt="" className="size-full object-cover" />
                            ) : avatarSeed ? (
                                <img src={makeAvatarUri(avatarSeed, 32)} alt="" className="size-full object-cover" />
                            ) : (
                                <div className="size-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                                    {displayName.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Text */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate leading-tight">
                                {displayName}
                            </span>
                            <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                User settings
                            </span>
                        </div>

                        <UserCog className="size-3.5 text-muted-foreground shrink-0 opacity-60" />
                    </button>

                    <div className="my-1 h-px bg-border mx-2" role="separator" />

                    {/* ── Item 2: Sign in / Sign out ── */}
                    {authUser ? (
                        <button
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors focus:outline-none focus-visible:bg-accent text-destructive hover:text-destructive"
                            style={{ width: 'calc(100% - 8px)' }}
                            onClick={() => handleSelect(onSignOut)}
                        >
                            <div className="size-8 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                                <LogOut className="size-4 text-destructive" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-semibold leading-tight">Sign out</span>
                                <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 font-normal text-current opacity-70">
                                    {authUser.email ?? authUser.displayName}
                                </span>
                            </div>
                        </button>
                    ) : (
                        <button
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 hover:bg-accent hover:text-accent-foreground cursor-pointer text-left transition-colors focus:outline-none focus-visible:bg-accent"
                            style={{ width: 'calc(100% - 8px)' }}
                            onClick={() => handleSelect(onSignIn)}
                        >
                            <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <LogIn className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-semibold leading-tight">Sign in</span>
                                <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                    Log in or sign up
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── RoomNavbar ───────────────────────────────────────────────────────────────

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
    onOpenProfile,
    mode = 'room',       // 'room' | 'dashboard'
    // Auth props
    authUser = null,     // Firebase User object or null
    onSignIn = null,     // () => void
    onSignOut = null,    // () => void
}) => {
    const isDashboard = mode === 'dashboard';
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            {/* Global dropdown-item style via a style tag — avoids Tailwind purge issues for dynamic classnames */}
            <style>{`
                .dropdown-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 12px;
                    font-size: 0.875rem;
                    border-radius: 6px;
                    cursor: pointer;
                    text-align: left;
                    transition: background 0.1s, color 0.1s;
                }
                .dropdown-item:hover {
                    background: hsl(var(--accent));
                    color: hsl(var(--accent-foreground));
                }
            `}</style>

            <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-2 flex items-center justify-between gap-3">

                {/* ── Logo / Room name ── */}
                <div
                    className="flex items-center gap-2.5 cursor-pointer shrink-0 group min-w-0"
                    onClick={() => navigate('/dashboard')}
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
                            <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-none whitespace-nowrap">
                                Online planning poker
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-1 md:gap-1.5 shrink-0">

                    {/* Room mode: Tasks + Invite buttons */}
                    {!minimal && !isDashboard && currentUser && (
                        <>
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

                    {/* Room mode: Settings dropdown (host only) */}
                    {!minimal && !isDashboard && isHost && (
                        <SettingsDropdown
                            onOpenEditRoom={onOpenEditRoom}
                            onOpenCustomizeCards={onOpenCustomizeCards}
                            onOpenManageGroups={onOpenManageGroups}
                            onOpenSettings={onOpenSettings}
                        />
                    )}

                    {/* User avatar dropdown — shown whenever we have a user */}
                    {currentUser && (
                        <UserDropdown
                            currentUser={currentUser}
                            authUser={authUser}
                            onOpenProfile={onOpenProfile}
                            onSignIn={onSignIn}
                            onSignOut={onSignOut}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomNavbar;
