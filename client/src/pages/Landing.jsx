import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShufflingCards from '../components/ShufflingCards';
import CreateSessionModal from '../components/CreateSessionModal';
import JoinSessionModal from '../components/JoinSessionModal';

const Landing = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col relative overflow-hidden font-sans text-white">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-violet-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Navbar */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                        P
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        PlanPoint
                    </span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Column: Text & Actions */}
                <div className="flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700 fade-in">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm w-fit">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-300">Live Sync Enabled</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                            Agile Estimation <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                                Reimagined
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                            Stop wasting time in planning meetings. Ensure accurate, unbiased estimations with our real-time planning poker tool.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-xl shadow-white/5 active:scale-95"
                        >
                            Create New Session
                        </button>
                        <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/10 transition-colors active:scale-95"
                        >
                            Join Session
                        </button>
                    </div>
                </div>

                {/* Right Column: Visuals */}
                <div className="h-[500px] w-full flex items-center justify-center animate-in slide-in-from-right-10 duration-1000 fade-in">
                    <div className="relative w-full h-full max-w-md">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none lg:hidden"></div>
                        <ShufflingCards />
                    </div>
                </div>

            </main>

            {/* Modals */}
            <CreateSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <JoinSessionModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />

        </div>
    );
};

export default Landing;
