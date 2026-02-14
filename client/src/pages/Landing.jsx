import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Landing = () => {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [role, setRole] = useState('DEV'); // Default role
    const navigate = useNavigate();
    const socket = useSocket();

    const handleCreate = () => {
        if (!name) return alert("Please enter your name");
        socket.emit('create_room', (response) => {
            // Create room, then join as Host (automatically handled by backend usually, but let's be explicit)
            // Actually backend handler for create_room joins the socket.
            // But we need to store user info?
            // Wait, create_room user is Host.
            navigate(`/room/${response.roomId}`, { state: { name, role: 'HOST', userId: response.userId } });
        });
    };

    const handleJoin = () => {
        if (!name || !roomCode) return alert("Please enter name and room code");
        socket.emit('join_room', { roomId: roomCode, name, role }, (response) => {
            if (response.error) return alert(response.error);
            navigate(`/room/${roomCode}`, { state: { name, role, userId: socket.id } });
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-primary">SplitPoker</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 border p-2"
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setRole('DEV')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'DEV' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Developer
                        </button>
                        <button
                            onClick={() => setRole('QA')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'QA' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            QA / Tester
                        </button>
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold mb-4">Join Existing Room</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="flex-1 rounded-md border-gray-300 shadow-sm border p-2"
                                placeholder="Room Code"
                            />
                            <button
                                onClick={handleJoin}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                            >
                                Join
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">Or start a new session</p>
                        <button
                            onClick={handleCreate}
                            className="w-full bg-slate-800 text-white py-3 rounded-md hover:bg-slate-900 font-semibold"
                        >
                            Create New Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
