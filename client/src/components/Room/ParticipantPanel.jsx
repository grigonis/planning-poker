import React, { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Clock, Eye, Crown, Users } from 'lucide-react';
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

function isNumericVote(val) {
    if (val === undefined || val === null || val === '') return false;
    return !isNaN(Number(val));
}

function getOrderedGroups(users, votes, phase) {
    if (phase !== 'REVEALED') {
        return [{ label: null, members: users }];
    }

    const groupA = []; // numeric voters
    const groupB = []; // non-numeric voters (☕, ?, etc.)
    const groupC = []; // spectators + non-voters

    for (const user of users) {
        if (user.role === 'SPECTATOR') {
            groupC.push(user);
            continue;
        }
        const voteVal = votes[user.id];
        if (voteVal === undefined) {
            groupC.push(user);
        } else if (isNumericVote(voteVal)) {
            groupA.push(user);
        } else {
            groupB.push(user);
        }
    }

    groupA.sort((a, b) => a.name.localeCompare(b.name));

    const groups = [];
    if (groupA.length > 0) groups.push({ label: 'VOTERS', members: groupA });
    if (groupB.length > 0) groups.push({ label: 'OTHER', members: groupB });
    if (groupC.length > 0) groups.push({ label: 'SPECTATORS', members: groupC });

    return groups;
}

// ----- sub-components -----

function SmallAvatar({ user, size = 28 }) {
    const avatarPhotoURL = user?.avatarPhotoURL || null;
    const svgContent = useMemo(() => {
        if (avatarPhotoURL) return null;
        return getAvatarSvg(user);
    }, [user?.avatarSeed, avatarPhotoURL]);

    if (avatarPhotoURL) {
        return (
            <div
                className="rounded-full overflow-hidden shrink-0 bg-muted border border-border/50"
                style={{ width: size, height: size }}
            >
                <img
                    src={avatarPhotoURL}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
            </div>
        );
    }

    if (!svgContent) {
        const initials = (user?.name || '?')[0].toUpperCase();
        return (
            <div
                className="rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs"
                style={{ width: size, height: size }}
            >
                {initials}
            </div>
        );
    }

    return (
        <div
            className="rounded-full overflow-hidden shrink-0 bg-muted"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}

/** Small dot/icon overlaid at bottom-right of the avatar in collapsed mode */
function StatusDot({ user, votes, phase }) {
    if (user.role === 'SPECTATOR') {
        return (
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-background flex items-center justify-center">
                <Eye className="size-2 text-muted-foreground" />
            </span>
        );
    }
    const hasVoted = votes[user.id] !== undefined;
    if (phase === 'REVEALED') {
        return hasVoted ? (
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border border-background" />
        ) : (
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-muted border border-background" />
        );
    }
    if (hasVoted) {
        return <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border border-background" />;
    }
    return <span className="absolute bottom-0 right-0 size-3 rounded-full bg-muted-foreground/30 border border-background animate-pulse" />;
}

function StatusIcon({ user, votes, phase }) {
    if (user.role === 'SPECTATOR') {
        return <Eye className="size-3.5 text-muted-foreground" />;
    }
    if (phase === 'REVEALED') {
        return votes[user.id] !== undefined
            ? <Check className="size-3.5 text-green-500" />
            : <span className="text-[10px] text-muted-foreground">–</span>;
    }
    if (votes[user.id] !== undefined) {
        return <Check className="size-3.5 text-green-500" />;
    }
    return <Clock className="size-3 text-muted-foreground/60 animate-pulse" />;
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

function UserRow({ user, votes, phase, currentUser, anonymousMode, expanded, groups, groupsEnabled, isHost, onAssignGroup }) {
    const isMe = user.id === currentUser?.id;
    const voteVal = votes[user.id];
    const canAssign = isHost && user.role !== 'SPECTATOR' && groupsEnabled && groups?.length > 0;

    // Collapsed: avatar centered with status dot overlay
    if (!expanded) {
        return (
            <motion.div 
                layout
                initial={false}
                className="flex items-center justify-center py-1"
            >
                <div className="relative">
                    <SmallAvatar user={user} size={28} />
                    <StatusDot user={user} votes={votes} phase={phase} />
                </div>
            </motion.div>
        );
    }

    const rowContent = (
        <motion.div
            layout
            initial={false}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/20 dark:hover:bg-white/5 ${isMe ? 'bg-primary/5' : ''} ${canAssign ? 'cursor-pointer' : ''}`}
        >
            {/* Avatar */}
            <SmallAvatar user={user} size={28} />

            {/* Name + icons */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0 flex-wrap">
                    <span className={`text-xs font-medium truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                        {user.name}
                        {isMe && <span className="ml-1 text-[9px] text-muted-foreground">(you)</span>}
                    </span>
                    {user.isHost && <Crown className="size-2.5 text-amber-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                    {groupsEnabled && <GroupTag user={user} groups={groups} />}
                </div>
            </div>

            {/* Status / vote value */}
            {phase !== 'REVEALED' ? (
                <StatusIcon user={user} votes={votes} phase={phase} />
            ) : (
                <VoteBadge voteVal={voteVal} anonymousMode={anonymousMode} isMe={isMe} />
            )}
        </motion.div>
    );

    if (!canAssign) return rowContent;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {rowContent}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-44">
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ----- main component -----

const ParticipantPanel = ({ users = [], votes = {}, phase = 'IDLE', currentUser, roomId, anonymousMode = false, groups = [], groupsEnabled = false, isHost = false, onAssignGroup }) => {
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

    const orderedGroups = useMemo(
        () => getOrderedGroups(users, votes, phase),
        [users, votes, phase]
    );

    const totalCount = users.length;
    const votedCount = users.filter(u => u.role !== 'SPECTATOR' && votes[u.id] !== undefined).length;
    const eligibleCount = users.filter(u => u.role !== 'SPECTATOR').length;

    return (
        <div
            className={`hidden md:flex flex-col fixed left-0 bottom-0 z-30 transition-all duration-200 ease-in-out overflow-hidden
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-1 space-y-0.5">
                {orderedGroups.map((group, gi) => (
                    <React.Fragment key={gi}>
                        {isExpanded && group.label && phase === 'REVEALED' && (
                            <motion.div 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-2 pt-2 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 select-none"
                            >
                                {group.label}
                            </motion.div>
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
                            />
                        ))}
                    </React.Fragment>
                ))}

                {users.length === 0 && isExpanded && (
                    <p className="text-xs text-muted-foreground text-center py-4 px-2">No participants yet</p>
                )}
            </div>
        </div>
    );
};

export default ParticipantPanel;
