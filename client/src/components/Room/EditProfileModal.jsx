import React, { useState, useEffect, useMemo } from 'react';
import { X, RefreshCw, User, ChevronRight } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Generate some initial preset seeds for avatars
const PRESET_SEEDS = [
    'Oliver', 'Alex', 'Sam', 'Taylor', 'Jordan', 
    'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 
    'Reese', 'Blake'
];

const EditProfileModal = ({ 
    isOpen, 
    onClose, 
    currentUser, 
    onUpdateProfile 
}) => {
    const [name, setName] = useState(currentUser?.name || '');
    const [selectedSeed, setSelectedSeed] = useState(currentUser?.avatarSeed || currentUser?.name || currentUser?.id || 'Oliver');
    const [presetSeeds, setPresetSeeds] = useState(PRESET_SEEDS);

    useEffect(() => {
        if (isOpen) {
            setName(currentUser?.name || '');
            setSelectedSeed(currentUser?.avatarSeed || currentUser?.name || currentUser?.id || 'Oliver');
        }
    }, [isOpen, currentUser]);

    // Derived state for the large preview avatar
    const previewAvatarSvg = useMemo(() => {
        const avatar = createAvatar(avataaars, {
            seed: selectedSeed,
            size: 120,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        });
        return avatar.toDataUri();
    }, [selectedSeed]);

    const handleShuffle = () => {
        const newSeeds = presetSeeds.map(() => Math.random().toString(36).substring(7));
        setPresetSeeds(newSeeds);
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onUpdateProfile({ name: name.trim(), avatarSeed: selectedSeed });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-[#0c0c0c] backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 dark:from-white/10 dark:to-white/5 border border-indigo-500/20 dark:border-white/10 shadow-inner">
                            <User className="w-6 h-6 text-indigo-500 dark:text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/60">Edit Profile</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Customize Your Look</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
                    
                    {/* Top Row: Selected Avatar & Name Input */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white dark:border-[#202020] shadow-xl bg-slate-800 ring-4 ring-indigo-500/20 dark:ring-white/10">
                                <img src={previewAvatarSvg} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Display Name</label>
                            <p className="text-[10px] text-gray-400 font-medium mb-1">This is how other users will see you.</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                placeholder="Your Name"
                                maxLength={24}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-white/5"></div>

                    {/* Avatar Selection Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Select an avatar</h3>
                            <button 
                                onClick={handleShuffle}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Shuffle
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {presetSeeds.map((seed) => {
                                const avatar = createAvatar(avataaars, {
                                    seed: seed,
                                    size: 60,
                                    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
                                });
                                const svgUri = avatar.toDataUri();
                                const isSelected = selectedSeed === seed;
                                
                                return (
                                    <button
                                        key={seed}
                                        type="button"
                                        onClick={() => setSelectedSeed(seed)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-slate-800 ${
                                            isSelected 
                                                ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105 z-10' 
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-white/20 hover:scale-105 shadow-md'
                                        }`}
                                    >
                                        <img src={svgUri} alt={`Avatar ${seed}`} className="w-full h-full object-cover" loading="lazy" />
                                        {isSelected && (
                                            <div className="absolute inset-0 ring-2 ring-indigo-500 ring-inset rounded-2xl pointer-events-none"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Save Changes
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
