import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Crown } from 'lucide-react';
import anonymousMonkeySvg from '../../assets/anonymous-monkey.svg';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../ui/tooltip';

const MONKEY_ALIASES = [
    'Bonobo', 'Macaque', 'Tamarin', 'Capuchin', 'Gibbon',
    'Mandrill', 'Baboon', 'Marmoset', 'Langur', 'Colobus',
    'Howler', 'Spider', 'Squirrel', 'Proboscis', 'Tarsier'
];

function getMonkeyAlias(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) % MONKEY_ALIASES.length;
    }
    return MONKEY_ALIASES[Math.abs(hash)];
}

const PlayerAvatar = ({ user, roomMode, size = 64, isCurrentUser, activeReaction, anonymousMode = false, hideDetails = false, groups = [], groupsEnabled = false }) => {
    const isAnon = anonymousMode && !isCurrentUser && user.role !== 'SPECTATOR';
    const displayName = isAnon ? getMonkeyAlias(user.id) : user.name;

    // Prefer real OAuth photo over dicebear avatar
    const avatarPhotoURL = isAnon ? null : (user.avatarPhotoURL || null);

    const avatarSvg = useMemo(() => {
        if (isAnon || avatarPhotoURL) return null;
        const avatar = createAvatar(avataaars, {
            seed: user.avatarSeed || user.name || user.id,
            size,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        });
        return avatar.toDataUri();
    }, [user.avatarSeed, user.name, user.id, size, isAnon, avatarPhotoURL]);

    const isOnline = user.connected !== false;

    return (
        <div className="flex flex-col items-center gap-2 min-w-0">
            {/* Avatar with presence dot */}
            <div className="relative flex-shrink-0 group">
                <div
                    className={`rounded-full overflow-hidden border-2 bg-slate-800 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${isOnline
                        ? 'border-white/10 ring-4 ring-white/5'
                        : 'border-white/20 opacity-50 grayscale'
                        }`}
                    style={{ width: size, height: size }}
                >
                    <img
                        src={isAnon ? anonymousMonkeySvg : (avatarPhotoURL || avatarSvg)}
                        alt={isAnon ? 'Anonymous' : user.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                </div>
                {/* Active Emoji Reaction Overlay */}
                {activeReaction?.icon && (
                    <div
                        key={activeReaction.id}
                        className="absolute -top-4 -right-2 text-3xl md:text-4xl animate-in zoom-in-50 spin-in-12 duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] pointer-events-none z-50 origin-bottom-left filter drop-shadow hover:scale-125 transition-transform"
                    >
                        {activeReaction.icon}
                    </div>
                )}
            </div>

            {/* Details */}
            {!hideDetails && (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="font-bold text-foreground text-[13px] md:text-sm leading-tight text-center flex items-center justify-center gap-1 drop-shadow-md cursor-default max-w-[80px]">
                                <span className="truncate block min-w-0">{displayName}</span>
                                {user.isHost && !isAnon && <Crown size={12} className="text-primary flex-shrink-0" />}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs font-semibold">
                            {displayName}
                            {user.isHost && !isAnon && ' 👑'}
                        </TooltipContent>
                    </Tooltip>

                    {(() => {
                        const group = groupsEnabled && user.groupId ? groups.find(g => g.id === user.groupId) : null;
                        if (group) {
                            return (
                                <span
                                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full leading-none shadow-sm border"
                                    style={{
                                        color: group.color,
                                        borderColor: group.color + '50',
                                        backgroundColor: group.color + '20',
                                    }}
                                >
                                    {group.name}
                                </span>
                            );
                        }
                        return null;
                    })()}
                </>
            )}
        </div>
    );
};

export default PlayerAvatar;
