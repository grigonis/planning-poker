import React, { useState } from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Footer from '../components/home/Footer';
import CreateSessionModal from '../components/CreateSessionModal';
import JoinSessionModal from '../components/JoinSessionModal';

const Landing = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-dark-900 flex flex-col relative overflow-hidden font-sans text-white selection:bg-banana-500/30">

            {/* Background Gradients */}
            {/* Background handled in Hero section */}

            {/* Navbar */}
            <Navbar
                onJoinSession={() => setIsJoinModalOpen(true)}
                onCreateSession={() => setIsCreateModalOpen(true)}
            />

            {/* Main Content */}
            <main className="flex-1 w-full relative z-10">
                <Hero
                    onCreateSession={() => setIsCreateModalOpen(true)}
                    onJoinSession={() => setIsJoinModalOpen(true)}
                />

                <HowItWorks />
            </main>

            {/* Footer */}
            <Footer />

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
