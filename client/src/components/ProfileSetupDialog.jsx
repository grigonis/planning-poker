/**
 * ProfileSetupDialog
 * 
 * Unified identity dialog used in three contexts:
 *  1. Host entry — after creating a room, before seeing the room
 *  2. Guest join — arriving at a room URL without a session
 *  3. Profile edit — clicking the avatar in the room toolbar
 *
 * Props:
 *  isOpen       boolean
 *  mode         'join' | 'edit'                       edit = pre-filled, no group picker
 *  roomId       string                                 needed for join mode
 *  currentUser  { name, avatarSeed, role, id }         pre-fill for edit mode
 *  onJoinSuccess  (user) => void                       join mode callback
 *  onUpdateProfile ({ name, avatarSeed }) => void      edit mode callback
 *  onClose      () => void                             edit mode only
 *
 * Avatar layout: 12 items in a flat 6×2 grid (6 male seeds, 6 female seeds).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, Loader2, AlertCircle, Check, ShieldCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '../lib/utils';

// ─── Avatar seed generation ───────────────────────────────────────────────────

const MALE_BASES = ['Oliver', 'Ethan', 'Marcus', 'Noah', 'Finn', 'Luca'];
const FEMALE_BASES = ['Sofia', 'Aria', 'Chloe', 'Zoe', 'Mia', 'Nora'];

const generateSeeds = () => {
    // Truly random seeds every time
    const rand = () => Math.random().toString(36).slice(2, 8);
    return {
        male: MALE_BASES.map(b => `${b}-${rand()}`),
        female: FEMALE_BASES.map(b => `${b}-${rand()}`),
    };
};

const makeAvatarUri = (seed, sex, size = 64) => {
    return createAvatar(avataaars, {
        seed,
        size,
        sex: [sex],
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    }).toDataUri();
};

// ─── AvatarGrid ───────────────────────────────────────────────────────────────

const AvatarGrid = React.memo(({ seeds, selectedSeed, onSelect }) => {
    const { male: maleSeeds, female: femaleSeeds } = seeds;
    // Flat 6×2 grid — no gender labels shown
    const allSeeds = [
        ...maleSeeds.map(seed => ({ seed, sex: 'male' })),
        ...femaleSeeds.map(seed => ({ seed, sex: 'female' })),
    ];

    return (
        <div className="grid grid-cols-6 gap-2">
            {allSeeds.map(({ seed, sex }) => {
                const uri = makeAvatarUri(seed, sex, 64);
                const isSelected = selectedSeed === seed;
                return (
                    <AvatarButton
                        key={seed}
                        seed={seed}
                        uri={uri}
                        isSelected={isSelected}
                        onSelect={onSelect}
                    />
                );
            })}
        </div>
    );
});
AvatarGrid.displayName = 'AvatarGrid';

const AvatarButton = React.memo(({ seed, uri, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(seed)}
        className={cn(
            'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150',
            'bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isSelected
                ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.25)] scale-105 z-10'
                : 'border-transparent hover:border-muted-foreground/30 hover:scale-105 opacity-80 hover:opacity-100'
        )}
        aria-pressed={isSelected}
        aria-label={`Select avatar ${seed}`}
    >
        <img src={uri} alt="" className="size-full object-cover" loading="lazy" />
        {isSelected && (
            <div className="absolute inset-0 flex items-end justify-end p-0.5">
                <div className="bg-primary rounded-full size-4 flex items-center justify-center shadow-md">
                    <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
                </div>
            </div>
        )}
    </button>
));
AvatarButton.displayName = 'AvatarButton';

// ─── GroupPicker ──────────────────────────────────────────────────────────────

const GroupPicker = ({ groups, selectedGroupId, onSelect }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Group <span className="normal-case font-normal text-muted-foreground/60">— optional</span>
            </p>
        </div>
        <div className="flex flex-col gap-1.5">
            {groups.map((g) => {
                const isSelected = selectedGroupId === g.id;
                return (
                    <button
                        key={g.id}
                        type="button"
                        onClick={() => onSelect(isSelected ? '' : g.id)}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 text-left',
                            isSelected
                                ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm'
                                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-muted/50'
                        )}
                    >
                        <span
                            className="shrink-0 size-3 rounded-full"
                            style={{ backgroundColor: g.color }}
                        />
                        <span className="flex-1 truncate">{g.name}</span>
                        {isSelected && (
                            <Check className="size-4 text-primary shrink-0" strokeWidth={2.5} />
                        )}
                    </button>
                );
            })}
        </div>
    </div>
);

// ─── Large preview avatar ─────────────────────────────────────────────────────

const PreviewAvatar = ({ seed, sex }) => {
    const uri = useMemo(
        () => makeAvatarUri(seed, sex, 96),
        [seed, sex]
    );
    return (
        <motion.div
            key={seed}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="size-[72px] rounded-full overflow-hidden border-[3px] border-background shadow-xl bg-slate-800 ring-[3px] ring-primary/25 shrink-0"
        >
            <img src={uri} alt="Your avatar" className="size-full object-cover" />
        </motion.div>
    );
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────

const ProfileSetupDialog = ({
    isOpen,
    mode = 'join',          // 'join' | 'edit'
    roomId,
    currentUser,
    onJoinSuccess,
    onUpdateProfile,
    onClose,
    // Join-mode extras passed from GuestJoinModal wrapper
    initialGroups = [],
    initialGroupsEnabled = false,
    initialGameMode = null,
    // Pre-fill from saved session (name + avatarSeed)
    initialName = '',
    initialAvatarSeed = null,
    // Host reclaim — when set, join_room uses this userId so server reconnects host
    hostUserId = null,
    hostRole = 'DEV',
    // Prefetched error/loading from wrapper (avoids double check_room)
    loading: prefetchLoading = false,
    prefetchError = null,
}) => {
    const { socket } = useSocket();
    const { userId: globalUserId, updateProfile, avatarPhotoURL: globalAvatarPhotoURL } = useProfile();
    const { user: authUser } = useAuthContext();

    // ── State ──
    const [name, setName] = useState('');
    const [seeds, setSeeds] = useState(generateSeeds);
    const [selectedSeed, setSelectedSeed] = useState(null);
    const [selectedSex, setSelectedSex] = useState('male');
    const [selectedGroupId, setSelectedGroupId] = useState('');

    // Join-mode loading state
    const [gameMode, setGameMode] = useState(initialGameMode);
    const [groups, setGroups] = useState(initialGroups);
    const [groupsEnabled, setGroupsEnabled] = useState(initialGroupsEnabled);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Seed → sex lookup (flat list: 0-5 male, 6-11 female) ──
    const getSex = useCallback((seed) => {
        if (seeds.male.includes(seed)) return 'male';
        return 'female';
    }, [seeds]);

    // Sync prefetched data from wrapper
    useEffect(() => {
        if (initialGroups.length) setGroups(initialGroups);
    }, [initialGroups]);
    useEffect(() => {
        setGroupsEnabled(initialGroupsEnabled);
    }, [initialGroupsEnabled]);
    useEffect(() => {
        if (initialGameMode) setGameMode(initialGameMode);
    }, [initialGameMode]);

    // ── Init on open ──
    useEffect(() => {
        if (!isOpen) return;

        setError(prefetchError);

        if (mode === 'edit') {
            // Auth name takes precedence when logged in
            setName(authUser?.displayName || currentUser?.name || '');
            setSubmitting(false);
            // Re-use existing avatar seed if available; otherwise pick a random one
            const existingSeed = currentUser?.avatarSeed;
            const newSeeds = generateSeeds();
            setSeeds(newSeeds);
            if (existingSeed) {
                // If seed isn't in new batch, slot it into position 0
                const all = [...newSeeds.male, ...newSeeds.female];
                if (!all.includes(existingSeed)) {
                    newSeeds.male[0] = existingSeed;
                    setSeeds({ ...newSeeds });
                }
                setSelectedSeed(existingSeed);
            } else {
                setSelectedSeed(newSeeds.male[0]);
                setSelectedSex('male');
            }
        } else {
            // join mode — auth name takes precedence, then saved session name
            setName(authUser?.displayName || initialName || '');
            setSubmitting(false);
            setSelectedGroupId('');
            const newSeeds = generateSeeds();
            setSeeds(newSeeds);
            if (initialAvatarSeed) {
                // Slot saved seed into position 0 so it's visible and selected
                newSeeds.male[0] = initialAvatarSeed;
                setSeeds({ ...newSeeds });
                setSelectedSeed(initialAvatarSeed);
            } else {
                setSelectedSeed(newSeeds.male[0]);
                setSelectedSex('male');
            }

            // Only do room check if wrapper didn't prefetch
            if (!initialGameMode && roomId && socket) {
                setLoading(true);
                socket.emit('check_room', { roomId }, (response) => {
                    setLoading(false);
                    if (response.exists) {
                        setGameMode(response.mode);
                        setGroups(response.groups || []);
                        setGroupsEnabled(response.groupsEnabled || false);
                    } else {
                        setError("Room not found. Please check the URL.");
                    }
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mode, roomId]);

    // Update selectedSex when seed changes
    useEffect(() => {
        if (selectedSeed) setSelectedSex(getSex(selectedSeed));
    }, [selectedSeed, getSex]);

    const handleShuffle = () => {
        const newSeeds = generateSeeds();
        setSeeds(newSeeds);
        setSelectedSeed(newSeeds.male[0]);
        setSelectedSex('male');
    };

    const handleSelectSeed = (seed) => {
        setSelectedSeed(seed);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !selectedSeed) return;

        if (mode === 'edit') {
            // When authenticated, use locked auth name and forward the OAuth photo URL
            const photoURL = authUser?.photoURL || null;
            const finalName = (authUser?.displayName || name).trim();
            onUpdateProfile?.({ name: finalName, avatarSeed: selectedSeed, avatarPhotoURL: photoURL });
            onClose?.();
            return;
        }

        // join mode
        setSubmitting(true);
        // When hostUserId is provided, pass it so server reconnects the pre-registered host slot
        // Otherwise use our globalUserId so history is linked across rooms
        const joinPayload = {
            roomId,
            name: name.trim(),
            role: hostUserId ? hostRole : 'DEV',
            userId: hostUserId || globalUserId,
        };
        socket.emit('join_room', joinPayload, (response) => {
            if (response.error) {
                setSubmitting(false);
                setError(response.error);
                return;
            }

            const userId = response.userId;

            // Assign group if selected (guests only)
            if (selectedGroupId && userId && !hostUserId) {
                socket.emit('assign_group', { roomId, targetUserId: userId, groupId: selectedGroupId });
            }

            // Set avatar + final name (+ photo URL if authenticated) on the server user object
            const photoURL = authUser?.photoURL || null;
            socket.emit('update_profile', { roomId, name: name.trim(), avatarSeed: selectedSeed, avatarPhotoURL: photoURL });

            // Save to global profile for cross-room identity
            updateProfile({ name: name.trim(), avatarSeed: selectedSeed });

            setSubmitting(false);
            onJoinSuccess?.({
                name: name.trim(),
                role: joinPayload.role,
                userId,
                avatarSeed: selectedSeed,
                avatarPhotoURL: authUser?.photoURL || null,
                isHost: !!hostUserId,
                gameMode: response.mode,
                funFeatures: response.funFeatures,
                autoReveal: response.autoReveal,
                anonymousMode: response.anonymousMode,
                users: response.users,
                groups: response.groups,
                groupsEnabled: response.groupsEnabled,
                votingSystem: response.votingSystem,
                roomName: response.roomName,
                roomDescription: response.roomDescription,
            });
        });
    };

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Edit Profile' : 'Join Session';

    // When authenticated in edit mode, name is locked to auth name — always valid
    const effectiveName = (isEditMode && authUser?.displayName) ? authUser.displayName : name;
    const canSubmit = effectiveName.trim().length > 0 && !!selectedSeed && !submitting;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={isEditMode ? onClose : undefined}
        >
            <DialogContent
                className={cn(
                    "sm:max-w-[480px] p-0 overflow-hidden gap-0",
                    !isEditMode && "[&>button]:hidden"
                )}
                onPointerDownOutside={!isEditMode ? (e) => e.preventDefault() : undefined}
                onEscapeKeyDown={!isEditMode ? (e) => e.preventDefault() : undefined}
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>

                {/* ── Loading ── */}
                {(loading || prefetchLoading) && !isEditMode && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Checking room…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {error && !loading && !prefetchLoading && (
                    <div className="flex flex-col items-center py-16 gap-4 text-center px-8">
                        <div className="bg-destructive/10 size-16 rounded-full flex items-center justify-center border border-destructive/20">
                            <AlertCircle className="size-8 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold mb-1">Unable to Join</h2>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button asChild variant="link" className="font-bold text-primary">
                            <a href="/">Return to Home</a>
                        </Button>
                    </div>
                )}

                {/* ── Main form ── */}
                {!loading && !prefetchLoading && !error && (
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="px-6 pt-6 pb-5 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-4">
                                {/* Preview avatar — OAuth photo takes precedence in edit mode when authed */}
                                {isEditMode && authUser?.photoURL ? (
                                    <motion.div
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.18 }}
                                        className="size-[72px] rounded-full overflow-hidden border-[3px] border-background shadow-xl ring-[3px] ring-primary/25 shrink-0"
                                    >
                                        <img
                                            src={authUser.photoURL}
                                            alt="Your profile photo"
                                            className="size-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </motion.div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        {selectedSeed && (
                                            <PreviewAvatar
                                                key={selectedSeed}
                                                seed={selectedSeed}
                                                sex={selectedSex}
                                            />
                                        )}
                                    </AnimatePresence>
                                )}

                                {/* Name input */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <label
                                        htmlFor="profile-name"
                                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                                    >
                                        Display Name <span className="text-destructive">*</span>
                                    </label>
                                    {/* When authenticated, name is locked to OAuth name */}
                                    {isEditMode && authUser?.displayName ? (
                                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/50">
                                            <span className="font-semibold text-sm flex-1 truncate">{authUser.displayName}</span>
                                            <ShieldCheck className="size-4 text-primary shrink-0" aria-label="Verified via sign-in" />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Input
                                                id="profile-name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your name…"
                                                className="font-semibold h-10 pr-12"
                                                maxLength={24}
                                                autoFocus
                                                autoComplete="off"
                                            />
                                            <span className={cn(
                                                "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums transition-colors",
                                                name.length > 20 ? "text-destructive" : "text-muted-foreground/50"
                                            )}>
                                                {name.length}/24
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Avatar grid */}
                        <div className="px-6 py-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {isEditMode && authUser?.photoURL ? 'Fallback Avatar' : 'Choose Avatar'}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleShuffle}
                                    className="h-7 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2"
                                >
                                    <RefreshCw className="size-3" />
                                    Shuffle
                                </Button>
                            </div>

                            {isEditMode && authUser?.photoURL && (
                                <p className="text-[11px] text-muted-foreground -mt-1">
                                    Used when not signed in or photo unavailable.
                                </p>
                            )}
                            <AvatarGrid
                                seeds={seeds}
                                selectedSeed={selectedSeed}
                                onSelect={handleSelectSeed}
                            />
                        </div>

                        {/* Group picker — join mode only, when groups exist */}
                        {!isEditMode && groupsEnabled && groups.length > 0 && (
                            <div className="px-6 pb-4">
                                <div className="border-t border-border pt-4">
                                    <GroupPicker
                                        groups={groups}
                                        selectedGroupId={selectedGroupId}
                                        onSelect={setSelectedGroupId}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center gap-3">
                            {isEditMode && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="font-semibold"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className={cn(
                                    "font-bold gap-2",
                                    isEditMode ? "ml-auto px-6" : "flex-1 h-11 text-base"
                                )}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Joining…
                                    </>
                                ) : isEditMode ? (
                                    <>
                                        Save Changes
                                        <ArrowRight className="size-4" />
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSetupDialog;
