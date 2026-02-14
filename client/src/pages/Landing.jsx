import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { User, Hash, ArrowRight, Code, Bug } from 'lucide-react';

const Landing = () => {
    const [isJoinMode, setIsJoinMode] = useState(true);
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [role, setRole] = useState('DEV');
    const navigate = useNavigate();
    const socket = useSocket();

    const handleAction = () => {
        if (!name) return alert("Jau cia gal netestuok... Nebent netycia pamirsai varda irasyti :)");

        if (isJoinMode) {
            if (!roomCode) return alert("Please enter room code");
            socket.emit('join_room', { roomId: roomCode.toUpperCase(), name, role }, (response) => {
                if (response.error) return alert(response.error);
                navigate(`/room/${roomCode.toUpperCase()}`, { state: { name, role, userId: socket.id } });
            });
        } else {
            socket.emit('create_room', (response) => {
                navigate(`/room/${response.roomId}`, { state: { name, role: 'HOST', userId: response.userId } });
            });
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-0 bg-white md:bg-gray-50">
            <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

                {/* Left: Static Image (4:5 Ratio Enforced via Aspect Class) */}
                <div className="hidden lg:block relative w-full aspect-[4/5]">
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Planning Poker"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>

                {/* Right: Login Form */}
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 h-full">
                    <h1 className="text-3xl font-bold text-slate-900 font-display mb-8">
                        {isJoinMode ? "Join a Planning Session" : "Create a New Room"}
                    </h1>

                    <div className="space-y-6">

                        {/* Display Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 block">Display Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="e.g. Alex Rivera"
                                />
                            </div>
                        </div>

                        {isJoinMode && (
                            <>
                                {/* Room ID Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 block">Room ID</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Hash size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter 5-char code"
                                        />
                                    </div>
                                </div>

                                {/* Role Switcher */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-600 block">Select Your Role</label>
                                    <div className="bg-slate-100 p-1 rounded-2xl flex relative">
                                        {/* Animated Background Slider */}
                                        <div
                                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-xl shadow-sm transition-all duration-300 ease-out ${role === 'QA' ? 'left-[calc(50%)]' : 'left-1'
                                                }`}
                                        ></div>

                                        <button
                                            onClick={() => setRole('DEV')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${role === 'DEV' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            <Code size={20} />
                                            <span className="font-bold text-sm">Developer</span>
                                        </button>

                                        <button
                                            onClick={() => setRole('QA')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${role === 'QA' ? 'text-white' : 'text-primary hover:text-primary/80'
                                                }`}
                                        >
                                            <Bug size={20} />
                                            <span className="font-bold text-sm">Quality Assurance</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleAction}
                            className="w-full bg-gradient-to-r from-primary to-[#a004fb] hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isJoinMode ? "Join Session" : "Create Room"}
                            <ArrowRight size={18} />
                        </button>

                        {/* Footer Toggle */}
                        <div className="text-center mt-4">
                            <p className="text-slate-500 text-sm">
                                {isJoinMode ? "Are you a game master?" : "Need to join a team?"}
                                <button
                                    onClick={() => setIsJoinMode(!isJoinMode)}
                                    className="text-primary hover:text-primary/80 font-semibold ml-2 transition-colors"
                                >
                                    {isJoinMode ? "Create a new room" : "Join existing room"}
                                </button>
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Landing;
