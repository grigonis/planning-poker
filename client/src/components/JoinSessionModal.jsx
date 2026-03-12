import React, { useState } from 'react';
import { ArrowRight, User, Hash, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const JoinSessionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [roomCode, setRoomCode] = useState('');
    const [roomMode, setRoomMode] = useState('STANDARD');

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
            setRole('DEV');
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
                    userId: response.userId,
                    gameMode: roomMode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    users: response.users
                }
            });
            onClose();
            setTimeout(() => {
                setStep(1);
                setName('');
                setRoomCode('');
            }, 300);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Join Session</DialogTitle>
                            <DialogDescription className="font-light">
                                Enter the room code to join your team.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCheckRoom} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="roomCode" className="text-sm font-bold">Room Code</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                                    <Input
                                        id="roomCode"
                                        type="text"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        className="pl-10 uppercase tracking-wider h-12"
                                        placeholder="e.g. ABCD"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!roomCode.trim() || isLoading}
                                className="w-full h-12 font-bold gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="size-4.5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Join Room: {roomCode.toUpperCase()}</DialogTitle>
                            <DialogDescription className="font-light">
                                {roomMode === 'STANDARD' ? 'Standard Mode (Unified Voting)' : 'Split Mode (Dev & QA)'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleJoin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="joinName" className="text-sm font-bold">Display Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                                    <Input
                                        id="joinName"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10 h-12"
                                        placeholder="e.g. Alex Rivera"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Your Role</Label>
                                <ToggleGroup type="single" value={role} onValueChange={(val) => val && setRole(val)} className={`grid gap-2 p-1 bg-muted/50 rounded-xl border border-border ${roomMode === 'SPLIT' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                    {roomMode === 'SPLIT' ? (
                                        <>
                                            <ToggleGroupItem
                                                value="DEV"
                                                className="h-8 text-xs font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                            >
                                                Developer
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="QA"
                                                className="h-8 text-xs font-bold data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
                                            >
                                                QA
                                            </ToggleGroupItem>
                                        </>
                                    ) : (
                                        <ToggleGroupItem
                                            value="DEV"
                                            className="h-8 text-xs font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                        >
                                            Estimator
                                        </ToggleGroupItem>
                                    )}

                                    <ToggleGroupItem
                                        value="SPECTATOR"
                                        className="h-8 text-xs font-bold data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                                    >
                                        Spectator
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <Button
                                type="submit"
                                disabled={!name.trim() || isLoading}
                                className="w-full h-12 font-bold gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        Enter Room
                                        <ArrowRight className="size-4.5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default JoinSessionModal;
