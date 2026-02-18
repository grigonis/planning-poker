import React, { useState } from 'react';
import { ArrowRight, X, User, Hash, Code, Bug, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const JoinSessionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Room Code, 2: Name & Role
    const [roomCode, setRoomCode] = useState('');
    const [roomMode, setRoomMode] = useState('STANDARD'); // Fetched from server

    const [name, setName] = useState('');
    const [role, setRole] = useState('DEV');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const socket = useSocket();

    const handleCheckRoom = (e) => {
        e.preventDefault();
        if (!roomCode.trim()) return;

        setIsLoading(true);
        socket.emit('check_room', { roomId: roomCode.toUpperCase() }, (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            setRoomMode(response.mode || 'STANDARD');

            // Set default role based on mode
            if (response.mode === 'STANDARD') setRole('DEV');
            else setRole('DEV');

            setStep(2);
        });
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        socket.emit('join_room', { roomId: roomCode.toUpperCase(), name, role }, (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            navigate(`/room/${roomCode.toUpperCase()}`, {
                state: {
                    name,
                    role,
                    userId: socket.id,
                    gameMode: roomMode
                }
            });
            onClose();
            // Reset state after close
            setTimeout(() => {
                setStep(1);
                setName('');
                setRoomCode('');
            }, 300);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200`}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold font-heading text-white mb-2">Join Session</h2>
                        <p className="text-gray-400 font-light mb-8">Enter the room code to join your team.</p>

                        <form onSubmit={handleCheckRoom} className="space-y-6">
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
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!roomCode.trim() || isLoading}
                                className="w-full bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold font-heading py-3.5 rounded-xl shadow-lg shadow-banana-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Checking...' : 'Continue'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold font-heading text-white mb-2">Join Room: {roomCode.toUpperCase()}</h2>
                        <p className="text-gray-400 font-light mb-6">
                            {roomMode === 'STANDARD' ? 'Standard Mode (Unified Voting)' : 'Split Mode (Dev & QA)'}
                        </p>

                        <form onSubmit={handleJoin} className="space-y-6">
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
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold font-heading text-gray-300">Your Role</label>
                                <div className="grid grid-cols-3 gap-2 p-1 bg-dark-900 rounded-xl border border-white/5">
                                    {roomMode === 'SPLIT' ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setRole('DEV')}
                                                className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'DEV' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Developer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('QA')}
                                                className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'QA' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                QA
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setRole('DEV')}
                                            className={`col-span-2 py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'DEV' ? 'bg-banana-500 text-dark-900 shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Estimator
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setRole('OBSERVER')}
                                        className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${role === 'OBSERVER' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
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
                                {isLoading ? 'Join Session' : 'Enter Room'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinSessionModal;
