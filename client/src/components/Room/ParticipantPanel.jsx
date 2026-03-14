import React, { useMemo, useState, useLayoutEffect } from 'react';
import {
    ChevronRight, ChevronLeft, Check, Clock, Eye, Crown,
    Users, Vote, SkipForward, CheckCircle2, UserX
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// ----- helpers -----

function getAvatarSvg(user) {
    if (!user?.avatarSeed) return null;
    try {
        return createAvatar(avataaars, {
            seed: user.avatarSeed,
            size: 32,
        }).toString();
    } catch {
        return null;
    }
}

/**
 * Groups users by lifecycle state.
 *
 * States:
 *   IDLE         → all non-spectators in "Waiting" group
 *   VOTING       → non-voted in "Voting", voted in "Voted"
 *   REVEALED     → if groupsEnabled, group by team name; else "Results" + "Skipped"
 *
 * Spectators always at the bottom in "Spectating" group.
 */
function getLifecycleGroups(users, votes, phase, groups, groupsEnabled) {
    const spectators = [];
    const nonSpectators = [];

    for (const user of users) {
        if (user.role === 'SPECTATOR') {
            spectators.push(user);
        } else {
            nonSpectators.push(user);
        }
    }

    const result = [];

    if (phase === 'REVEALED') {
        if (groupsEnabled && groups?.length > 0) {
            // Group-mode override: group by team name
            const groupMap = new Map();
            const ungrouped = [];

            for (const user of nonSpectators) {
                const group = user.groupId ? groups.find(g => g.id === user.groupId) : null;
                if (group) {
                    if (!groupMap.has(group.id)) {
                        groupMap.set(group.id, { label: group.name, icon: 'group', color: group.color, members: [] });
                    }
                    groupMap.get(group.id).members.push(user);
                } else {
                    ungrouped.push(user);
                }
            }

            for (const [, groupData] of groupMap) {
                if (groupData.members.length > 0) result.push(groupData);
            }

            const voted = ungrouped.filter(u => votes[u.id] !== undefined);
            const skipped = ungrouped.filter(u => votes[u.id] === undefined);

            if (voted.length > 0) {
                result.push({ label: 'Voted', icon: 'voted', members: voted });
            }
            if (skipped.length > 0) {
                result.push({ label: 'Skipped', icon: 'skip', members: skipped });
            }
        } else {
            const voted = nonSpectators.filter(u => votes[u.id] !== undefined);
            const skipped = nonSpectators.filter(u => votes[u.id] === undefined);

            if (voted.length > 0) {
                result.push({ label: 'Results', icon: 'revealed', members: voted });
            }
            if (skipped.length > 0) {
                result.push({ label: 'Skipped', icon: 'skip', members: skipped });
            }
        }
    } else if (phase === 'VOTING' || phase.startsWith('PARTIAL')) {
        const voting = nonSpectators.filter(u => votes[u.id] === undefined);
        const voted = nonSpectators.filter(u => votes[u.id] !== undefined);

        if (voted.length > 0) {
            result.push({ label: 'Voted', icon: 'voted', members: voted });
        }
        if (voting.length > 0) {
            result.push({ label: 'Voting', icon: 'voting', members: voting });
        }
    } else {
        // IDLE
        if (nonSpectators.length > 0) {
            result.push({ label: 'Waiting', icon: 'waiting', members: nonSpectators });
        }
    }

    // Spectators always at bottom — hide if 0
    if (spectators.length > 0) {
        result.push({ label: 'Spectating', icon: 'spectating', members: spectators });
    }

    return result;
}

// ----- sub-components -----

function SmallAvatar({ user, size = 28 }) {
    const avatarPhotoURL = user?.avatarPhotoURL || null;
    const svgContent = useMemo(() => {
        if (avatarPhotoURL) return null;
        return getAvatarSvg(user);
    }, [user?.avatarSeed, avatarPhotoURL]);

    const style = { width: size, height: size, minWidth: size };

    if (avatarPhotoURL) {
        return (
            <div className="rounded-full overflow-hidden shrink-0 bg-muted border border-border/50" style={style}>
                <img src={avatarPhotoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
        );
    }

    if (!svgContent) {
        const initials = (user?.name || '?')[0].toUpperCase();
        return (
            <div className="rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs" style={style}>
                {initials}
            </div>
        );
    }

    return (
        <div
            className="rounded-full overflow-hidden shrink-0 bg-muted"
            style={style}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}

const GROUP_ICON_MAP = {
    waiting: Clock,
    voting: Vote,
    voted: Check,
    revealed: CheckCircle2,
    skip: SkipForward,
    spectating: Eye,
    group: Users,
};

function GroupHeader({ label, icon, color, count }) {
    const IconComp = GROUP_ICON_MAP[icon] || Users;
    return (
        <div className="flex items-center gap-1.5 px-2 pt-3 pb-1 select-none">
            <IconComp
                className="size-3 text-muted-foreground/60"
                style={color ? { color } : undefined}
            />
            <span
                className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60"
                style={color ? { color } : undefined}
            >
                {label}
            </span>
            <span className="text-[9px] text-muted-foreground/40 ml-auto">{count}</span>
        </div>
    );
}

function VoteBadge({ voteVal, anonymousMode, isMe }) {
    if (voteVal === undefined) return null;
    const display = (anonymousMode && !isMe) ? '?' : String(voteVal);
    return (
        <span className="ml-auto shrink-0 text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded tabular-nums">
            {display}
        </span>
    );
}

function GroupTag({ user, groups }) {
    if (!user.groupId || !groups?.length) return null;
    const group = groups.find(g => g.id === user.groupId);
    if (!group) return null;
    return (
        <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none shrink-0"
            style={{
                color: group.color,
                borderColor: group.color + '50',
                backgroundColor: group.color + '18',
            }}
        >
            {group.name}
        </span>
    );
}

function UserRow({ user, votes, phase, currentUser, anonymousMode, expanded, groups, groupsEnabled, isHost, onAssignGroup, onKickUser }) {
    const isMe = user.id === currentUser?.id;
    const voteVal = votes[user.id];
    const canAssign = isHost && user.role !== 'SPECTATOR' && groupsEnabled && groups?.length > 0;
    const canKick = isHost && !isMe && !user.isHost;

    // Collapsed: avatar centered
    if (!expanded) {
        return (
            <div className="flex items-center justify-center py-1">
                <SmallAvatar user={user} size={28} />
            </div>
        );
    }

    const rowContent = (
        <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/20 dark:hover:bg-white/5 ${isMe ? 'bg-primary/5' : ''} ${(canAssign || canKick) ? 'cursor-pointer' : ''}`}
        >
            <SmallAvatar user={user} size={28} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0 flex-wrap">
                    <span className={`text-xs font-medium truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                        {user.name}
                        {isMe && <span className="ml-1 text-[9px] text-muted-foreground">(you)</span>}
                    </span>
                    {user.isHost && <Crown className="size-2.5 text-amber-500 shrink-0" />}
                </div>
                {groupsEnabled && phase !== 'REVEALED' && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <GroupTag user={user} groups={groups} />
                    </div>
                )}
            </div>

            {phase === 'REVEALED' && (
                <VoteBadge voteVal={voteVal} anonymousMode={anonymousMode} isMe={isMe} />
            )}
        </div>
    );

    if (canAssign || canKick) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {rowContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-44">
                    {canAssign && (
                        <>
                            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Assign Group
                            </div>
                            <DropdownMenuSeparator />
                            {groups.map(group => (
                                <DropdownMenuItem
                                    key={group.id}
                                    onSelect={() => onAssignGroup(user.id, group.id)}
                                    className="gap-2 cursor-pointer text-sm"
                                >
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                                    {group.name}
                                    {user.groupId === group.id && <Check className="size-3 ml-auto" />}
                                </DropdownMenuItem>
                            ))}
                            {user.groupId && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={() => onAssignGroup(user.id, null)}
                                        className="text-muted-foreground text-sm cursor-pointer"
                                    >
                                        Remove from group
                                    </DropdownMenuItem>
                                </>
                            )}
                        </>
                    )}
                    {canKick && (
                        <>
                            {canAssign && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onSelect={() => onKickUser(user.id)}
                                className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive"
                            >
                                <UserX className="size-3.5" />
                                Remove from room
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return rowContent;
}

// ----- main component -----

const ParticipantPanel = ({ users = [], votes = {}, phase = 'IDLE', currentUser, roomId, anonymousMode = false, groups = [], groupsEnabled = false, isHost = false, onAssignGroup, onKickUser }) => {
    const storageKey = `keystimate_panel_open_${roomId}`;

    const [isExpanded, setIsExpanded] = useState(() => {
        try {
            return localStorage.getItem(storageKey) === 'true';
        } catch {
            return false;
        }
    });

    const [navbarTop, setNavbarTop] = useState(56);
    useLayoutEffect(() => {
        const navbar = document.querySelector('.sticky.top-0.z-40');
        if (!navbar) return;
        const measure = () => setNavbarTop(navbar.getBoundingClientRect().height);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(navbar);
        return () => ro.disconnect();
    }, []);

    const handleToggle = () => {
        setIsExpanded(prev => {
            const next = !prev;
            try { localStorage.setItem(storageKey, String(next)); } catch {}
            return next;
        });
    };

    const lifecycleGroups = useMemo(
        () => getLifecycleGroups(users, votes, phase, groups, groupsEnabled),
        [users, votes, phase, groups, groupsEnabled]
    );

    const totalCount = users.length;
    const votedCount = users.filter(u => u.role !== 'SPECTATOR' && votes[u.id] !== undefined).length;
    const eligibleCount = users.filter(u => u.role !== 'SPECTATOR').length;

    return (
        <div
            className={`hidden md:flex flex-col fixed left-0 bottom-0 z-30 transition-[width] duration-200 ease-in-out overflow-hidden
                bg-white/70 dark:bg-black/50 backdrop-blur-md
                border-r border-gray-200/60 dark:border-white/10
                ${isExpanded ? 'w-56' : 'w-12'}`}
            style={{ top: navbarTop }}
        >
            {/* Toggle button */}
            <button
                onClick={handleToggle}
                className="flex items-center justify-center h-10 w-full shrink-0 border-b border-gray-200/60 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                aria-label={isExpanded ? 'Collapse participant panel' : 'Expand participant panel'}
            >
                {isExpanded ? (
                    <div className="flex items-center gap-2 px-3 w-full">
                        <Users className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-bold text-muted-foreground flex-1">
                            {eligibleCount > 0 ? `${votedCount}/${eligibleCount}` : `${totalCount}`}
                        </span>
                        <ChevronLeft className="size-4 text-muted-foreground shrink-0" />
                    </div>
                ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                )}
            </button>

            {/* User list — scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-1">
                {lifecycleGroups.map((group) => (
                    <div key={group.label}>
                        {isExpanded && (
                            <GroupHeader
                                label={group.label}
                                icon={group.icon}
                                color={group.color}
                                count={group.members.length}
                            />
                        )}
                        {group.members.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                votes={votes}
                                phase={phase}
                                currentUser={currentUser}
                                anonymousMode={anonymousMode}
                                expanded={isExpanded}
                                groups={groups}
                                groupsEnabled={groupsEnabled}
                                isHost={isHost}
                                onAssignGroup={onAssignGroup}
                                onKickUser={onKickUser}
                            />
                        ))}
                    </div>
                ))}

                {users.length === 0 && isExpanded && (
                    <p className="text-xs text-muted-foreground text-center py-4 px-2">No participants yet</p>
                )}
            </div>
        </div>
    );
};

export default ParticipantPanel;
