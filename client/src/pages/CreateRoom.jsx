import React, { useState } from 'react';
import { ArrowRight, User, Users, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';

const VOTING_SYSTEMS = {
    fibonacci_modified: {
        type: 'FIBONACCI_MODIFIED',
        name: 'Modified Fibonacci',
        values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
    },
    fibonacci: {
        type: 'FIBONACCI',
        name: 'Fibonacci',
        values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    },
    tshirt: {
        type: 'TSHIRT',
        name: 'T-Shirt Sizes',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    powers: {
        type: 'POWERS',
        name: 'Powers of 2',
        values: [0, 1, 2, 4, 8, 16, 32, 64]
    }
};

const CreateRoom = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEV'); // DEV = Estimator. SPECTATOR = Spectator.
    const [votingSystem, setVotingSystem] = useState('fibonacci_modified');
    const [customScaleText, setCustomScaleText] = useState('0, 1, 2, 3, 5, 8, 13, 21, ☕');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { socket } = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);

        let finalVotingSystem;
        if (votingSystem === 'custom') {
            const values = customScaleText.split(',').map(s => s.trim()).filter(Boolean);
            if (values.length === 0) {
                alert("Please provide at least one value for the custom scale");
                setIsLoading(false);
                return;
            }
            finalVotingSystem = {
                type: 'CUSTOM',
                name: 'Custom Scale',
                values
            };
        } else {
            finalVotingSystem = VOTING_SYSTEMS[votingSystem];
        }

        socket.emit('create_room', { 
            name, 
            role, 
            gameMode: 'STANDARD',
            presetParams: { votingSystem: finalVotingSystem }
        }, (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            navigate(`/room/${response.roomId}`, {
                state: {
                    name,
                    role,
                    userId: response.userId,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    votingSystem: response.votingSystem,
                    users: response.users
                }
            });
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 font-sans text-gray-900 dark:text-white selection:bg-banana-500/30 flex flex-col relative transition-colors duration-300">
            {/* Blurred Background Effects reproducing Room.jsx */}
            <div className="absolute inset-0 aurora z-0 opacity-40 blur-sm pointer-events-none" />
            <div className="absolute inset-0 modern-grid z-0 opacity-40 blur-sm pointer-events-none" />

            {/* Dummy Navbar showing branding */}
            <div className="sticky top-0 z-40 bg-gray-50/50 dark:bg-dark-900/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
                        <h1 className="text-xl font-bold text-orange-500 dark:text-banana-500 leading-none">BananaPoker</h1>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">Online planning poker</span>
                    </div>
                    <div><ThemeToggle /></div>
                </div>
            </div>

            {/* Create Form Container */}
            <main className="flex-1 w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white/80 dark:bg-[#101010]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Session</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-light mb-6">Configure your planning poker room.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Your Display Name</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-medium"
                                    placeholder="e.g. Scrum Master"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {/* Voting System Setup */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Voting System</label>
                            <select 
                                value={votingSystem}
                                onChange={(e) => setVotingSystem(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 appearance-none font-medium"
                            >
                                <option value="fibonacci_modified" className="bg-white dark:bg-dark-800">Modified Fibonacci (0, 0.5, 1... 21, ☕)</option>
                                <option value="fibonacci" className="bg-white dark:bg-dark-800">Fibonacci (1, 2, 3... 34)</option>
                                <option value="tshirt" className="bg-white dark:bg-dark-800">T-Shirt Sizes (XS, S, M, L, XL)</option>
                                <option value="powers" className="bg-white dark:bg-dark-800">Powers of 2 (0, 1, 2, 4, 8...)</option>
                                <option value="custom" className="bg-white dark:bg-dark-800">Custom Scale...</option>
                            </select>

                            {votingSystem === 'custom' && (
                                <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Comma-separated values</label>
                                    <input
                                        type="text"
                                        value={customScaleText}
                                        onChange={(e) => setCustomScaleText(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-medium"
                                        placeholder="e.g. 1, 2, 3, 5, 8, 13, ?, ☕"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {customScaleText.split(',').map(s => s.trim()).filter(Boolean).map((val, idx) => (
                                            <span key={idx} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-sm rounded flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-gray-700 dark:text-gray-200 min-w-4 h-5">
                                                {val}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 dark:text-gray-500 font-light px-1 pt-1">Selected system is applied for all team members.</p>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Your Role</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 dark:bg-white/[0.07] rounded-xl border border-gray-200 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setRole('DEV')}
                                    className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${role === 'DEV' ? 'bg-banana-500 text-dark-900 shadow-md' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white'}`}
                                >
                                    <Users size={14} />
                                    Estimator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('SPECTATOR')}
                                    className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${role === 'SPECTATOR' ? 'bg-gray-600 dark:bg-gray-700 text-white shadow-md' : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white'}`}
                                >
                                    <Eye size={14} />
                                    Spectator
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="w-full bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold py-3.5 rounded-xl shadow-lg shadow-banana-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating...' : 'Start Session'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default CreateRoom;
