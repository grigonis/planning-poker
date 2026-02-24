import React, { useState } from 'react';
import { ArrowRight, X, User, Users, Split, Shield, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const CreateSessionModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [gameMode, setGameMode] = useState('STANDARD');
    const [role, setRole] = useState('DEV');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { socket } = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);

        let finalRole = role;
        if (gameMode === 'STANDARD') {
            finalRole = role === 'OBSERVER' ? 'OBSERVER' : 'DEV';
        }

        socket.emit('create_room', { name, role: finalRole, gameMode }, (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            navigate(`/room/${response.roomId}`, {
                state: {
                    name,
                    role: finalRole,
                    userId: response.userId,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    users: response.users
                }
            });
            onClose();
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 transition-colors duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Create New Session</h2>
                <p className="text-gray-500 dark:text-gray-400 font-light mb-6">Configure your planning poker room.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-600 dark:text-gray-300">Your Display Name</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-heading"
                                placeholder="e.g. Scrum Master"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-600 dark:text-gray-300">Game Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => { setGameMode('STANDARD'); setRole('DEV'); }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${gameMode === 'STANDARD'
                                    ? 'bg-banana-500/10 border-banana-500 text-banana-500'
                                    : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10'
                                    }`}
                            >
                                <Users size={24} />
                                <span className="text-xs font-bold font-heading">Standard</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setGameMode('SPLIT'); setRole('DEV'); }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${gameMode === 'SPLIT'
                                    ? 'bg-banana-500/10 border-banana-500 text-banana-500'
                                    : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10'
                                    }`}
                            >
                                <Split size={24} />
                                <span className="text-xs font-bold font-heading">Split Roles</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-light px-1">
                            {gameMode === 'STANDARD'
                                ? "Everyone votes together. Single average is calculated."
                                : "Developers and QA vote separately with distinct averages."}
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-600 dark:text-gray-300">Your Role</label>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-white/5">
                            {gameMode === 'SPLIT' ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setRole('DEV')}
                                        className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'DEV' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        Developer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('QA')}
                                        className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'QA' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        QA
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setRole('DEV')}
                                    className={`col-span-2 py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'DEV' ? 'bg-banana-500 text-dark-900 shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    Estimator
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setRole('OBSERVER')}
                                className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'OBSERVER' ? 'bg-gray-600 dark:bg-gray-700 text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            >
                                Observer
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold font-heading py-3.5 rounded-xl shadow-lg shadow-banana-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Creating...' : 'Start Session'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSessionModal;
