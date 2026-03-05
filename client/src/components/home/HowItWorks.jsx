import step1 from '../../assets/banana-poker/step1-peel.avif';
import step2 from '../../assets/banana-poker/step2-gather.avif';
import step3 from '../../assets/banana-poker/step3-vote.avif';

const StepCard = ({ image, title, description }) => (
    <div className="bento-noise relative aspect-[4/5] overflow-hidden rounded-3xl
        bg-white dark:bg-[#101010]
        border border-gray-200 dark:border-white/5
        backdrop-blur-xl
        hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(148,163,184,0.08)]
        transition-all duration-500 ease-out
        group cursor-default isolate"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
    >
        {/* Animated hover beam */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-silver-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

        {/* Full-cover image */}
        <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] z-0"
        />

        {/* Subtle background highlight on hover */}
        <div className="absolute inset-0 bg-silver-400/0 group-hover:bg-silver-400/5 transition-colors duration-500 z-10" />

        {/* Gradient only behind the text */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

        {/* Text */}
        <div className="absolute inset-x-0 bottom-0 p-7 z-20">
            <h3 className=" font-bold text-white text-xl leading-snug transition-transform duration-500 ease-out group-hover:-translate-y-1">
                {title}
            </h3>
            <div className="overflow-hidden">
                <p className="mt-3 text-sm leading-relaxed text-gray-300 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                    {description}
                </p>
            </div>
        </div>
    </div>
);

const HowItWorks = () => {
    const steps = [
        {
            title: "Step 1: Create a Session",
            description: "Enter your display name, choose your card values, and pick your role. No complex backlog needed—just pure, continuous voting.",
            image: step1,
        },
        {
            title: "Step 2: Invite Your Team",
            description: "Share a link and get your whole team together at the table in seconds. No accounts, no friction.",
            image: step2,
        },
        {
            title: "Step 3: Vote and Reveal",
            description: "Everyone votes simultaneously. Reveal all estimates at once to eliminate anchoring bias and spark productive conversations.",
            image: step3,
        },
    ];

    return (
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
            <div className="mb-16">
                <h2 className="text-5xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight mb-6">
                    How to <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-600 to-silver-400 dark:from-silver-200 dark:to-silver-400">Run Your Sprint.</span>
                </h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-light  max-w-3xl leading-relaxed">
                    A fresh take on Scrum planning. Simple, collaborative, and{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-600 to-silver-400 dark:from-silver-200 dark:to-silver-400 font-semibold italic">surprisingly effective</span> — even for a tired team on a Friday afternoon.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                    <StepCard key={index} {...step} />
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
