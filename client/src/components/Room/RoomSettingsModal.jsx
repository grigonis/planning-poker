import React, { useState } from 'react';
import { X, Settings, Sparkles, Zap, Power } from 'lucide-react';

const RoomSettingsModal = ({ isOpen, onClose, funFeatures, autoReveal, onUpdateSettings, onEndSession }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-[#151921]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 transition-colors duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <Settings className="w-5 h-5 text-orange-500 dark:text-banana-500" />
                        <h2 className="text-xl font-bold font-heading">Room Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Setting: Fun Features */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-lg shrink-0 ${funFeatures ? 'bg-orange-500/10 dark:bg-banana-500/10 text-orange-500 dark:text-banana-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium mb-1">Fun Features</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">Enable sound effects and celebration confetti when consensus is reached.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onUpdateSettings({ funFeatures: !funFeatures })}
                            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${funFeatures ? 'bg-orange-500 dark:bg-banana-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all bg-white ${funFeatures ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-white/5"></div>

                    {/* Setting: Auto Reveal */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-lg shrink-0 ${autoReveal ? 'bg-green-500/10 text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium mb-1">Auto Reveal</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">Automatically reveal cards once all eligible team members have voted.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onUpdateSettings({ autoReveal: !autoReveal })}
                            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${autoReveal ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all bg-white ${autoReveal ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-white/5"></div>

                    {/* Setting: End Session */}
                    <div className="flex flex-col gap-2 mt-4">
                        <h3 className="text-rose-600 dark:text-rose-500 font-bold font-heading text-sm px-1 mb-1">Danger Zone</h3>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to end this session? All players will be disconnected.')) {
                                    onEndSession();
                                }
                            }}
                            className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-rose-500/30 text-rose-700 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 font-bold font-heading w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group"
                        >
                            <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Terminate Session
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RoomSettingsModal;
