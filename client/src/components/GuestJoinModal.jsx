import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, AlertCircle } from 'lucide-react';

const GuestJoinModal = ({ isOpen, roomId, onJoinSuccess }) => {
    const { socket } = useSocket();
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEV'); // Default
    const [gameMode, setGameMode] = useState(null); // 'STANDARD' | 'SPLIT'
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("GuestJoinModal Effect: Open:", isOpen, "Socket:", !!socket, "RoomId:", roomId);
        if (!isOpen || !socket || !roomId) return;

        setLoading(true);
        socket.emit('check_room', { roomId }, (response) => {
            setLoading(false);
            if (response.exists) {
                setGameMode(response.mode);
                // Set default role based on mode
                if (response.mode === 'STANDARD') setRole('DEV'); // 'Estimator'
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
                    role, // Join handler might standardize this, but we pass current intent
                    userId: response.userId,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    users: response.users // Pass the initial user list
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">

                {loading ? (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-banana-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-heading">Checking Room...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 font-heading">Unable to Join</h2>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <a href="/" className="text-banana-500 hover:text-banana-400 font-bold font-heading hover:underline">
                            Return to Home
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="bg-banana-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-banana-500/20">
                                <Users size={32} className="text-banana-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 font-heading">Join {gameMode === 'STANDARD' ? 'Planning' : 'Split'} Session</h2>
                            <p className="text-gray-400 text-sm">Room: <span className="font-mono text-banana-200">{roomId}</span></p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-heading">
                                    Your Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Alex"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-banana-500/50 focus:ring-1 focus:ring-banana-500/50 transition-all font-bold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-heading">
                                    Join As
                                </label>
                                <div className="grid gap-3">
                                    {gameMode === 'STANDARD' ? (
                                        // STANDARD MODE ROLES
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setRole('DEV')}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${role === 'DEV'
                                                    ? 'bg-banana-500 text-dark-900 border-banana-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
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
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="font-bold font-heading relative z-10">Observer</div>
                                                <div className="text-xs opacity-80 relative z-10">View only</div>
                                            </button>
                                        </>
                                    ) : (
                                        // SPLIT MODE ROLES
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setRole('DEV')}
                                                    className={`p-3 rounded-xl border text-left transition-all ${role === 'DEV'
                                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-bold font-heading">Developer</div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRole('QA')}
                                                    className={`p-3 rounded-xl border text-left transition-all ${role === 'QA'
                                                        ? 'bg-rose-500 text-white border-rose-500'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
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
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
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
                                className="w-full bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold font-heading py-4 rounded-xl shadow-[0_4px_0_0_#e69900] hover:shadow-[0_2px_0_0_#e69900] hover:translate-y-[2px] transition-all"
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
