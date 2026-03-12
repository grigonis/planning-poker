import React, { useState } from 'react';
import { ArrowRight, User, Users, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

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
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 flex flex-col relative transition-colors duration-300">
            {/* Blurred Background Effects reproducing Room.jsx */}
            <div className="absolute inset-0 aurora z-0 opacity-40 blur-sm pointer-events-none" />
            <div className="absolute inset-0 modern-grid z-0 opacity-40 blur-sm pointer-events-none" />

            {/* Dummy Navbar showing branding */}
            <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-md border-b border-border transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
                        <h1 className="text-xl font-bold text-primary leading-none">BananaPoker</h1>
                        <span className="text-xs text-muted-foreground font-mono mt-1">Online planning poker</span>
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
                    className="w-full max-w-md bg-card/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-6 md:p-8"
                >
                    <h2 className="text-2xl font-bold text-foreground mb-2">Create New Session</h2>
                    <p className="text-muted-foreground font-light mb-6">Configure your planning poker room.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold">Your Display Name</Label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <User size={18} />
                                </div>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                    placeholder="e.g. Scrum Master"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {/* Voting System Setup */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Voting System</Label>
                            <Select value={votingSystem} onValueChange={setVotingSystem}>
                                <SelectTrigger className="w-full h-12">
                                    <SelectValue placeholder="Select a voting system" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fibonacci_modified">Modified Fibonacci (0, 0.5, 1... 21, ☕)</SelectItem>
                                    <SelectItem value="fibonacci">Fibonacci (1, 2, 3... 34)</SelectItem>
                                    <SelectItem value="tshirt">T-Shirt Sizes (XS, S, M, L, XL)</SelectItem>
                                    <SelectItem value="powers">Powers of 2 (0, 1, 2, 4, 8...)</SelectItem>
                                    <SelectItem value="custom">Custom Scale...</SelectItem>
                                </SelectContent>
                            </Select>

                            {votingSystem === 'custom' && (
                                <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="customScale" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Comma-separated values</Label>
                                    <Input
                                        id="customScale"
                                        type="text"
                                        value={customScaleText}
                                        onChange={(e) => setCustomScaleText(e.target.value)}
                                        className="h-10 text-sm"
                                        placeholder="e.g. 1, 2, 3, 5, 8, 13, ?, ☕"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {customScaleText.split(',').map(s => s.trim()).filter(Boolean).map((val, idx) => (
                                            <span key={idx} className="bg-muted border border-border shadow-sm rounded flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-foreground min-w-4 h-5">
                                                {val}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground font-light px-1 pt-1">Selected system is applied for all team members.</p>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Your Role</Label>
                            <ToggleGroup type="single" value={role} onValueChange={(val) => val && setRole(val)} className="justify-start bg-muted p-1 rounded-xl border border-border/5">
                                <ToggleGroupItem value="DEV" className="flex-1 py-2 gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    <Users size={14} />
                                    Estimator
                                </ToggleGroupItem>
                                <ToggleGroupItem value="SPECTATOR" className="flex-1 py-2 gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                    <Eye size={14} />
                                    Spectator
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        <Button
                            type="submit"
                            disabled={!name.trim() || isLoading}
                            className="w-full h-12 text-base font-bold"
                        >
                            {isLoading ? 'Creating...' : 'Start Session'}
                            {!isLoading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default CreateRoom;
