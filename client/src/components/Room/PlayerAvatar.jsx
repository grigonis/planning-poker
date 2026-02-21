import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { Crown } from 'lucide-react';

const PlayerAvatar = ({ user, roomMode, size = 56 }) => {
    const avatarSvg = useMemo(() => {
        const avatar = createAvatar(avataaars, {
            seed: user.name || user.id,
            size,
        });
        return avatar.toDataUri();
    }, [user.name, user.id, size]);

    const isOnline = user.connected !== false;

    return (
        <div className="flex flex-col items-center gap-1.5 min-w-0">
            {/* Avatar with presence dot */}
            <div className="relative flex-shrink-0">
                <div
                    className={`rounded-full overflow-hidden border-2 bg-slate-800 transition-all duration-300 ${isOnline
                            ? 'border-banana-500/60 ring-4 ring-banana-500/10'
                            : 'border-white/20 opacity-50 grayscale'
                        }`}
                    style={{ width: size, height: size }}
                >
                    <img
                        src={avatarSvg}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <span
                    className={`presence-dot ${isOnline ? 'presence-dot--online' : 'presence-dot--offline'}`}
                />
            </div>

            {/* Name + Host badge */}
            <span className="font-bold font-heading text-white text-xs leading-tight text-center truncate max-w-[80px] flex items-center gap-1">
                {user.name}
                {user.isHost && <Crown size={10} className="text-banana-500 flex-shrink-0" />}
            </span>

            {/* Role badge */}
            <span className={`
                text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold leading-none
                ${roomMode === 'STANDARD'
                    ? 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
                    : user.role === 'DEV'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }
            `}>
                {roomMode === 'STANDARD' ? 'Estimator' : user.role}
            </span>
        </div>
    );
};

export default PlayerAvatar;
