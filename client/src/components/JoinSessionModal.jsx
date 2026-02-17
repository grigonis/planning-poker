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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold font-heading text-white mb-2">Join Session</h2>
                <p className="text-gray-400 font-light mb-8">Enter the room code to join your team.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-300">Display Name</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-heading"
                                placeholder="e.g. Alex Rivera"
                            />
                        </div>
                    </div>

                    {/* Room Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-300">Room Code</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                                <Hash size={18} />
                            </div>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-heading uppercase tracking-wider"
                                placeholder="e.g. ABCD"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-300">Role</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-900 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setRole('DEV')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold font-heading transition-all ${role === 'DEV'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <Code size={18} />
                                Developer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('QA')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold font-heading transition-all ${role === 'QA'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-300'
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
                        className="w-full mt-2 bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold font-heading py-3.5 rounded-xl shadow-lg shadow-banana-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
