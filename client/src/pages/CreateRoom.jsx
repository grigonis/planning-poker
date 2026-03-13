import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Eye, Hash, Settings2 } from 'lucide-react';
import { toast } from "sonner";
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

import RoomNavbar from '../components/Room/RoomNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { cn } from '../lib/utils';

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
    const [roomName, setRoomName] = useState('');
    const [votingSystem, setVotingSystem] = useState('fibonacci_modified');
    const [customScaleText, setCustomScaleText] = useState('0, 1, 2, 3, 5, 8, 13, 21, ☕');
    const [joinAsSpectator, setJoinAsSpectator] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { socket } = useSocket();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        setIsLoading(true);

        let finalVotingSystem;
        if (votingSystem === 'custom') {
            const values = customScaleText.split(',').map(s => s.trim()).filter(Boolean);
            if (values.length === 0) {
                toast.error("Please provide at least one value for the custom scale");
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

        const role = joinAsSpectator ? 'SPECTATOR' : 'DEV';

        socket.emit('create_room', {
            roomName: roomName.trim(),
            role,
            gameMode: 'STANDARD',
            presetParams: { votingSystem: finalVotingSystem }
        }, (response) => {
            setIsLoading(false);
            if (response.error) {
                toast.error(response.error);
                return;
            }
            // Navigate to room — no player name yet.
            // Room.jsx will detect missing name and show ProfileSetupDialog.
            navigate(`/room/${response.roomId}`, {
                state: {
                    hostUserId: response.userId,
                    hostRole: role,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    votingSystem: response.votingSystem,
                    roomName: response.roomName,
                    users: response.users
                }
            });
        });
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 flex flex-col relative transition-colors duration-300">
            {/* Background */}
            <div className="absolute inset-0 aurora z-0 opacity-40 blur-sm pointer-events-none" />
            <div className="absolute inset-0 modern-grid z-0 opacity-40 blur-sm pointer-events-none" />

            <RoomNavbar minimal />

            <main className="flex-1 w-full mx-auto px-4 md:px-6 py-8 relative z-10 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-md bg-card/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-6 md:p-8"
                >
                    <h2 className="text-2xl font-bold text-foreground mb-1">Create New Session</h2>
                    <p className="text-muted-foreground font-light mb-7 text-sm">Configure your planning poker room.</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Room Name */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="roomName" className="text-sm font-bold">Room Name</Label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                    <Hash size={16} />
                                </div>
                                <Input
                                    id="roomName"
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="pl-9"
                                    placeholder="e.g. Sprint 42 Planning"
                                    autoFocus
                                    required
                                    maxLength={48}
                                />
                            </div>
                        </div>

                        {/* Voting System */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-bold">Voting System</Label>
                            <Select value={votingSystem} onValueChange={setVotingSystem}>
                                <SelectTrigger className="w-full h-10">
                                    <SelectValue placeholder="Select a voting system" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fibonacci_modified">Modified Fibonacci (0, 0.5, 1… 21, ☕)</SelectItem>
                                    <SelectItem value="fibonacci">Fibonacci (1, 2, 3… 89)</SelectItem>
                                    <SelectItem value="tshirt">T-Shirt Sizes (XS, S, M, L, XL)</SelectItem>
                                    <SelectItem value="powers">Powers of 2 (0, 1, 2, 4, 8…)</SelectItem>
                                    <SelectItem value="custom">Custom Scale…</SelectItem>
                                </SelectContent>
                            </Select>

                            <AnimatePresence>
                                {votingSystem === 'custom' && (
                                    <motion.div
                                        key="custom"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2 pt-2">
                                            <Label htmlFor="customScale" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Comma-separated values
                                            </Label>
                                            <Input
                                                id="customScale"
                                                type="text"
                                                value={customScaleText}
                                                onChange={(e) => setCustomScaleText(e.target.value)}
                                                className="h-9 text-sm"
                                                placeholder="e.g. 1, 2, 3, 5, 8, 13, ?, ☕"
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {customScaleText.split(',').map(s => s.trim()).filter(Boolean).map((val, idx) => (
                                                    <span key={idx} className="bg-muted border border-border rounded px-1.5 py-0.5 text-[10px] font-bold text-foreground min-w-4 h-5 flex items-center justify-center">
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="text-xs text-muted-foreground font-light px-0.5">Selected system applies to all team members.</p>
                        </div>

                        {/* Options Collapsible */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setOptionsOpen(o => !o)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Settings2 size={14} className="text-muted-foreground" />
                                    Options
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={cn("transition-transform duration-200", optionsOpen && "rotate-180")}
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {optionsOpen && (
                                    <motion.div
                                        key="options-panel"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 py-4 border-t border-border bg-muted/20 flex flex-col gap-4">
                                            {/* Spectator toggle */}
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                                                        <Eye size={14} className="text-muted-foreground" />
                                                        Join as Spectator
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-light">
                                                        Watch the session without voting.
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={joinAsSpectator}
                                                    onCheckedChange={setJoinAsSpectator}
                                                    aria-label="Join as spectator"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button
                            type="submit"
                            disabled={!roomName.trim() || isLoading || !socket}
                            className="w-full h-11 text-base font-bold mt-1"
                        >
                            {isLoading ? 'Creating…' : 'Create Session'}
                            {!isLoading && <ArrowRight size={16} className="ml-1.5" />}
                        </Button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default CreateRoom;
