import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, LayoutList, Pencil, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ThemeToggle from '../ThemeToggle';
import PlayerAvatar from './PlayerAvatar';
import { cn } from '../../lib/utils';

/**
 * Unified RoomNavbar component for room creation and active sessions.
 * 
 * @param {Object} props
 * @param {string} [props.roomId] - The room ID to display.
 * @param {boolean} [props.socketStatus] - Whether the socket is connected.
 * @param {number} [props.tasksCount=0] - Number of tasks to show in the badge.
 * @param {boolean} [props.isHost=false] - Whether the current user is the host.
 * @param {boolean} [props.isTasksOpen=false] - Whether the tasks pane is open.
 * @param {Object} [props.currentUser] - Current user object for the avatar.
 * @param {boolean} [props.minimal=false] - If true, only shows branding and ThemeToggle.
 * @param {Function} [props.onToggleTasks] - Handler for toggling the tasks pane.
 * @param {Function} [props.onOpenEditRoom] - Handler for opening Edit Room Details dialog.
 * @param {Function} [props.onOpenCustomizeCards] - Handler for opening Customize Cards dialog.
 * @param {Function} [props.onOpenSettings] - Handler for opening the Settings dialog.
 * @param {Function} [props.onOpenInvite] - Handler for opening the invite modal.
 * @param {Function} [props.onOpenProfile] - Handler for opening the profile edit modal.
 */
const RoomNavbar = ({
    roomId,
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
    onOpenInvite,
    onOpenProfile
}) => {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                {/* Logo/Room Info */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
                        <h1 className="text-xl font-black text-primary leading-none tracking-tight">Keystimate</h1>
                        {!minimal && roomId ? (
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <span>Room: <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded ml-0.5 select-all">{roomId}</span></span>
                                </div>
                                {roomDescription && (
                                    <p className="text-[11px] text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">{roomDescription}</p>
                                )}
                            </div>
                        ) : minimal && (
                            <span className="text-xs text-muted-foreground font-mono mt-1">Online planning poker</span>
                        )}
                    </div>

                    {!minimal && (
                        <>
                            {/* Divider */}
                            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-white/10 ml-2"></div>
                            
                            {/* Status (Connected) */}
                            <div className="hidden md:flex items-center gap-1.5 ml-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    socketStatus ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                )}></div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    {socketStatus ? 'Live' : 'Offline'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {!minimal && currentUser && (
                        <>
                            {/* Profile/Avatar Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onOpenProfile}
                                className="rounded-full w-9 h-9 p-0 hover:scale-110 active:scale-95 transition-transform"
                                aria-label="Edit Profile"
                            >
                                <PlayerAvatar 
                                    user={{ ...currentUser, connected: true }} 
                                    size={36} 
                                    isCurrentUser={false} 
                                    anonymousMode={false} 
                                    hideDetails={true} 
                                />
                            </Button>

                            {/* Tasks Button */}
                            <Button
                                variant={isTasksOpen ? "secondary" : "outline"}
                                size="sm"
                                onClick={onToggleTasks}
                                className={cn(
                                    "rounded-full font-bold text-sm gap-2 px-3 lg:px-4",
                                    isTasksOpen && "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                )}
                            >
                                <LayoutList size={16} />
                                <span className="hidden lg:inline">Tasks</span>
                                {tasksCount > 0 && (
                                    <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md text-[10px] leading-none ml-0.5 shadow-sm">
                                        {tasksCount}
                                    </span>
                                )}
                            </Button>

                            {/* Invite Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenInvite}
                                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-full font-bold gap-2 px-3 lg:px-4"
                            >
                                <Users size={16} />
                                <span className="hidden lg:inline">Invite</span>
                            </Button>
                        </>
                    )}

                    <ThemeToggle />

                    {!minimal && isHost && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                                    aria-label="Room Settings"
                                >
                                    <Settings className="w-4.5 h-4.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onSelect={onOpenEditRoom} className="gap-2 cursor-pointer">
                                    <Pencil className="size-4" />
                                    Edit Room Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={onOpenCustomizeCards} className="gap-2 cursor-pointer">
                                    <Layers className="size-4" />
                                    Customize Cards
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={onOpenSettings} className="gap-2 cursor-pointer">
                                    <Settings className="size-4" />
                                    Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomNavbar;
