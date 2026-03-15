import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    History,
    Users,
    Activity,
    Target
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Card,
    CardContent,
} from "../components/ui/card";
import RoomNavbar from '../components/Room/RoomNavbar';
import ProfileSetupDialog from '../components/ProfileSetupDialog';
import SignInDialog from '../components/SignInDialog';
import PlayerAvatar from '../components/Room/PlayerAvatar';
import { Skeleton } from "../components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';

const Dashboard = () => {
    const { userId, name, avatarSeed, avatarPhotoURL, updateProfile } = useProfile();
    const { socket } = useSocket();
    const { user: authUser, signOut } = useAuthContext();
    
    const [history, setHistory] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);

    const isGuest = !authUser;

    const [showImportModal, setShowImportModal] = useState(false);
    const [pendingGuestUuid, setPendingGuestUuid] = useState(null);
    const [pendingGuestCount, setPendingGuestCount] = useState(0);
    const [pendingGuestSessions, setPendingGuestSessions] = useState([]);
    const [accountSessionCount, setAccountSessionCount] = useState(0);

    // Tracks guest sessions while the user is a guest.
    // Captured continuously so objects are available when the auth transition fires.
    const guestSessionsRef = useRef([]);
    useEffect(() => {
        if (isGuest) {
            guestSessionsRef.current = history;
        }
    }, [history, isGuest]);

    // Set when authUser transitions from null → authenticated user.
    // Consumed by the socket effect below to run the import check on the correct socket.
    const pendingImportCheckRef = useRef(false);

    // Effect A: Detect the guest → authenticated transition.
    // Sets a flag that Effect B consumes when the new authenticated socket arrives.
    const prevAuthUserRef = useRef(null);
    useEffect(() => {
        if (prevAuthUserRef.current === null && authUser) {
            pendingImportCheckRef.current = true;
        }
        prevAuthUserRef.current = authUser;
    }, [authUser]);

    // Effect B: Runs on the new authenticated socket after sign-in.
    // Loads Firestore profile (with OAuth fallbacks for new accounts) and
    // opens the import modal if the guest had sessions not yet in their account.
    useEffect(() => {
        if (!socket || !authUser || !pendingImportCheckRef.current) return;
        pendingImportCheckRef.current = false;

        // Load stored profile from Firestore; fall back to OAuth values for new accounts
        socket.emit('load_user_profile', {}, (profile) => {
            const updates = {};
            // Prefer Firestore-stored name; fall back to OAuth display name for new accounts
            const nameToSet = profile?.name || authUser?.displayName || null;
            if (nameToSet) updates.name = nameToSet;
            if (profile?.avatarSeed) updates.avatarSeed = profile.avatarSeed;
            if (profile?.avatarPhotoURL) updates.avatarPhotoURL = profile.avatarPhotoURL;
            if (Object.keys(updates).length > 0) updateProfile(updates);
        });

        // Capture guest sessions at the moment of sign-in (before history state is overwritten)
        const capturedGuestSessions = guestSessionsRef.current;
        const capturedGuestIds = new Set(capturedGuestSessions.map(s => s.id));

        // Fetch UID-only history (link_guest_uid not called yet → server returns only UID-matched sessions)
        setIsLoading(true);
        socket.emit('get_user_history', { userId }, (response) => {
            const accountSessions = Array.isArray(response) ? response : [];
            setHistory(accountSessions);
            setIsLoading(false);

            if (capturedGuestIds.size === 0) return; // no guest sessions to import

            // Diff: find guest sessions not already present in account
            const accountIds = new Set(accountSessions.map(s => s.id));
            const unimported = capturedGuestSessions.filter(s => !accountIds.has(s.id));

            if (unimported.length === 0) return; // all guest sessions already linked

            // Open import modal with context-aware data
            setPendingGuestUuid(userId);
            setPendingGuestCount(unimported.length);
            setPendingGuestSessions(unimported.slice(0, 5));
            setAccountSessionCount(accountSessions.length);
            setShowImportModal(true);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    // Fetch history and active rooms
    useEffect(() => {
        if (!socket || !userId) return;

        setIsLoading(true);

        // Fetch session history
        socket.emit('get_user_history', { userId }, (response) => {
            if (Array.isArray(response)) {
                setHistory(response);
            }
        });

        // Fetch currently active rooms for the user
        socket.emit('get_active_rooms', { userId }, (response) => {
            if (Array.isArray(response)) {
                setActiveRooms(response);
            }
            setIsLoading(false);
        });

    }, [socket, userId]);

    // Derived stats
    const stats = useMemo(() => {
        const totalSessions = history.length;
        const totalVotes = history.reduce((acc, session) => acc + (session.tasks?.length || 0), 0);
        const uniqueRooms = new Set(history.map(s => s.roomName)).size;
        
        return [
            { label: 'Total Sessions', value: totalSessions, icon: History, color: 'text-blue-500' },
            { label: 'Total Votes', value: totalVotes, icon: Target, iconColor: 'text-purple-500' },
            { label: 'Rooms Joined', value: uniqueRooms, icon: Users, iconColor: 'text-emerald-500' },
            { label: 'Active Tasks', value: activeRooms.length, icon: Activity, iconColor: 'text-orange-500' },
        ];
    }, [history, activeRooms]);

    const filteredHistory = history.filter(session => 
        session.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateProfile = (data) => {
        updateProfile(data);
        // If authenticated, persist the profile update to Firestore for cross-device sync
        if (authUser && socket) {
            socket.emit('save_user_profile', data, () => {});
        }
    };

    const handleImportHistory = () => {
        if (!socket || !pendingGuestUuid) {
            setShowImportModal(false);
            return;
        }
        socket.emit('link_guest_uid', { guestUuid: pendingGuestUuid }, (result) => {
            if (result?.ok === false) {
                toast.error("Couldn't import sessions — try again later.");
                return;
            }
            socket.emit('get_user_history', { userId }, (response) => {
                if (Array.isArray(response)) setHistory(response);
            });
        });
        setPendingGuestUuid(null);
        setShowImportModal(false);
    };

    const handleSkipImport = () => {
        setPendingGuestUuid(null);
        setShowImportModal(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative">
            {/* Background elements */}
            <div className="absolute inset-0 aurora z-0 opacity-20 pointer-events-none" />
            <div className="absolute inset-0 modern-grid z-0 opacity-20 pointer-events-none" />

            {/* Top Navigation */}
            <RoomNavbar 
                mode="dashboard"
                currentUser={{ id: userId, name, avatarSeed, avatarPhotoURL }}
                onOpenProfile={() => setIsProfileOpen(true)}
                authUser={authUser}
                onSignIn={() => setIsSignInOpen(true)}
                onSignOut={signOut}
            />

            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-10">

                    {/* Guest banner — shown only for unauthenticated users */}
                    {isGuest && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="shadow-none">
                                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground text-sm leading-snug">
                                            Don&apos;t lose your team&apos;s progress.
                                        </p>
                                        <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
                                            Your local history is at risk &mdash; clear your cache or switch devices and{' '}
                                            {history.length > 0
                                                ? <>these <strong className="text-foreground font-semibold">{history.length} session{history.length !== 1 ? 's' : ''}</strong> are gone forever. </>
                                                : 'any sessions you play are gone forever. '
                                            }
                                            Create a free account to sync and secure them.
                                        </p>
                                    </div>
                                    <Button
                                        className="shrink-0 rounded-xl font-bold"
                                        onClick={() => setIsSignInOpen(true)}
                                    >
                                        Create free account
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-1"
                        >
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 flex-wrap">
                                {isGuest ? 'Your Dashboard' : `Welcome back, ${name || 'Estimator'}!`}
                                {isGuest
                                    ? <Badge variant="secondary" className="text-xs font-semibold normal-case tracking-normal">Guest session</Badge>
                                    : <span className="inline-block animate-bounce-subtle text-2xl">👋</span>
                                }
                            </h1>
                            <p className="text-muted-foreground text-lg font-light max-w-2xl">
                                {isGuest
                                    ? 'History is stored in this browser. Sign in to sync across devices and never lose a session.'
                                    : 'Track your voting history, manage your sessions, and refine your estimates.'
                                }
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl h-11 px-6 font-bold" asChild>
                                <Link to="/join">Join Room</Link>
                            </Button>
                            <Button className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/20" asChild>
                                <Link to="/create">Create Room</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className={cn("p-2.5 rounded-xl bg-background border border-border shadow-inner shrink-0", stat.color)}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-black">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* History Section */}
                        <div className="lg:col-span-12 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <History className="text-primary size-5" />
                                    <h2 className="text-xl font-bold">Session History</h2>
                                    {history.length > 0 && (
                                        <Badge variant="secondary" className="rounded-full px-2 h-5 font-bold">
                                            {history.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input 
                                        placeholder="Search sessions..." 
                                        className="pl-9 h-10 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
                                {isLoading ? (
                                    <div className="p-8 space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : filteredHistory.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[300px] font-bold py-4">Room Name</TableHead>
                                                    <TableHead className="font-bold py-4">Date</TableHead>
                                                    <TableHead className="font-bold py-4">Participants</TableHead>
                                                    <TableHead className="font-bold py-4 text-right pr-6">Resolved Tasks</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence mode="popLayout">
                                                    {filteredHistory.map((session) => (
                                                        <motion.tr 
                                                            key={session.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="group hover:bg-muted/20 transition-colors"
                                                        >
                                                            <TableCell className="py-4">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                                        {session.roomName}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                                                        ID: {session.id}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-sm text-muted-foreground font-medium">
                                                                {new Date(session.endedAt || session.createdAt).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </TableCell>
                                                            <TableCell className="py-4">
                                                                <div className="flex items-center -space-x-2">
                                                                    {session.participants.slice(0, 5).map((p, i) => (
                                                                        <div key={i} className="rounded-full border-2 border-card overflow-hidden size-7 bg-muted">
                                                                            <PlayerAvatar 
                                                                                user={p} 
                                                                                size={24} 
                                                                                hideDetails 
                                                                                connected={true}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {session.participants.length > 5 && (
                                                                        <div className="size-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                                                                            +{session.participants.length - 5}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 text-right pr-6">
                                                                <Badge variant="outline" className="font-mono font-bold tracking-tight">
                                                                    {session.tasks.filter(t => t.resolved || t.status === 'COMPLETED').length} / {session.tasks.length}
                                                                </Badge>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                        </div>
                                        {isGuest && (
                                            <div className="border-t border-border/40 px-4 py-3">
                                                <p className="text-xs text-muted-foreground">
                                                    Stored in this browser &middot; unlinked sessions expire after 7 days &middot;{' '}
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 text-xs font-medium"
                                                        onClick={() => setIsSignInOpen(true)}
                                                    >
                                                        Sign in to preserve &rarr;
                                                    </Button>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                        <div className="bg-muted p-4 rounded-full">
                                            <History className="size-8 text-muted-foreground opacity-40" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg">No sessions found</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                {searchQuery ? `No sessions matching "${searchQuery}"` : "You haven't participated in any planning sessions yet."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Profile Dialog */}
            <ProfileSetupDialog 
                isOpen={isProfileOpen}
                mode="edit"
                currentUser={{ id: userId, name, avatarSeed, avatarPhotoURL }}
                onUpdateProfile={handleUpdateProfile}
                onClose={() => setIsProfileOpen(false)}
            />

            {/* Sign-in Dialog */}
            <SignInDialog
                open={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
            />

            {/* Import history modal — fires automatically after sign-in if guest had unlinked sessions */}
            <Dialog open={showImportModal} onOpenChange={(open) => { if (!open) handleSkipImport(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {accountSessionCount === 0
                                ? 'Import your guest sessions?'
                                : 'Merge your guest sessions?'
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {accountSessionCount === 0
                                ? `We found ${pendingGuestCount} session${pendingGuestCount !== 1 ? 's' : ''} from your guest visit. Import them to get started.`
                                : `We found ${pendingGuestCount} session${pendingGuestCount !== 1 ? 's' : ''} from this browser. Add them to your ${accountSessionCount} existing session${accountSessionCount !== 1 ? 's' : ''}?`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Session list — up to 5 sessions shown by name and date */}
                    {pendingGuestSessions.length > 0 && (
                        <ul className="space-y-1.5 rounded-lg border border-border/50 bg-muted/30 p-3">
                            {pendingGuestSessions.map((session) => (
                                <li key={session.id} className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground/80 truncate pr-4">
                                        {session.roomName || 'Unnamed session'}
                                    </span>
                                    <span className="text-muted-foreground shrink-0">
                                        {new Date(session.endedAt || session.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </li>
                            ))}
                            {pendingGuestCount > pendingGuestSessions.length && (
                                <li className="text-xs text-muted-foreground pt-0.5">
                                    +{pendingGuestCount - pendingGuestSessions.length} more
                                </li>
                            )}
                        </ul>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={handleSkipImport}>
                            Start fresh
                        </Button>
                        <Button onClick={handleImportHistory}>
                            Import sessions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Dashboard;
