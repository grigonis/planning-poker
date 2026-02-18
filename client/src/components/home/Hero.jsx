import React from 'react';
import ShufflingCards from '../ShufflingCards';
import productHuntCat from '../../assets/banana-poker/product-hunt-cat.svg';
import createRoomIcon from '../../assets/banana-poker/create-room-icon.svg';
import heroIllustration from '../../assets/banana-poker/hero-illustration.png';
import HeroBackground from './HeroBackground';


const Hero = ({ onCreateSession }) => {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 pt-32 lg:py-20 lg:pt-40 overflow-visible">

            {/* Background Effects (Localized to Hero) */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Single Large Gradient Behind Cards */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-banana-500/20 to-transparent blur-3xl opacity-60"></div>

                {/* Animated Dotted Pattern Canvas */}
                <HeroBackground />
            </div>

            {/* Left Content */}
            <div className="flex flex-col gap-8 animate-in slide-in-from-left-10 duration-700 fade-in">
                {/* Product Hunt Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-banana-500/10 border border-banana-500/20 w-fit">
                    <img src={productHuntCat} alt="Product Hunt" className="w-4 h-4" />
                    <span className="text-[10px] font-bold font-heading text-banana-500 tracking-widest uppercase">
                        Now LIVE ON PRODUCT HUNT
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-white leading-[1.1] tracking-tight">
                    Sprints are better when they are
                    <img
                        src={heroIllustration}
                        alt="BANANAS"
                        className="block mt-2 w-full max-w-[400px] object-contain animate-in fade-in slide-in-from-left-5 duration-700"
                    />
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-gray-400 font-light font-heading max-w-lg leading-relaxed">
                    Peel back the complexity of agile estimation. Banana Poker is the high-fidelity, bias-free planning tool designed to help remote teams align faster and build better.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={onCreateSession}
                        className="px-8 py-4 bg-banana-500 rounded-xl flex items-center justify-center gap-2 text-dark-900 font-bold font-heading hover:bg-banana-400 transition-colors shadow-xl shadow-banana-500/20 active:scale-95"
                    >
                        <span>Create Room</span>
                        <img src={createRoomIcon} alt="NewRoomIcon" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Right Visuals */}
            <div className="h-[500px] w-full flex items-center justify-center animate-in slide-in-from-right-10 duration-1000 fade-in relative">
                {/* Removed local glow since we have the main gradient now */}
                <ShufflingCards />
            </div>
        </section>
    );
};

export default Hero;
