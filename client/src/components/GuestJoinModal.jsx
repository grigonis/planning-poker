import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, AlertCircle } from 'lucide-react';

const GuestJoinModal = ({ isOpen, roomId, onJoinSuccess }) => {
    const { socket } = useSocket();
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEV');
    const [gameMode, setGameMode] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !socket || !roomId) return;

        setLoading(true);
        socket.emit('check_room', { roomId }, (response) => {
            setLoading(false);
            if (response.exists) {
                setGameMode(response.mode);
                if (response.mode === 'STANDARD') setRole('DEV');
                else setRole('DEV');
            } else {
                setError("Room not found. Please check the URL.");
            }
        });
    }, [isOpen, socket, roomId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        socket.emit('join_room', { roomId, name, role }, (response) => {
            if (response.error) {
                setError(response.error);
            } else {
                onJoinSuccess({
                    name,
                    role,
                    userId: response.userId,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    users: response.users
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300 transition-colors duration-300">

                {loading ? (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-banana-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 font-heading">Checking Room...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Unable to Join</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                        <a href="/" className="text-orange-500 dark:text-banana-500 hover:text-banana-400 font-bold font-heading hover:underline">
                            Return to Home
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="bg-orange-500/10 dark:bg-banana-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20 dark:border-banana-500/20">
                                <Users size={32} className="text-orange-500 dark:text-banana-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Join {gameMode === 'STANDARD' ? 'Planning' : 'Split'} Session</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Room: <span className="font-mono text-orange-500 dark:text-banana-500">{roomId}</span></p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-heading">
                                    Your Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Alex"
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-banana-500/50 focus:ring-1 focus:ring-banana-500/50 transition-all font-bold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-heading">
                                    Join As
                                </label>
                                <div className="grid gap-3">
                                    {gameMode === 'STANDARD' ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setRole('DEV')}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${role === 'DEV'
                                                    ? 'bg-orange-500 text-white border-orange-500 dark:bg-banana-500 dark:text-dark-900 dark:border-banana-500 shadow-[0_0_20px_rgba(255,92,0,0.2)] dark:shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="font-bold font-heading relative z-10">Estimator</div>
                                                <div className="text-xs opacity-80 relative z-10">Vote on stories</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('OBSERVER')}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${role === 'OBSERVER'
                                                    ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="font-bold font-heading relative z-10">Observer</div>
                                                <div className="text-xs opacity-80 relative z-10">View only</div>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setRole('DEV')}
                                                    className={`p-3 rounded-xl border text-left transition-all ${role === 'DEV'
                                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-bold font-heading">Developer</div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRole('QA')}
                                                    className={`p-3 rounded-xl border text-left transition-all ${role === 'QA'
                                                        ? 'bg-rose-500 text-white border-rose-500'
                                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-bold font-heading">QA</div>
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRole('OBSERVER')}
                                                className={`p-3 rounded-xl border text-left transition-all ${role === 'OBSERVER'
                                                    ? 'bg-purple-500 text-white border-purple-500'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="font-bold font-heading">Observer</div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-orange-500 dark:bg-banana-500 hover:bg-orange-600 dark:hover:bg-banana-400 text-white dark:text-dark-900 font-bold font-heading py-4 rounded-xl shadow-[0_4px_0_0_#cc4a00] dark:shadow-[0_4px_0_0_#e69900] hover:shadow-[0_2px_0_0_#cc4a00] dark:hover:shadow-[0_2px_0_0_#e69900] hover:translate-y-[2px] transition-all"
                            >
                                Join Session
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default GuestJoinModal;
