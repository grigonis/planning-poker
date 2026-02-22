import React, { useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';

const EMOJIS = [
    { id: 'smile', icon: '😄', label: 'Smile' },
    { id: 'thumbs', icon: '👍', label: 'Thumbs Up' },
    { id: 'party', icon: '🎉', label: 'Party' },
    { id: 'heart', icon: '💖', label: 'Heart' },
    { id: 'coffee', icon: '☕', label: 'Coffee' },
];

const EmojiReactions = ({ roomId, phase }) => {
    const { socket } = useSocket();

    // We only show the bar when NOT voting actively.
    const isVoting = phase === 'VOTING' || phase.startsWith('PARTIAL');

    const handleSendEmoji = useCallback((emoji) => {
        if (!socket) return;
        socket.emit('send_reaction', { roomId, emojiId: emoji.id, emojiIcon: emoji.icon });
    }, [roomId, socket]);

    if (isVoting) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-dark-800/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-500">
            <span className="text-[10px] font-bold font-heading uppercase tracking-widest text-slate-400 border-r border-white/10 pr-4">React</span>
            <div className="flex gap-2">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji.id}
                        onClick={() => handleSendEmoji(emoji)}
                        className="text-xl hover:scale-125 transition-transform active:scale-90 opacity-80 hover:opacity-100"
                        title={emoji.label}
                    >
                        {emoji.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiReactions;
