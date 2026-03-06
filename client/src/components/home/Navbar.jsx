import { useState, useEffect } from 'react';
import KeystimateLogo from '../KeystimateLogo';
import ThemeToggle from '../ThemeToggle';

const Navbar = ({ onCreateSession }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <nav
                className={`pointer-events-auto transition-all duration-300 ease-out flex items-center justify-between
                    ${scrolled
                        ? 'w-full max-w-4xl h-[64px] pl-5 pr-3 bg-white/70 dark:bg-carbon-950/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-lg shadow-slate-900/5'
                        : 'w-full max-w-7xl h-[64px] px-2 bg-transparent border border-transparent rounded-full'
                    }
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-2 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="relative flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                        <KeystimateLogo className="w-auto h-8" />
                    </div>
                    <div className="flex flex-col justify-center leading-none overflow-hidden whitespace-nowrap pl-1">
                        <span className="text-xl md:text-2xl tracking-tight text-neutral-800 dark:text-neutral-200 transition-all duration-300 flex items-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            <span className="font-semibold">Key</span><span className="font-normal">stimate</span>
                        </span>
                    </div>
                </div>

                {/* Links - Center pill */}
                <div className={`hidden md:flex items-center gap-6 lg:gap-8 h-[44px] px-6 rounded-full transition-colors duration-300 ${!scrolled ? 'bg-slate-200/50 dark:bg-silver-400/[0.04] border border-slate-200/50 dark:border-silver-400/[0.08] backdrop-blur-md' : 'bg-transparent border-transparent'}`}>
                    {['How It Works', 'Features', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-[11px] font-bold text-slate-600 dark:text-silver-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 uppercase tracking-widest whitespace-nowrap"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <ThemeToggle />
                    <button
                        onClick={onCreateSession}
                        className="bg-gradient-to-r from-champagne-300 to-champagne-500 text-white font-bold hover:from-champagne-400 hover:to-champagne-600 transition-all duration-200 shadow-[0_4px_16px_rgba(192,154,60,0.35)] whitespace-nowrap rounded-full active:scale-95 h-[44px] px-6 flex items-center justify-center text-sm"
                    >
                        Create Room
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
