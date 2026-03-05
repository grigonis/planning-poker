import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

import card1 from '../../assets/card1.svg';
import card2 from '../../assets/card2.svg';
import card3 from '../../assets/card3.svg';
import card4 from '../../assets/card4.svg';
import card5 from '../../assets/card5.svg';
import card6 from '../../assets/card6.svg';
import card7 from '../../assets/card7.svg';
import card8 from '../../assets/card8.svg';
import cardBack from '../../assets/TBD_face_down_player.svg';

const CARD_FRONTS = {
    '0': card1,
    '0.5': card2,
    '1': card3,
    '2': card4,
    '3': card5,
    '5': card6,
    '8': card7,
    '13': card8,
};

const CARDS = [
    {
        value: '0',
        title: 'Awesome, PMs will love this!',
        desc: "A story which will come for almost free? That's going to make PM happy!",
    },
    {
        value: '1',
        title: 'Quick win!',
        desc: "A tiny task, done before lunch. Feels good to ship fast.",
    },
    {
        value: '2',
        title: 'Small but mighty!',
        desc: "Crisp scope, clean code. This one goes straight to done.",
    },
    {
        value: '3',
        title: 'Just right.',
        desc: "Not too big, not too small. The Goldilocks of your sprint.",
    },
    {
        value: '5',
        title: 'Worth the effort.',
        desc: "A solid story with real substance. Let's break it down together.",
    },
];

const FAN_ROTATIONS = [-12, -6, 0, 6, 12];

// Float animation delay stagger per card (seconds)
const FLOAT_DELAYS = [0, 0.7, 1.4, 0.35, 1.05];

const HeroCards = () => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const timers = CARDS.map((_, i) =>
            setTimeout(() => setVisibleCount(c => c + 1), 350 + i * 160)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    // Outer wrapper: handles fan rotation + pop-in entrance only
    const getFanTransform = (i) => {
        const isVisible = i < visibleCount;
        const isSelected = selected === i;
        const isHovered = hovered === i && !isSelected;

        if (!isVisible) return `translateY(44px) rotate(${FAN_ROTATIONS[i]}deg) scale(0.84)`;
        if (isSelected) return `translateY(-20px) rotate(0deg) scale(1.08)`;
        if (isHovered) return `translateY(-6px) rotate(${FAN_ROTATIONS[i] * 0.4}deg) scale(1.03)`;
        return `rotate(${FAN_ROTATIONS[i]}deg)`;
    };

    return (
        <div className="flex flex-col items-center w-full select-none" style={{ gap: 0 }}>

            {/* ── Description — above cards ──────────────────── */}
            <div className="w-full text-center px-4 mb-6" style={{ minHeight: '90px' }}>
                {selected !== null ? (
                    <div key={selected} className="flex flex-col items-center gap-2">
                        <p
                            className="text-xl lg:text-2xl font-heading font-bold text-banana-500 leading-tight"
                            style={{ animation: 'heroTextSlide 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' }}
                        >
                            {CARDS[selected].title}
                        </p>
                        <p
                            className="text-sm text-gray-400 leading-relaxed max-w-xs"
                            style={{ animation: 'heroTextSlide 0.42s cubic-bezier(0.22, 1, 0.36, 1) 75ms both' }}
                        >
                            {CARDS[selected].desc}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-end justify-center" style={{ minHeight: '90px' }}>
                        <p className="text-xs text-gray-500 pb-1">Pick a card to estimate your story</p>
                    </div>
                )}
            </div>

            {/* ── Card Fan ─────────────────────────────────────── */}
            <div className="flex items-end justify-center gap-3.5 lg:gap-5">
                {CARDS.map((card, i) => {
                    const isVisible = i < visibleCount;
                    const isSelected = selected === i;
                    const isHovered = hovered === i;
                    const isFloating = isVisible && !isSelected;

                    return (
                        // Outer: fan rotation + entrance + z-index
                        <div
                            key={card.value}
                            className="cursor-pointer"
                            style={{
                                transform: getFanTransform(i),
                                opacity: isVisible ? 1 : 0,
                                transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
                                zIndex: isSelected ? 10 : i,
                            }}
                            onClick={() => setSelected(prev => prev === i ? null : i)}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Inner: float animation + glow + perspective for 3D flip */}
                            <div
                                className="rounded-xl"
                                style={{
                                    // Exact 5:7 ratio — matches SVG viewBox 500×700
                                    width: 'clamp(80px, 8vw, 130px)',
                                    height: 'clamp(112px, 11.2vw, 182px)',
                                    perspective: '1000px',
                                    position: 'relative',
                                    animation: isFloating
                                        ? `cardFloat 3.8s ease-in-out ${FLOAT_DELAYS[i]}s infinite`
                                        : 'none',
                                    boxShadow: isHovered && !isSelected
                                        ? '0 18px 32px rgba(255,184,0,0.38), 0 28px 56px rgba(255,184,0,0.16)'
                                        : '0 6px 24px rgba(0,0,0,0.35)',
                                    transition: 'box-shadow 0.35s ease',
                                }}
                            >
                                <div
                                    className={clsx('flip-card-inner', isSelected && 'flipped')}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    {/* Back */}
                                    <div className="flip-card-face flip-card-back-face rounded-xl overflow-hidden">
                                        <img
                                            src={cardBack}
                                            alt="Card back"
                                            className="w-full h-full"
                                            style={{ objectFit: 'fill', display: 'block' }}
                                        />
                                    </div>
                                    {/* Front */}
                                    <div className="flip-card-face flip-card-front-face rounded-xl overflow-hidden">
                                        <img
                                            src={CARD_FRONTS[card.value]}
                                            alt={`Card ${card.value}`}
                                            className="w-full h-full"
                                            style={{ objectFit: 'fill', display: 'block' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default HeroCards;
