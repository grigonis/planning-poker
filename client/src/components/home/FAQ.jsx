import React, { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-banana-500/50">
            <button
                className="w-full text-left px-6 py-4 flex justify-between items-center text-gray-900 dark:text-white focus:outline-none"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-bold font-heading pr-8">{question}</h3>
                <span className={`transform transition-transform duration-300 text-banana-500 font-bold ${isOpen ? 'rotate-45' : ''}`}>
                    +
                </span>
            </button>
            <div
                className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 font-light font-heading leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

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
            question: "Is Banana Poker completely free?",
            answer: "Yes, Banana Poker is absolutely free. We built this tool to help agile teams align on their velocity faster, without the headache of costly licensing. Consider it our open-source style gift to the community!"
        },
        {
            question: "How is the consensus effort calculated?",
            answer: "We summarize the points based on your selected estimation strategy (usually an average or the maximum outlier), helping spark conversations when there's a strong disagreement between teammates."
        }
    ];

    return (
        <section className="w-full max-w-4xl mx-auto px-6 py-20 relative z-10" id="faq">
            <div className="mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-banana-500 to-orange-500">Questions.</span>
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-light font-heading">
                    Clear answers for your agile curiosity.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                    />
                ))}
            </div>
        </section>
    );
};

export default FAQ;
