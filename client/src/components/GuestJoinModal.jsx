import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const GuestJoinModal = ({ isOpen, roomId, onJoinSuccess }) => {
    const { socket } = useSocket();
    const [name, setName] = useState('');
    const [role, setRole] = useState('DEV');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [gameMode, setGameMode] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupsEnabled, setGroupsEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !socket || !roomId) return;

        setLoading(true);
        socket.emit('check_room', { roomId }, (response) => {
            setLoading(false);
            if (response.exists) {
                setGameMode(response.mode);
                setRole('DEV');
                setGroups(response.groups || []);
                setGroupsEnabled(response.groupsEnabled || false);
                setSelectedGroupId('');
            } else {
                setError("Room not found. Please check the URL.");
            }
        });
    }, [isOpen, socket, roomId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        socket.emit('join_room', { roomId, name, role }, (response) => {
            if (response.error) {
                setError(response.error);
            } else {
                // If a group was selected, assign it immediately after join
                if (selectedGroupId && response.userId) {
                    socket.emit('assign_group', { roomId, targetUserId: response.userId, groupId: selectedGroupId });
                }
                onJoinSuccess({
                    name,
                    role,
                    userId: response.userId,
                    gameMode: response.mode,
                    funFeatures: response.funFeatures,
                    autoReveal: response.autoReveal,
                    anonymousMode: response.anonymousMode,
                    users: response.users,
                    groups: response.groups,
                    groupsEnabled: response.groupsEnabled
                });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="sr-only">Join Session</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="text-center py-8">
                        <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Checking Room...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="bg-destructive/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/20">
                            <AlertCircle className="size-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Unable to Join</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button asChild variant="link" className="font-bold text-primary">
                            <a href="/">Return to Home</a>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="bg-primary/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                <Users className="size-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Join {gameMode === 'STANDARD' ? 'Planning' : 'Split'} Session</h2>
                            <p className="text-muted-foreground text-sm">Room: <span className="font-mono text-primary">{roomId}</span></p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Your Display Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Alex"
                                    className="font-bold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Join As
                                </Label>
                                <div className="grid gap-3">
                                    {gameMode === 'STANDARD' ? (
                                        <ToggleGroup type="single" value={role} onValueChange={(val) => val && setRole(val)} className="flex flex-col gap-2">
                                            <ToggleGroupItem
                                                value="DEV"
                                                className="w-full h-auto flex-col items-start p-3 gap-0.5 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                            >
                                                <span className="font-bold">Estimator</span>
                                                <span className="text-xs opacity-80 font-normal">Vote on stories</span>
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="SPECTATOR"
                                                className="w-full h-auto flex-col items-start p-3 gap-0.5 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                            >
                                                <span className="font-bold">Spectator</span>
                                                <span className="text-xs opacity-80 font-normal">View only</span>
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    ) : (
                                        <ToggleGroup type="single" value={role} onValueChange={(val) => val && setRole(val)} className="flex flex-col gap-2">
                                            <div className="grid grid-cols-2 gap-2 w-full">
                                                <ToggleGroupItem
                                                    value="DEV"
                                                    className="font-bold border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                                >
                                                    Developer
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="QA"
                                                    className="font-bold border border-border data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
                                                >
                                                    QA
                                                </ToggleGroupItem>
                                            </div>
                                            <ToggleGroupItem
                                                value="SPECTATOR"
                                                className="w-full font-bold border border-border data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
                                            >
                                                Spectator
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    )}
                                </div>
                            </div>

                            {/* Group picker — only shown when groups are enabled and groups exist */}
                            {groupsEnabled && groups.length > 0 && role !== 'SPECTATOR' && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Your Group <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span>
                                    </Label>
                                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                        <SelectTrigger className="font-bold">
                                            <SelectValue placeholder="Select a group…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(g => (
                                                <SelectItem key={g.id} value={g.id} className="text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                                                        {g.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 text-lg font-bold">
                                Join Session
                            </Button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GuestJoinModal;
