import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Crown, RefreshCw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const PlayerAvatar = ({ user, roomMode, size = 64, isCurrentUser, activeReaction }) => {
    const { socket } = useSocket();
    const avatarSvg = useMemo(() => {
        const avatar = createAvatar(avataaars, {
            seed: user.avatarSeed || user.name || user.id,
            size,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        });
        return avatar.toDataUri();
    }, [user.avatarSeed, user.name, user.id, size]);

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
                        } ${isCurrentUser ? 'cursor-pointer hover:scale-105 hover:border-banana-400' : ''}`}
                    style={{ width: size, height: size }}
                >
                    <img
                        src={avatarSvg}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                {isCurrentUser && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <RefreshCw className="text-white w-5 h-5 animate-spin-slow" />
                    </div>
                )}
                <span
                    className={`presence-dot !w-3.5 !h-3.5 ${isOnline ? 'presence-dot--online shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'presence-dot--offline'}`}
                />

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

            {/* Name + Host badge */}
            <span className="font-bold font-heading text-white text-[13px] md:text-sm leading-tight text-center truncate max-w-[100px] flex items-center justify-center gap-1.5 drop-shadow-md">
                {user.name}
                {user.isHost && <Crown size={12} className="text-banana-500 flex-shrink-0 drop-shadow-[0_0_5px_rgba(238,173,43,0.5)]" />}
            </span>

            {/* Role badge */}
            <span className={`
                text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold leading-none shadow-sm
                ${roomMode === 'STANDARD'
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-gray-500/50'
                    : user.role === 'DEV'
                        ? 'bg-gradient-to-r from-indigo-600/40 to-indigo-500/40 text-indigo-200 border border-indigo-500/50'
                        : 'bg-gradient-to-r from-rose-600/40 to-rose-500/40 text-rose-200 border border-rose-500/50'
                }
            `}>
                {roomMode === 'STANDARD' ? 'Estimator' : user.role}
            </span>
        </div>
    );
};

export default PlayerAvatar;
