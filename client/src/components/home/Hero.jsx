import HeroCards from './HeroCards';
import productHuntCat from '../../assets/banana-poker/product-hunt-cat.svg';
import { ShimmerButton } from '../ui/shimmer-button';
import { InfiniteGrid } from '../ui/infinite-grid-integration';
import { ArrowRight } from 'lucide-react';

const TRUST_BADGES = ['No signup', 'Free to start', 'Real-time', 'Setup in seconds'];

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

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-[-0.04em] text-slate-900 dark:text-white">
                        Online Planning Poker.{' '}
                        Story point estimation made{' '}
                        <span className="relative inline-block">
                            effortless.
                            <svg
                                className="absolute -bottom-1 left-0 w-full overflow-visible"
                                viewBox="0 0 200 8"
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
                                    d="M2,5 C40,1 100,7 198,4"
                                    stroke="url(#champagne-underline)"
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.9"
                                />
                            </svg>
                        </span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-base md:text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-lg leading-relaxed">
                        Create a room, share the link, and start estimating instantly. No friction, no accounts, just focused team alignment.
                    </p>

                    {/* Trust signals */}
                    <p className="text-xs text-slate-400 dark:text-neutral-600 font-normal tracking-normal">
                        {TRUST_BADGES.join('  ·  ')}
                    </p>

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
                                Start Planning Poker
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
