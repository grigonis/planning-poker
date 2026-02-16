import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext'; // Ensure this context exists and is accessible
import { useNavigate } from 'react-router-dom';

const CreateSessionModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const socket = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        // Emulate the create_room logic
        socket.emit('create_room', (response) => {
            setIsLoading(false);
            if (response.error) {
                alert(response.error);
                return;
            }
            // Store name/role in navigation state or context as per original logic
            // The original logic passed { name, role: 'HOST', userId } to the room
            navigate(`/room/${response.roomId}`, { state: { name, role: 'HOST', userId: response.userId } });
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

                <h2 className="text-2xl font-bold text-white mb-2">Create New Session</h2>
                <p className="text-slate-400 mb-6">Start a new planning poker room as the host.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="e.g. Scrum Master"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
