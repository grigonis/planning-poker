import React from 'react';
import { Eye, Zap, Link2, EyeOff, Crown, Users, ImageIcon } from 'lucide-react';

const features = [
    {
        title: "Simultaneous Reveal",
        description: "All votes surface at once — eliminating anchoring bias where hearing one number first warps everyone else's estimate.",
        icon: Eye,
        colSpan: 'md:col-span-2',
        image: null, // replace with: import revealImg from '../../assets/feature-reveal.png'
    },
    {
        title: "Real-time Sync",
        description: "Every vote and reveal updates live across all participants via persistent WebSocket connections.",
        icon: Zap,
        colSpan: 'md:col-span-1',
        image: null,
    },
    {
        title: "No Sign-Up",
        description: "Join instantly via a shared link. No accounts, no passwords, no friction.",
        icon: Link2,
        colSpan: 'md:col-span-1',
        image: null,
    },
    {
        title: "Anonymous Voting",
        description: "Estimates submitted without social pressure — no authority bias, no conformity effects.",
        icon: EyeOff,
        colSpan: 'md:col-span-1',
        image: null,
    },
    {
        title: "Host Controls",
        description: "Facilitate with observer mode, round resets, and precision control over reveal timing.",
        icon: Crown,
        colSpan: 'md:col-span-1',
        image: null,
    },
    {
        title: "Role System",
        description: "Developer, QA, and Observer — every team member participates in the way that fits their context.",
        icon: Users,
        colSpan: 'md:col-span-2',
        image: null,
    },
];

const BentoCard = ({ feature }) => {
    const Icon = feature.icon;
    const isWide = feature.colSpan === 'md:col-span-2';

    return (
        <div className={`bento-noise relative overflow-hidden rounded-3xl p-6
            bg-white dark:bg-[#101010]
            border border-gray-200 dark:border-white/5
            backdrop-blur-xl
            hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(255,165,0,0.1)]
            transition-all duration-500 ease-out
            group flex flex-col gap-5
            ${feature.colSpan}`}
        >
            {/* Animated hover beam */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Text content */}
            <div className="flex flex-col gap-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-banana-500/10 text-banana-500 self-start flex-shrink-0">
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="text-base font-semibold font-heading text-gray-900 dark:text-white mb-1.5 leading-snug">
                        {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                        {feature.description}
                    </p>
                </div>
            </div>

            {/* Image slot */}
            <div className={`w-full overflow-hidden rounded-xl
                border border-gray-200 dark:border-white/10
                bg-gray-50 dark:bg-white/5
                ${isWide ? 'h-36' : 'h-28'}`}
            >
                {feature.image ? (
                    <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                        <ImageIcon size={16} className="text-gray-300 dark:text-white/15" />
                        <span className="text-[10px] text-gray-300 dark:text-white/15 font-mono tracking-wide">
                            screenshot
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Features = () => {
    return (
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
            <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500">Perfect Hand</span> of Features.
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-light font-heading max-w-xl leading-relaxed">
                    Designed to fix everything you hate about agile estimation meetings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {features.map((feature, index) => (
                    <BentoCard key={index} feature={feature} />
                ))}
            </div>
        </section>
    );
};

export default Features;
