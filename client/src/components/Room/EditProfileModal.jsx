import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, User, ChevronRight } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Generate some initial preset seeds for avatars
const PRESET_SEEDS = [
    'Oliver', 'Alex', 'Sam', 'Taylor', 'Jordan', 
    'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 
    'Reese', 'Blake'
];

const EditProfileModal = ({ 
    isOpen, 
    onClose, 
    currentUser, 
    onUpdateProfile 
}) => {
    const [name, setName] = useState(currentUser?.name || '');
    const [selectedSeed, setSelectedSeed] = useState(currentUser?.avatarSeed || currentUser?.name || currentUser?.id || 'Oliver');
    const [presetSeeds, setPresetSeeds] = useState(PRESET_SEEDS);

    useEffect(() => {
        if (isOpen) {
            setName(currentUser?.name || '');
            setSelectedSeed(currentUser?.avatarSeed || currentUser?.name || currentUser?.id || 'Oliver');
        }
    }, [isOpen, currentUser]);

    // Derived state for the large preview avatar
    const previewAvatarSvg = useMemo(() => {
        const avatar = createAvatar(avataaars, {
            seed: selectedSeed,
            size: 120,
            backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        });
        return avatar.toDataUri();
    }, [selectedSeed]);

    const handleShuffle = () => {
        const newSeeds = presetSeeds.map(() => Math.random().toString(36).substring(7));
        setPresetSeeds(newSeeds);
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onUpdateProfile({ name: name.trim(), avatarSeed: selectedSeed });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <User className="size-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Edit Profile</DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Customize Your Look</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* Top Row: Selected Avatar & Name Input */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="size-[100px] rounded-full overflow-hidden border-4 border-background shadow-xl bg-slate-800 ring-4 ring-primary/20">
                                <img src={previewAvatarSvg} alt="Preview" className="size-full object-cover" />
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                            <p className="text-[10px] text-muted-foreground font-medium mb-1">This is how other users will see you.</p>
                            <Input
                                id="displayName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="font-bold"
                                placeholder="Your Name"
                                maxLength={24}
                                autoFocus
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Avatar Selection Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Select an avatar</h3>
                            <Button 
                                variant="secondary"
                                size="sm"
                                onClick={handleShuffle}
                                className="h-8 gap-1.5 text-xs font-bold"
                            >
                                <RefreshCw className="size-3.5" />
                                Shuffle
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {presetSeeds.map((seed) => {
                                const avatar = createAvatar(avataaars, {
                                    seed: seed,
                                    size: 60,
                                    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
                                });
                                const svgUri = avatar.toDataUri();
                                const isSelected = selectedSeed === seed;
                                
                                return (
                                    <button
                                        key={seed}
                                        type="button"
                                        onClick={() => setSelectedSeed(seed)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-slate-800 ${
                                            isSelected 
                                                ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] scale-105 z-10' 
                                                : 'border-transparent hover:border-muted-foreground/20 hover:scale-105 shadow-md'
                                        }`}
                                    >
                                        <img src={svgUri} alt={`Avatar ${seed}`} className="size-full object-cover" loading="lazy" />
                                        {isSelected && (
                                            <div className="absolute inset-0 ring-2 ring-primary ring-inset rounded-2xl pointer-events-none"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="px-8 font-bold gap-2"
                        >
                            Save Changes
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
