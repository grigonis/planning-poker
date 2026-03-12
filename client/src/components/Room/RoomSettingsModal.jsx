import React from 'react';
import { Settings, Sparkles, Zap, EyeOff, LayoutPanelLeft, AlertTriangle, Power } from 'lucide-react';
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PRESETS = [
    { id: 'FIBONACCI_MODIFIED', name: 'Modified Fibonacci', values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕'] },
    { id: 'FIBONACCI', name: 'Fibonacci', values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89] },
    { id: 'TSHIRT', name: 'T-Shirt Sizes', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'POWERS', name: 'Powers of 2', values: [0, 1, 2, 4, 8, 16, 32, 64] },
];

const RoomSettingsModal = ({ 
    isOpen, 
    onClose, 
    funFeatures, 
    autoReveal, 
    anonymousMode, 
    votingSystem,
    phase,
    onUpdateSettings, 
    onEndSession 
}) => {
    const [customScaleText, setCustomScaleText] = React.useState(
        votingSystem?.type === 'CUSTOM' ? votingSystem.values.join(', ') : '0, 1, 2, 3, 5, 8, 13, 21, ☕'
    );
    const [isCustomMode, setIsCustomMode] = React.useState(votingSystem?.type === 'CUSTOM');

    const isRoundActive = phase !== 'IDLE' && phase !== 'REVEALED';

    const handleVoteSystemChange = (preset) => {
        if (isRoundActive) {
            toast.error('Cannot change voting system while a round is in progress. Please reveal or reset the round first.');
            return;
        }
        setIsCustomMode(false);
        onUpdateSettings({ 
            votingSystem: {
                type: preset.id,
                name: preset.name,
                values: preset.values
            }
        });
    };

    const handleCustomScaleSubmit = () => {
        if (isRoundActive) {
            toast.error('Cannot change voting system while a round is in progress.');
            return;
        }
        const values = customScaleText.split(',').map(s => s.trim()).filter(Boolean);
        if (values.length === 0) {
            toast.error("Please provide at least one value for the custom scale");
            return;
        }
        onUpdateSettings({ 
            votingSystem: {
                type: 'CUSTOM',
                name: 'Custom Scale',
                values
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-8 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <Settings className="size-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">Room Settings</DialogTitle>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configuration Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto flex-1">

                    {/* Voting System Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <LayoutPanelLeft className="size-5 text-primary" />
                                <h3 className="font-bold">Voting System</h3>
                            </div>
                            {isRoundActive && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                                    <AlertTriangle size={12} />
                                    Active Round - Locked
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {PRESETS.map((preset) => {
                                const isSelected = !isCustomMode && votingSystem?.type === preset.id;
                                return (
                                    <Button
                                        key={preset.id}
                                        variant={isSelected ? "default" : "outline"}
                                        onClick={() => handleVoteSystemChange(preset)}
                                        disabled={isRoundActive && !isSelected}
                                        className={`h-auto flex-col items-start p-4 gap-1 ${isSelected ? "bg-primary/10 text-primary border-primary hover:bg-primary/20" : ""}`}
                                    >
                                        <div className="font-bold text-sm">{preset.name}</div>
                                        <div className="text-[10px] opacity-60 truncate w-full text-left">{preset.values.join(', ')}</div>
                                    </Button>
                                );
                            })}
                            
                            <Button
                                variant={isCustomMode ? "default" : "outline"}
                                onClick={() => {
                                    if (isRoundActive && !isCustomMode) {
                                        toast.error('Cannot change voting system while a round is in progress.');
                                        return;
                                    }
                                    setIsCustomMode(true);
                                }}
                                disabled={isRoundActive && !isCustomMode}
                                className={`h-auto flex-col items-start p-4 gap-1 ${isCustomMode ? "bg-primary/10 text-primary border-primary hover:bg-primary/20" : ""}`}
                            >
                                <div className="font-bold text-sm">Custom Scale</div>
                                <div className="text-[10px] opacity-60 truncate w-full text-left">Define your own values...</div>
                            </Button>
                        </div>

                        {isCustomMode && (
                            <div className="mt-4 space-y-3 p-4 bg-muted/30 border rounded-2xl">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Comma-separated values</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={customScaleText}
                                        onChange={(e) => setCustomScaleText(e.target.value)}
                                        className="text-sm"
                                        placeholder="e.g. 1, 2, 3, 5, 8, 13, ?, ☕"
                                        disabled={isRoundActive}
                                    />
                                    <Button
                                        onClick={handleCustomScaleSubmit}
                                        disabled={isRoundActive}
                                        size="sm"
                                        className="font-bold"
                                    >
                                        Apply
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 px-1">
                                    {customScaleText.split(',').map(s => s.trim()).filter(Boolean).map((val, idx) => (
                                        <span key={idx} className="bg-background border shadow-sm rounded flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold min-w-4 h-5">
                                            {val}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Toggles Grid */}
                    <div className="space-y-3">
                        {/* Setting: Fun Features */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 transition-colors ${funFeatures ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="mt-0.5">
                                    <Label htmlFor="funFeatures" className="font-bold text-sm mb-1 cursor-pointer">Celebration Effects</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Show confetti and play sounds when the team reaches consensus.</p>
                                </div>
                            </div>
                            <Switch 
                                id="funFeatures"
                                checked={funFeatures}
                                onCheckedChange={(checked) => onUpdateSettings({ funFeatures: checked })}
                            />
                        </div>

                        {/* Setting: Auto Reveal */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 transition-colors ${autoReveal ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                    <Zap className="size-5" />
                                </div>
                                <div className="mt-0.5">
                                    <Label htmlFor="autoReveal" className="font-bold text-sm mb-1 cursor-pointer">Instant Reveal</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Automatically reveal cards once every eligible team member has voted.</p>
                                </div>
                            </div>
                            <Switch 
                                id="autoReveal"
                                checked={autoReveal}
                                onCheckedChange={(checked) => onUpdateSettings({ autoReveal: checked })}
                            />
                        </div>

                        {/* Setting: Anonymous Mode */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 transition-colors ${anonymousMode ? 'bg-purple-500/10 text-purple-600' : 'bg-muted text-muted-foreground'}`}>
                                    <EyeOff className="size-5" />
                                </div>
                                <div className="mt-0.5">
                                    <Label htmlFor="anonymousMode" className="font-bold text-sm mb-1 cursor-pointer">Privacy Mode</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Hide player identities during active voting to prevent anchoring bias.</p>
                                </div>
                            </div>
                            <Switch 
                                id="anonymousMode"
                                checked={anonymousMode}
                                onCheckedChange={(checked) => onUpdateSettings({ anonymousMode: checked })}
                            />
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t space-y-4">
                        <div className="flex items-center gap-2 px-2 text-destructive">
                            <AlertTriangle className="size-4" />
                            <h3 className="font-bold text-xs uppercase tracking-[0.1em]">Danger Zone</h3>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full h-14 rounded-[20px] font-bold gap-3 text-base shadow-sm"
                                >
                                    <Power className="size-5" />
                                    Terminate Voting Session
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will end the session for everyone and redirect all players to the home page. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onEndSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        End Session
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoomSettingsModal;
