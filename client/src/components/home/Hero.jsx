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
                    <div className="flex flex-col gap-4 relative z-20">
                        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                            Online Planning Poker.
                        </h1>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-slate-800 dark:text-gray-100 leading-[1.3] md:leading-[1.3] max-w-4xl">
                            Unlock{' '}
                            <span className="relative inline-block whitespace-nowrap">
                                <span className="relative z-10">engaging</span>
                                {/* SVG Circle around "engaging" */}
                                <svg className="absolute -top-2 -bottom-2 -left-3 -right-3 w-[calc(100%+24px)] h-[calc(100%+16px)] z-0 pointer-events-none overflow-visible" viewBox="0 0 120 50" preserveAspectRatio="none">
                                    <path d="M40,10 C80,0 115,10 115,25 C115,45 80,50 40,50 C10,50 5,30 15,15 C20,5 35,5 45,10" 
                                          fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </span>
                            ,{' '}
                            <span className="relative inline-block whitespace-nowrap mx-1">
                                <span className="relative z-10 text-orange-600 dark:text-orange-500 font-bold drop-shadow-sm tracking-wide">fun</span>
                                <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] z-0 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <path d="M5,25 Q50,15 95,20" fill="none" stroke="#fcd34d" strokeWidth="16" opacity="0.3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </span>
                            , and <br className="hidden md:block" />
                            effort<span className="relative inline-block whitespace-nowrap">
                                <span className="relative z-10">less</span>
                                {/* Double underline under "less" */}
                                <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-4 overflow-visible pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                                    <path d="M0,10 Q50,15 100,5 M5,25 Q45,20 90,25" fill="none" stroke="#facc15" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                </svg>
                            </span>{' '}
                            story point <br className="hidden md:block" />
                            estimation
                        </h2>
                    </div>

                    {/* Subtext */}
                    <p className="text-base md:text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-lg leading-relaxed mt-2">
                        Scrum meetings don’t have to be boring. Transform your team’s velocity with Keystimate — designed for speed, engagement, and actually keeping it fun
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
