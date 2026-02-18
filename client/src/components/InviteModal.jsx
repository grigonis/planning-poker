import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';

const InviteModal = ({ isOpen, onClose, roomId }) => {
    const [copied, setCopied] = useState(false);
    const inviteLink = `${window.location.origin}/room/${roomId}`;

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-banana-500/10 flex items-center justify-center text-banana-500 mb-2">
                        <Link size={24} />
                    </div>

                    <h2 className="text-xl font-bold font-heading text-white">Invite Team</h2>
                    <p className="text-sm text-gray-400">
                        Share this link with your team to let them join this session.
                    </p>

                    <div className="w-full flex items-center gap-2 mt-2 p-1.5 bg-dark-900 border border-white/10 rounded-xl">
                        <div className="flex-1 px-3 py-2 text-sm text-gray-300 truncate font-mono bg-transparent">
                            {inviteLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`p-2.5 rounded-lg transition-all ${copied
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-banana-500 text-dark-900 hover:bg-banana-400'
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
