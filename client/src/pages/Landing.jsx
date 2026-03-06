import { useState } from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Footer from '../components/home/Footer';
import CreateSessionModal from '../components/CreateSessionModal';
import Features from '../components/home/Features';
import FAQ from '../components/home/FAQ';
import Pricing from '../components/home/Pricing';

const Landing = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-900 flex flex-col relative overflow-hidden font-sans text-gray-900 dark:text-white selection:bg-banana-500/30 transition-colors duration-300">

            {/* Global Grain/Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.025] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}></div>

            {/* Navbar */}
            <Navbar
                onCreateSession={() => setIsCreateModalOpen(true)}
            />

            {/* Main Content */}
            <main className="flex-1 w-full relative z-10">
                <Hero
                    onCreateSession={() => setIsCreateModalOpen(true)}
                />

                <HowItWorks />

                <Features />

                <FAQ />

                <Pricing />
            </main>

            {/* Footer */}
            <Footer />

            {/* Modals */}
            <CreateSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

        </div>
    );
};

export default Landing;
