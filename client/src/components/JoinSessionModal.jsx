import React, { useState } from 'react';
import { ArrowRight, X, User, Hash, Code, Bug } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const JoinSessionModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [role, setRole] = useState('DEV');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const socket = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !roomCode.trim()) return;

        setIsLoading(true);
        // Emulate join_room logic
        socket.emit('join_room', { roomId: roomCode.toUpperCase(), name, role }, (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            navigate(`/room/${roomCode.toUpperCase()}`, { state: { name, role, userId: socket.id } });
            onClose();
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Join Session</h2>
                <p className="text-slate-400 mb-6">Enter the room code to join your team.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Display Name</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="e.g. Alex Rivera"
                            />
                        </div>
                    </div>

                    {/* Room Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Room Code</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <Hash size={18} />
                            </div>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                                placeholder="e.g. ABCD"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Role</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setRole('DEV')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'DEV'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Code size={18} />
                                Developer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('QA')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'QA'
                                        ? 'bg-rose-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Bug size={18} />
                                QA
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || !roomCode.trim() || isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Joining...' : 'Join Session'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinSessionModal;
