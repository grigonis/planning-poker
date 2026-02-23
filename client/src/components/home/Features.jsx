import React from 'react';

const Features = () => {
    const featuresList = [
        {
            title: "Simultaneous Card Reveal",
            description: "To prevent anchoring bias—where the first estimate mentioned influences everyone else—all cards are revealed at the same time only after everyone has voted.",
            icon: "🃏"
        },
        {
            title: "Anonymous Voting",
            description: "Eliminate psychological biases like authority and conformity. Allow team members to submit estimates in a safe space for honest opinions.",
            icon: "🕵️"
        },
        {
            title: "No Sign-Up Required",
            description: "Reduce friction significantly. Allow participants to join a session instantly via a shared link without needing to create an account or remember passwords.",
            icon: "🔗"
        },
        {
            title: "Facilitation & Host Controls",
            description: "Essential session management features including 'observer mode' for stakeholders who need to follow the process without influencing the vote.",
            icon: "👑"
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
            <div className="mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500">Perfect Hand</span> of Features.
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-light font-heading max-w-2xl mx-auto leading-relaxed">
                    Designed to fix everything you hate about agile estimation meetings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuresList.map((feature, index) => (
                    <div
                        key={index}
                        className="p-8 rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg hover:bg-gray-50 dark:hover:bg-white/10 hover:border-banana-500/30 transition-all duration-300 flex flex-col items-center text-center group"
                    >
                        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-light font-heading leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
