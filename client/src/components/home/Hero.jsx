import { useState, useCallback } from 'react';
import HeroCards from './HeroCards';
import productHuntCat from '../../assets/banana-poker/product-hunt-cat.svg';
import { ShimmerButton } from '../ui/shimmer-button';
import { InfiniteGrid } from '../ui/infinite-grid-integration';
import { ArrowRight } from 'lucide-react';

const TRUST_BADGES = ['No signup', 'Free to start', 'Real-time', 'Setup in seconds'];

const SPOTLIGHT_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const Hero = ({ onCreateSession }) => {
    const [spotlightActive, setSpotlightActive] = useState(false);
    const [spotlightPos, setSpotlightPos] = useState(62); // % from left

    const handleSpotlight = useCallback((active, positionPct) => {
        setSpotlightActive(active);
        if (positionPct != null) setSpotlightPos(positionPct);
    }, []);

    return (
        <InfiniteGrid>
            {/* ── Spotlight Overlay — covers entire hero section ────── */}
            {spotlightActive && (
                <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
                    {/* Vignette — dark edges, centered on card */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `radial-gradient(ellipse 50% 60% at ${spotlightPos}% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)`,
                            animation: `vignetteFadeIn 0.8s ${SPOTLIGHT_EASING} both`,
                        }}
                    />

                    {/* Cone of light — narrow beam, tracking card */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(255,200,60,0.22) 0%, rgba(255,180,40,0.08) 40%, transparent 80%)',
                            clipPath: `polygon(${spotlightPos - 2}% 0%, ${spotlightPos + 2}% 0%, ${spotlightPos + 10}% 100%, ${spotlightPos - 10}% 100%)`,
                            transformOrigin: `${spotlightPos}% 0%`,
                            animation: `spotlightEnter 0.8s ${SPOTLIGHT_EASING} both`,
                        }}
                    />

                    {/* Lamp source — bright dot, tracking card */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-6px',
                            left: `${spotlightPos}%`,
                            transform: 'translateX(-50%)',
                            width: '22px',
                            height: '22px',
                            background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,200,60,0.4) 40%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(6px)',
                            animation: `vignetteFadeIn 0.6s ${SPOTLIGHT_EASING} 0.2s both`,
                        }}
                    />


                </div>
            )}

            <section className="w-full h-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 lg:py-20 pt-20 overflow-visible flex-1">

                {/* Left Content */}
                <div
                    className="flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700 fade-in"
                    style={{
                        transition: `opacity 0.7s ${SPOTLIGHT_EASING}, filter 0.7s ${SPOTLIGHT_EASING}`,
                        opacity: spotlightActive ? 0.35 : 1,
                        filter: spotlightActive ? 'blur(1px)' : 'none',
                    }}
                >
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
                            {/* "engaging" — irregular hand-drawn oval, asymmetric to feel human */}
                            <span className="relative inline-block whitespace-nowrap">
                                <span className="relative z-10">engaging</span>
                                <svg
                                    className="absolute z-0 pointer-events-none overflow-visible"
                                    style={{ top: '-9px', left: '-14px', width: 'calc(100% + 28px)', height: 'calc(100% + 18px)' }}
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M52,4 C72,-2 96,16 97,46 C98,76 76,97 48,96 C22,95 3,76 4,46 C5,18 26,2 52,4"
                                        fill="none"
                                        stroke="#ffb800"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </span>
                            ,{' '}
                            {/* "fun" — solid text with hand-drawn smiley above */}
                            <span className="relative inline-block whitespace-nowrap">
                                <svg
                                    aria-hidden="true"
                                    className="absolute pointer-events-none"
                                    style={{ top: '-10px', right: '-20px', width: '40px', height: '26px', transform: 'rotate(10deg)' }}
                                    viewBox="0 0 40 26"
                                    fill="none"
                                >
                                    {/* Left eye */}
                                    <path d="M11,2 C10,4 11,7 12,10" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                    {/* Right eye */}
                                    <path d="M23,1 C22,3 23,6 24,9" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                    {/* Smile */}
                                    <path d="M6,17 Q18,26 32,17" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
                                </svg>
                                <span className="relative z-10">fun</span>
                            </span>
                            , and <br className="hidden md:block" />
                            {/* "effort" stays font-medium; "less" is font-semibold + double banana-500 underline */}
                            <span className="whitespace-nowrap">effort<span className="relative inline-block font-semibold">
                                less
                                <svg
                                    className="absolute left-0 w-full overflow-visible pointer-events-none"
                                    style={{ bottom: '-12px', height: '20px' }}
                                    viewBox="0 0 100 30"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0,6 Q50,13 100,4 M0,20 Q45,15 95,22"
                                        fill="none"
                                        stroke="#ffb800"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </span></span>{' '}
                            story point <br className="hidden md:block" />
                            estimation
                        </h2>
                    </div>

                    {/* Subtext */}
                    <p className="text-base md:text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-lg leading-relaxed mt-2">
                        Scrum meetings don't have to be boring. Transform your team's velocity with Keystimate — designed for speed, engagement, and actually keeping it fun
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
                    <HeroCards onSpotlight={handleSpotlight} />
                </div>
            </section>
        </InfiniteGrid>
    );
};

export default Hero;
