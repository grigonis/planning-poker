import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Footer from '../components/home/Footer';
import Features from '../components/home/Features';
import FAQ from '../components/home/FAQ';
import Pricing from '../components/home/Pricing';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useEffect } from 'react';

const Landing = () => {
    const navigate = useNavigate();
    const { isSetup } = useProfile();

    useEffect(() => {
        if (isSetup && window.location.pathname === '/') {
            // navigate('/dashboard'); 
            // Commented out for now to let user see landing page unless they want to skip
        }
    }, [isSetup, navigate]);

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-900 flex flex-col relative overflow-hidden font-sans text-gray-900 dark:text-white selection:bg-banana-500/30 transition-colors duration-300">

            {/* Navbar */}
            <Navbar
                onCreateSession={() => navigate('/create')}
            />

            {/* Main Content */}
            <main className="flex-1 w-full relative z-10">
                <Hero
                    onCreateSession={() => navigate('/create')}
                />

                <HowItWorks />

                <Features />

                <FAQ />

                <Pricing />
            </main>

            {/* Footer */}
            <Footer />

        </div>
    );
};

export default Landing;
