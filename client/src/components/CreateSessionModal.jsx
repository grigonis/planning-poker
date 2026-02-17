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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold font-heading text-white mb-2">Create New Session</h2>
                <p className="text-gray-400 font-light mb-8">Start a new planning poker room as the host.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold font-heading text-gray-300">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-banana-500 focus:ring-1 focus:ring-banana-500 transition-all font-heading"
                            placeholder="e.g. Scrum Master"
                            autoFocus
                        />
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
