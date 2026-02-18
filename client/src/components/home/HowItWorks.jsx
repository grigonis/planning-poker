import React from 'react';
import step1 from '../../assets/banana-poker/step1-peel.png';
import step2 from '../../assets/banana-poker/step2-gather.png';
import step3 from '../../assets/banana-poker/step3-vote.png';

const HowItWorks = () => {
    const steps = [
        {
            title: "Step 1: Peel a New Session",
            description: "Enter your display name, choose your card values, and pick your role. No complex backlog needed—just pure, continuous voting.",
            image: step1,
            gradient: "from-banana-500/20 to-banana-500/5",
        },
        {
            title: "Step 2: Gather the Bunch",
            description: "Invite your teammates and get the whole bunch together at the table in mere moments.",
            image: step2,
            gradient: "from-banana-500/20 to-banana-500/5",
        },
        {
            title: "Step 3: Vote and Reveal",
            description: "Enjoy every aspect of our online Scrum planning poker—and have a bunch of fun while staying productive!",
            image: step3,
            gradient: "from-banana-500/20 to-banana-500/5",
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
            {/* Header */}
            <div className="mb-16">
                <h2 className="text-5xl font-bold font-heading text-white tracking-tight mb-6">
                    How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500">Peel Your Sprint.</span>
                </h2>
                <p className="text-xl text-gray-400 font-light font-heading max-w-3xl leading-relaxed">
                    A fresh take on Scrum planning. Simple, collaborative, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500 font-bold italic">un-peel-ievably</span> fun—even for a tired development team on a Friday afternoon.
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-banana-500/50 transition-colors duration-500">
                        <div className="relative h-full bg-[#151921]/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">

                            {/* Image Container */}
                            <div className="h-64 relative bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                                <div className="absolute inset-0 bg-radial-gradient from-banana-500/10 to-transparent opacity-50"></div>
                                <img src={step.image} alt={step.title} className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700" />

                                {/* Badge if exists */}
                                {step.badge && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-banana-500 to-orange-500 px-4 py-1 rounded-full shadow-lg">
                                        <span className="text-dark-900 font-bold font-heading text-sm">{step.badge}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col gap-4 flex-1">
                                <h3 className="text-xl font-bold font-heading text-white">{step.title}</h3>
                                <p className="text-gray-400 font-light font-heading leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
