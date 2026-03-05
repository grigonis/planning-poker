import HeroCards from './HeroCards';
import productHuntCat from '../../assets/banana-poker/product-hunt-cat.svg';
import { ShimmerButton } from '../ui/shimmer-button';
import { InfiniteGrid } from '../ui/infinite-grid-integration';
import { Zap, Sprout, Radio, Layers, ArrowRight } from 'lucide-react';

const TRUST_BADGES = [
    { icon: Zap, label: 'Setup in seconds' },
    { icon: Sprout, label: 'Free to start' },
    { icon: Radio, label: 'Real-time collaboration' },
    { icon: Layers, label: 'Many advanced features' },
];

const Hero = ({ onCreateSession }) => {
    return (
        <InfiniteGrid>
            <section className="w-full h-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 lg:py-20 pt-20 overflow-visible flex-1">

                {/* Left Content */}
                <div className="flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700 fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-silver-400/10 border border-silver-400/20 w-fit">
                        <img src={productHuntCat} alt="Product Hunt" className="w-4 h-4" />
                        <span className="text-[10px] font-semibold text-silver-400 tracking-widest uppercase">
                            Now LIVE ON PRODUCT HUNT
                        </span>
                    </div>

                    {/* Heading — dual-layer trick for continuous gradient + SVG underline */}
                    <div className="relative pb-2 z-0">
                        {/* Layer 1: gradient text */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-[-0.03em] bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-600 to-slate-700 dark:from-white dark:via-silver-200 dark:to-silver-400">
                            Run Better Sprint Estimates.{' '}
                            <span className="whitespace-nowrap">In Seconds.</span>
                        </h1>

                        {/* Layer 2: invisible anchor for SVG underline under "In Seconds." */}
                        <h1 className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-[-0.03em] pointer-events-none select-none" aria-hidden="true">
                            <span className="text-transparent">Run Better Sprint Estimates.{' '}</span>
                            <span className="relative whitespace-nowrap text-transparent">
                                In Seconds.
                                <svg
                                    className="absolute -bottom-2 left-0 w-full overflow-visible"
                                    viewBox="0 0 200 10"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >
                                    <defs>
                                        <linearGradient id="champagne-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#D4AF6E" />
                                            <stop offset="50%" stopColor="#C09A3C" />
                                            <stop offset="100%" stopColor="#6B4E0A" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M2,6 C30,1 70,9 110,4 C145,0 172,8 198,5"
                                        stroke="url(#champagne-underline)"
                                        strokeWidth="2.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.9"
                                    />
                                </svg>
                            </span>
                        </h1>
                    </div>

                    {/* Subtext */}
                    <p className="text-lg md:text-xl text-slate-500 dark:text-silver-400 font-light max-w-lg leading-relaxed">
                        Create a room, share the link, and start estimating instantly. No friction, no accounts, just focused team alignment.
                    </p>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-2 w-fit">
                        {TRUST_BADGES.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 dark:bg-carbon-950/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-900/5">
                                <Icon size={14} className="text-silver-500 dark:text-silver-400 shrink-0" />
                                <span className="text-xs text-slate-600 dark:text-silver-400/70 font-medium whitespace-nowrap">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto mt-2">
                        <ShimmerButton
                            onClick={onCreateSession}
                            className="shadow-2xl z-20"
                            background="rgba(15, 23, 42, 1)"
                            shimmerSize="0.1em"
                            shimmerColor="rgba(255, 255, 255, 0.4)"
                        >
                            <span className="whitespace-pre-wrap text-center text-sm font-bold leading-none tracking-tight text-white flex items-center justify-center gap-2 px-2 py-1 relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                                Create Room
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </ShimmerButton>
                    </div>
                </div>

                {/* Right Visuals */}
                <div className="hidden lg:flex w-full h-full items-center justify-center animate-in slide-in-from-right-10 duration-1000 fade-in relative pointer-events-auto">
                    <HeroCards />
                </div>
            </section>
        </InfiniteGrid>
    );
};

export default Hero;
