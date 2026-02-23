import React from 'react';

const WhatIsScrumPoker = () => {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10" aria-label="What is Scrum Poker and Why Bananas?">
            <div className="flex flex-col lg:flex-row gap-16 items-center">

                {/* Text Content */}
                <article className="flex-1 space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight mb-4">
                            What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500">Scrum Poker?</span>
                        </h2>
                        <p className="text-lg text-gray-400 font-light font-heading leading-relaxed">
                            Scrum Poker (or Planning Poker) is a consensus-based, gamified technique for estimating the effort or relative size of development goals. By using a modified Fibonacci sequence, teams avoid cognitive biases like anchoring and groupthink. Everyone plays their cards face down, and reveals them simultaneously.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-heading text-white">So... Why Bananas? 🍌</h3>
                        <p className="text-lg text-gray-400 font-light font-heading leading-relaxed">
                            Let's be honest: estimating software development can feel like herding cats in a room full of monkeys. Requirements change, bugs appear out of nowhere, and timelines slip. Sometimes, agile estimation goes completely <em className="text-banana-500 font-bold not-italic">bananas</em>.
                        </p>
                        <p className="text-lg text-gray-400 font-light font-heading leading-relaxed">
                            Banana Poker leans into this chaos. It acknowledges the myths of "perfect estimation" by wrapping industry-standard agile methodologies in a playful, low-stress environment. By dropping the corporate stiffness, your engineering team can focus on what matters: honest communication and building great products.
                        </p>
                    </div>
                </article>

                {/* Visual / Graphic element */}
                <div className="flex-1 relative w-full h-[400px] flex items-center justify-center">
                    {/* Background glows */}
                    <div className="absolute inset-0 bg-radial-gradient from-orange-500/10 to-transparent blur-3xl rounded-full opacity-60"></div>

                    {/* Glassmorphic Container for some visual interest */}
                    <div className="relative z-10 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
                        <div className="text-center space-y-4">
                            <span className="text-6xl block">🎭</span>
                            <div className="text-2xl font-bold font-heading text-white">The Agile Paradox</div>
                            <p className="text-gray-400 font-light">
                                "Measurements are objective. Estimates are just guesses dressed up in business casual."
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <span className="w-12 h-1 bg-gradient-to-r from-banana-500 to-orange-500 rounded-full"></span>
                                <span className="w-4 h-1 bg-gradient-to-r from-banana-500 to-orange-500 rounded-full opacity-50"></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default WhatIsScrumPoker;
