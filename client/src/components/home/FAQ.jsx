import { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`transition-colors duration-300 rounded-2xl ${isOpen ? 'bg-gray-100 dark:bg-[#222222]' : 'bg-transparent'}`}>
            <button
                className="w-full text-left px-6 py-5 flex justify-between items-center text-gray-900 dark:text-white focus:outline-none"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-medium pr-8">{question}</h3>
                <span className={`text-gray-500 dark:text-neutral-200 flex-shrink-0 ml-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </span>
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-gray-600 dark:text-neutral-200 text-base leading-relaxed">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    // Array to hold indices of open items
    const [openIndices, setOpenIndices] = useState([0]);

    const toggleFAQ = (index) => {
        setOpenIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const faqs = [
        {
            question: "What is Planning Poker?",
            answer: "Planning Poker (also known as Scrum Poker) is a consensus-based technique for estimating, mostly used to estimate effort or relative size of development goals in software development. In this game-like method, members of the group make estimates by playing numbered cards face-down to the table, instead of spoken out loud."
        },
        {
            question: "Do I need to sign up for an account to create a room?",
            answer: "No sign up needed! Anyone can create a new session room instantly. Just enter your display name, choose your role, and you're good to pick your cards."
        },
        {
            question: "Is Scrumky completely free?",
            answer: "Yes, Scrumky is absolutely free. We built this tool to help agile teams align on their velocity faster, without the headache of costly licensing. Consider it our open-source style gift to the community!"
        },
        {
            question: "How is the consensus effort calculated?",
            answer: "We summarize the points based on your selected estimation strategy (usually an average or the maximum outlier), helping spark conversations when there's a strong disagreement between teammates."
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10" id="faq">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                {/* Left Column */}
                <div className="lg:col-span-5 flex flex-col items-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 mb-6 ">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        <span className="text-xs text-gray-600 dark:text-neutral-200 font-medium">Frequently Asked Questions</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl xl:text-5xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4 tracking-tight whitespace-nowrap">
                        Questions & Answers
                    </h2>

                    <p className="text-gray-500 dark:text-neutral-200 text-lg mb-8 ">
                        Can't find what you're looking for?
                    </p>

                    <a href="mailto:support@bananapoker.com" className="inline-block px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] border border-transparent dark:border-white/5 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors ">
                        Contact Us
                    </a>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 flex flex-col gap-2 ">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndices.includes(index)}
                            onClick={() => toggleFAQ(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
