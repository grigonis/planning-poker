import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    LayoutDashboard, 
    History, 
    Settings, 
    PlusCircle, 
    User,
    LogOut,
    ExternalLink,
    Users,
    Calendar,
    ChevronRight,
    Search,
    Play,
    Zap
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { userId, name, avatarSeed, updateProfile } = useProfile();
    const [tempName, setTempName] = useState(name);
    const [history, setHistory] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isConnected && socket && userId) {
            setLoading(true);
            // Fetch History
            socket.emit('get_user_history', { userId }, (data) => {
                setHistory(data || []);
            });
            // Fetch Active Rooms
            socket.emit('get_active_rooms', { userId }, (data) => {
                setActiveRooms(data || []);
                setLoading(false);
            });
        }
    }, [isConnected, socket, userId]);

    // Update tempName when profile name becomes available or changes
    useEffect(() => {
        setTempName(name);
    }, [name]);

    const handleSaveProfile = () => {
        updateProfile({ name: tempName });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const filteredHistory = history.filter(item => 
        item.roomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-carbon-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-carbon-950 flex flex-col shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">K</div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Keystimate
                        </span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Button variant="ghost" className="justify-start gap-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white">
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2 text-slate-500 hover:text-slate-900 dark:text-silver-400 dark:hover:text-white">
                            <History className="size-4" />
                            History
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2 text-slate-500 hover:text-slate-900 dark:text-silver-400 dark:hover:text-white">
                            <Settings className="size-4" />
                            Settings
                        </Button>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/10">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => navigate('/')}>
                        <LogOut className="size-4" />
                        Exit to Landing
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Welcome back, {name || 'Ninja'}!
                            </h1>
                            <p className="text-slate-500 dark:text-silver-400">
                                {history.length > 0 
                                    ? `You've participated in ${history.length} estimation sessions.` 
                                    : "You haven't joined any rooms yet."}
                            </p>
                        </div>
                        <Button onClick={() => navigate('/create')} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
                            <PlusCircle className="size-4" />
                            New Room
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <Card className="lg:col-span-1 border-slate-200 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-carbon-900/50 backdrop-blur-sm h-fit">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Your Profile
                                </CardTitle>
                                <CardDescription>Personalize your workspace identity.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-6">
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <Avatar className="size-24 border-4 border-slate-100 dark:border-white/5 shadow-xl transition-transform duration-300 group-hover:scale-105">
                                            {avatarSeed && (
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                                            )}
                                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                                {name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                            <span className="text-white text-xs font-bold">Change</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-silver-300">Display Name</label>
                                    <Input 
                                        value={tempName} 
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 focus-visible:ring-primary"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button 
                                    className="w-full" 
                                    disabled={tempName === name} 
                                    onClick={handleSaveProfile}
                                >
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Sessions List */}
                        <Card className="lg:col-span-2 border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-carbon-900/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <History className="size-4 text-primary" />
                                        Session History
                                    </CardTitle>
                                    <CardDescription>Rooms you've participated in.</CardDescription>
                                </div>
                                <div className="relative w-48">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search history..."
                                        className="pl-9 h-9 text-xs"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredHistory.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="font-bold">Room</TableHead>
                                                <TableHead className="font-bold">Date</TableHead>
                                                <TableHead className="font-bold text-center">Tasks</TableHead>
                                                <TableHead className="font-bold text-center">Team</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredHistory.map((item) => (
                                                <TableRow 
                                                    key={item.id} 
                                                    className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors border-slate-100 dark:border-white/5"
                                                    onClick={() => navigate(`/room/${item.id}`)}
                                                >
                                                    <TableCell className="py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                                {item.roomName || 'Untitled Room'}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                                                ID: {item.id}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-500 dark:text-silver-400 text-sm py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="size-3 opacity-60" />
                                                            {formatDate(item.endedAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <span className="inline-flex items-center justify-center size-7 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-bold text-slate-600 dark:text-silver-300">
                                                            {item.tasks?.length || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center py-4">
                                                        <div className="flex items-center justify-center -space-x-2">
                                                            {item.participants?.slice(0, 3).map((p, i) => (
                                                                <Avatar key={p.id} className="size-7 border-2 border-white dark:border-carbon-900 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatarSeed || p.name}`} />
                                                                    <AvatarFallback className="text-[10px] font-bold">{p.name?.[0]}</AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            {item.participants?.length > 3 && (
                                                                <div className="size-7 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-white dark:border-carbon-900 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-silver-400">
                                                                    +{item.participants.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-4">
                                                        <ChevronRight className="size-5 text-slate-300 dark:text-white/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                        <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                                            <History className="size-8 text-slate-200 dark:text-white/10" />
                                        </div>
                                        <div className="max-w-[240px]">
                                            <p className="text-slate-900 dark:text-white font-bold">No sessions found</p>
                                            <p className="text-sm text-slate-500 dark:text-silver-400 mt-1">
                                                {searchQuery ? "We couldn't find any rooms matching your search." : "Join or create a room to start tracking your estimation history."}
                                            </p>
                                        </div>
                                        <Button variant="outline" className="mt-2" onClick={() => navigate('/create')}>
                                            Start new room
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Sessions Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">Workspace Quick Access</h2>
                            <Separator className="flex-1 opacity-10" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Active Rooms */}
                            {activeRooms.map((room) => (
                                <Card 
                                    key={room.id}
                                    className="border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] transition-all cursor-pointer group shadow-sm relative overflow-hidden"
                                    onClick={() => navigate(`/room/${room.id}`)}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Zap className="size-5 text-primary animate-pulse" />
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                <span className="size-1.5 bg-green-500 rounded-full animate-ping" />
                                                Active
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                            {room.roomName || 'Untitled Room'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-silver-400 mt-1 line-clamp-1">
                                            {room.roomDescription || 'Ongoing estimation session'}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-slate-400 dark:text-silver-500 text-xs font-medium">
                                                    <Users className="size-3" />
                                                    {room.participantCount}
                                                </div>
                                                <div className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                                                    {room.phase}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                Rejoin
                                                <Play className="size-3 fill-current" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Create New Card */}
                            <Card className="border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all cursor-pointer group shadow-none" onClick={() => navigate('/create')}>
                                <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-[180px]">
                                    <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlusCircle className="size-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-900 dark:text-white">New Workspace</p>
                                        <p className="text-xs text-slate-500 dark:text-silver-400">Launch a new voting session</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
