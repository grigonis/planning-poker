import React, { useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Clock, Eye, Crown, Users } from 'lucide-react';
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

    // Sort numeric voters highest to lowest
    groupA.sort((a, b) => Number(votes[b.id]) - Number(votes[a.id]));

    const groups = [];
    if (groupA.length > 0) groups.push({ label: 'VOTERS', members: groupA });
    if (groupB.length > 0) groups.push({ label: 'OTHER', members: groupB });
    if (groupC.length > 0) groups.push({ label: 'SPECTATORS', members: groupC });

    return groups;
}

// ----- sub-components -----

function SmallAvatar({ user, size = 28 }) {
    const svgContent = useMemo(() => getAvatarSvg(user), [user?.avatarSeed]);

    if (!svgContent) {
        // Fallback: initials
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

function StatusIcon({ user, votes, phase }) {
    if (user.role === 'SPECTATOR') {
        return <Eye className="size-3.5 text-muted-foreground" />;
    }
    if (phase === 'REVEALED') {
        return votes[user.id] !== undefined
            ? <Check className="size-3.5 text-green-500" />
            : <span className="text-[10px] text-muted-foreground">–</span>;
    }
    // Voting / Idle phase
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

function UserRow({ user, votes, phase, currentUser, anonymousMode, expanded }) {
    const isMe = user.id === currentUser?.id;
    const voteVal = votes[user.id];

    return (
        <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/20 dark:hover:bg-white/5 ${isMe ? 'bg-primary/5' : ''}`}
        >
            {/* Avatar */}
            <SmallAvatar user={user} size={28} />

            {/* Name + icons (only when expanded) */}
            {expanded && (
                <>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                            <span className={`text-xs font-medium truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                                {user.name}
                                {isMe && <span className="ml-1 text-[9px] text-muted-foreground">(you)</span>}
                            </span>
                            {user.isHost && <Crown className="size-2.5 text-amber-500 shrink-0" />}
                        </div>
                        {user.role === 'SPECTATOR' && (
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Spectator</span>
                        )}
                    </div>

                    {/* Status / vote value */}
                    {phase !== 'REVEALED' ? (
                        <StatusIcon user={user} votes={votes} phase={phase} />
                    ) : (
                        <VoteBadge voteVal={voteVal} anonymousMode={anonymousMode} isMe={isMe} />
                    )}
                </>
            )}

            {/* Collapsed: just status dot */}
            {!expanded && (
                <div className="flex-1 flex justify-center">
                    <StatusIcon user={user} votes={votes} phase={phase} />
                </div>
            )}
        </div>
    );
}

// ----- main component -----

const ParticipantPanel = ({ users = [], votes = {}, phase = 'IDLE', currentUser, roomId, anonymousMode = false }) => {
    const storageKey = `keystimate_panel_open_${roomId}`;

    const [isExpanded, setIsExpanded] = useState(() => {
        try {
            return localStorage.getItem(storageKey) === 'true';
        } catch {
            return false;
        }
    });

    // Track navbar height so the panel never starts behind it
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

    const groups = useMemo(
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
                {groups.map((group, gi) => (
                    <React.Fragment key={gi}>
                        {/* Group divider label */}
                        {isExpanded && group.label && phase === 'REVEALED' && (
                            <div className="px-2 pt-2 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 select-none">
                                {group.label}
                            </div>
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
