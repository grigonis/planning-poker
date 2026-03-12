import React from 'react';
import { Settings, Sparkles, Zap, EyeOff, AlertTriangle, Power } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

const SettingsDialog = ({
    isOpen,
    onClose,
    funFeatures,
    autoReveal,
    anonymousMode,
    onUpdateSettings,
    onEndSession,
}) => {
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
                            <DialogTitle className="text-2xl font-black tracking-tight">Settings</DialogTitle>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Room Preferences</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Toggles Grid */}
                    <div className="space-y-3">
                        {/* Setting: Fun Features */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 transition-colors ${funFeatures ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="mt-0.5">
                                    <Label htmlFor="settingsFunFeatures" className="font-bold text-sm mb-1 cursor-pointer">Celebration Effects</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Show confetti and play sounds when the team reaches consensus.</p>
                                </div>
                            </div>
                            <Switch
                                id="settingsFunFeatures"
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
                                    <Label htmlFor="settingsAutoReveal" className="font-bold text-sm mb-1 cursor-pointer">Instant Reveal</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Automatically reveal cards once every eligible team member has voted.</p>
                                </div>
                            </div>
                            <Switch
                                id="settingsAutoReveal"
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
                                    <Label htmlFor="settingsAnonymousMode" className="font-bold text-sm mb-1 cursor-pointer">Privacy Mode</Label>
                                    <p className="text-[13px] text-muted-foreground leading-snug">Hide player identities during active voting to prevent anchoring bias.</p>
                                </div>
                            </div>
                            <Switch
                                id="settingsAnonymousMode"
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

export default SettingsDialog;
