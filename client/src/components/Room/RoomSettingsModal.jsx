import React from 'react';
import { X, Settings, Sparkles, Zap, Power, EyeOff, LayoutPanelLeft, AlertTriangle } from 'lucide-react';

const PRESETS = [
    { id: 'FIBONACCI_MODIFIED', name: 'Modified Fibonacci', values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'] },
    { id: 'FIBONACCI', name: 'Fibonacci', values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] },
    { id: 'TSHIRT', name: 'T-Shirt Sizes', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'POWERS_OF_2', name: 'Powers of 2', values: [0, 1, 2, 4, 8, 16, 32, 64] },
];

const RoomSettingsModal = ({ 
    isOpen, 
    onClose, 
    funFeatures, 
    autoReveal, 
    anonymousMode, 
    votingSystem,
    phase,
    onUpdateSettings, 
    onEndSession 
}) => {
    if (!isOpen) return null;

    const isRoundActive = phase !== 'IDLE' && phase !== 'REVEALED';

    const handleVoteSystemChange = (preset) => {
        if (isRoundActive) {
            alert('Cannot change voting system while a round is in progress. Please reveal or reset the round first.');
            return;
        }
        onUpdateSettings({ votingSystem: preset });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-[#0c0c0c] backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                        <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-banana-500/10">
                            <Settings className="w-6 h-6 text-orange-500 dark:text-banana-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Room Settings</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">Configuration Dashboard</p>
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
                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Voting System Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <LayoutPanelLeft className="w-5 h-5 text-orange-500 dark:text-banana-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Voting System</h3>
                            </div>
                            {isRoundActive && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                                    <AlertTriangle size={12} />
                                    Active Round - Locked
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {PRESETS.map((preset) => {
                                const isSelected = votingSystem?.type === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => handleVoteSystemChange(preset)}
                                        disabled={isRoundActive && !isSelected}
                                        className={`p-4 rounded-2xl border text-left transition-all duration-300
                                            ${isSelected 
                                                ? 'bg-orange-500/10 dark:bg-banana-500/10 border-orange-500 dark:border-banana-500 text-orange-600 dark:text-banana-400 shadow-[0_0_20px_rgba(255,184,0,0.1)]' 
                                                : 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 text-gray-500 hover:border-orange-500/30 dark:hover:border-banana-500/30'
                                            } ${isRoundActive && !isSelected ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                                    >
                                        <div className="font-bold text-sm mb-1">{preset.name}</div>
                                        <div className="text-[10px] opacity-60 truncate">{preset.values.join(', ')}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-white/5"></div>

                    {/* Toggles Grid */}
                    <div className="space-y-6">
                        {/* Setting: Fun Features */}
                        <div className="flex items-center justify-between gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 transition-colors ${funFeatures ? 'bg-orange-500/10 dark:bg-banana-500/10 text-orange-500 dark:text-banana-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-0.5">Celebration Effects</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug max-w-[240px]">Show confetti and play sounds when the team reaches consensus.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onUpdateSettings({ funFeatures: !funFeatures })}
                                className={`relative shrink-0 w-12 h-6.5 rounded-full transition-all duration-300 shadow-inner ${funFeatures ? 'bg-orange-500 dark:bg-banana-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all bg-white shadow-md ${funFeatures ? 'left-6.5' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Setting: Auto Reveal */}
                        <div className="flex items-center justify-between gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 transition-colors ${autoReveal ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-0.5">Instant Reveal</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug max-w-[240px]">Automatically reveal cards once every eligible team member has voted.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onUpdateSettings({ autoReveal: !autoReveal })}
                                className={`relative shrink-0 w-12 h-6.5 rounded-full transition-all duration-300 shadow-inner ${autoReveal ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all bg-white shadow-md ${autoReveal ? 'left-6.5' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Setting: Anonymous Mode */}
                        <div className="flex items-center justify-between gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 transition-colors ${anonymousMode ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                    <EyeOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-0.5">Privacy Mode</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug max-w-[240px]">Hide player identities during active voting to prevent anchoring bias.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onUpdateSettings({ anonymousMode: !anonymousMode })}
                                className={`relative shrink-0 w-12 h-6.5 rounded-full transition-all duration-300 shadow-inner ${anonymousMode ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all bg-white shadow-md ${anonymousMode ? 'left-6.5' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                        <h3 className="text-rose-600 dark:text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] px-1">Critical Controls</h3>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to end this session for everyone?')) {
                                    onEndSession();
                                }
                            }}
                            className="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold w-full py-4 rounded-[20px] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            <Power className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                            Terminate Voting Session
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RoomSettingsModal;
