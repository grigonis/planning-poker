import HeroCards from './HeroCards';
import productHuntCat from '../../assets/banana-poker/product-hunt-cat.svg';
import createRoomIcon from '../../assets/banana-poker/create-room-icon.svg';
import heroIllustration from '../../assets/banana-poker/hero-illustration.png';
import HeroBackground from './HeroBackground';
import { Zap, Sprout, Radio, Layers } from 'lucide-react';

const TRUST_BADGES = [
    { icon: Zap,    label: 'Setup in seconds' },
    { icon: Sprout, label: 'Free to start' },
    { icon: Radio,  label: 'Real-time collaboration' },
    { icon: Layers, label: 'Many advanced features' },
];


const Hero = ({ onCreateSession }) => {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 pt-32 lg:py-20 lg:pt-40 overflow-visible">

            {/* Background Effects (Localized to Hero) */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Single Large Gradient Behind Cards */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-banana-500/20 to-transparent blur-3xl opacity-60 dark:opacity-60 opacity-30"></div>

                {/* Animated Dotted Pattern Canvas */}
                <HeroBackground />
            </div>

            {/* Left Content */}
            <div className="flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700 fade-in">
                {/* Product Hunt Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-banana-500/10 border border-banana-500/20 w-fit">
                    <img src={productHuntCat} alt="Product Hunt" className="w-4 h-4" />
                    <span className="text-[10px] font-bold  text-banana-500 tracking-widest uppercase">
                        Now LIVE ON PRODUCT HUNT
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 dark:text-neutral-200 leading-[1.1] tracking-tight">
                    Run Better Sprint Estimates.{' '}
                    <span className="relative whitespace-nowrap inline-block">
                        In Seconds.
                        <svg
                            className="absolute -bottom-2 left-0 w-full overflow-visible"
                            viewBox="0 0 200 10"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M2,6 C30,1 70,9 110,4 C145,0 172,8 198,5"
                                stroke="#ffb800"
                                strokeWidth="2.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-lg leading-relaxed">
                    Create a room, share the link, and start estimating instantly. No friction, no accounts, just focused team alignment.
                </p>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-2 w-fit">
                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                            <Icon size={14} className="text-banana-500 shrink-0" />
                            <span className="text-xs text-white/60 font-medium whitespace-nowrap">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onCreateSession}
                        className="px-8 py-4 bg-banana-500 rounded-xl flex items-center justify-center gap-2 text-dark-900 font-bold hover:bg-banana-400 transition-colors shadow-xl shadow-banana-500/20 active:scale-95"
                    >
                        <span>Create Room</span>
                        <img src={createRoomIcon} alt="NewRoomIcon" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right Visuals — hidden on screens narrower than lg */}
            <div className="hidden lg:flex w-full items-center justify-center animate-in slide-in-from-right-10 duration-1000 fade-in relative">
                <HeroCards />
            </div>
        </section>
    );
};

export default Hero;
