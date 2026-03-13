import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Crown, RefreshCw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import anonymousMonkeySvg from '../../assets/anonymous-monkey.svg';
import { Badge } from '../ui/badge';

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
    const { socket } = useSocket();
    const isAnon = anonymousMode && !isCurrentUser && user.role !== 'SPECTATOR';
    const displayName = isAnon ? getMonkeyAlias(user.id) : user.name;

    const avatarSvg = useMemo(() => {
        if (isAnon) return null;
        const avatar = createAvatar(avataaars, {
            seed: user.avatarSeed || user.name || user.id,
            size,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        });
        return avatar.toDataUri();
    }, [user.avatarSeed, user.name, user.id, size, isAnon]);

    const isOnline = user.connected !== false;

    const handleAvatarClick = () => {
        if (isCurrentUser && socket?.connected) {
            socket.emit('update_avatar', { roomId: socket.data?.roomId || window.location.pathname.split('/').pop() });
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 min-w-0">
            {/* Avatar with presence dot */}
            <div className="relative flex-shrink-0 group">
                <div
                    onClick={handleAvatarClick}
                    className={`rounded-full overflow-hidden border-2 bg-slate-800 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${isOnline
                        ? 'border-white/10 ring-4 ring-white/5 group-hover:ring-white/10'
                        : 'border-white/20 opacity-50 grayscale'
                        } ${isCurrentUser ? 'cursor-pointer hover:scale-105 hover:border-primary' : ''}`}
                    style={{ width: size, height: size }}
                >
                    <img
                        src={isAnon ? anonymousMonkeySvg : avatarSvg}
                        alt={isAnon ? 'Anonymous' : user.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                {isCurrentUser && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <RefreshCw className="text-white w-5 h-5 animate-spin-slow" />
                    </div>
                )}
                {/* Active Emoji Reaction Overlay */}
                {activeReaction?.icon && (
                    <div
                        key={activeReaction.id} // Force animation restart on new reaction
                        className="absolute -top-4 -right-2 text-3xl md:text-4xl animate-in zoom-in-50 spin-in-12 duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] pointer-events-none z-50 origin-bottom-left filter drop-shadow hover:scale-125 transition-transform"
                    >
                        {activeReaction.icon}
                    </div>
                )}
            </div>

            {/* Details */}
            {!hideDetails && (
                <>
                    <span className="font-bold text-foreground text-[13px] md:text-sm leading-tight text-center truncate max-w-[100px] flex items-center justify-center gap-1.5 drop-shadow-md">
                        {displayName}
                        {user.isHost && !isAnon && <Crown size={12} className="text-primary flex-shrink-0" />}
                    </span>

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
                        // Only show role badge when groups are disabled
                        if (!groupsEnabled) {
                            return (
                                <Badge 
                                    variant="secondary" 
                                    className={`
                                        text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold leading-none shadow-sm border-none
                                        ${user.role === 'SPECTATOR'
                                            ? 'bg-muted text-muted-foreground'
                                            : roomMode === 'STANDARD'
                                                ? 'bg-primary/20 text-primary'
                                                : user.role === 'DEV'
                                                    ? 'bg-indigo-500/20 text-indigo-400'
                                                    : 'bg-rose-500/20 text-rose-400'
                                        }
                                    `}
                                >
                                    {user.role === 'SPECTATOR' ? 'Spectator' : (roomMode === 'STANDARD' ? 'Estimator' : user.role)}
                                </Badge>
                            );
                        }
                        // Groups enabled but user has no group — show nothing
                        return null;
                    })()}
                </>
            )}
        </div>
    );
};

export default PlayerAvatar;
