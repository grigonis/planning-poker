import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
        title: 'Already Done or Not Needed',
        desc: "This story brings no additional effort. It&apos;s either completed, duplicated, or no longer relevant. In Scrum terms: we save time by not building what doesn&apos;t create value.",
    },
    {
        value: '0.5',
        title: 'Almost Free',
        desc: "A micro-task. Minimal complexity, minimal risk, clear scope. Perfect for quick momentum and early sprint wins - the kind that keeps velocity healthy and morale high.",
    },
    {
        value: '3',
        title: 'Well Understood',
        desc: "Clear acceptance criteria, manageable effort, limited uncertainty. A balanced story that fits comfortably within a sprint without surprises hiding in the backlog.",
    },
    {
        value: '5',
        title: 'Solid Investment',
        desc: "Meaningful effort with tangible impact. Requires coordination, thoughtful implementation, and possibly a short breakdown discussion. The kind of story that moves the product forward.",
    },
    {
        value: '13',
        title: "Let's Split This",
        desc: "High complexity or significant unknowns detected. In Scrum practice, this is usually a signal to refine, clarify, or divide the story before committing it to a sprint.",
    },
];

const FAN_ROTATIONS = [-12, -6, 0, 6, 12];
const FLOAT_DELAYS = [0, 0.7, 1.4, 0.35, 1.05];
const SPOTLIGHT_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const PARTICLE_COUNT = 12;


// Generate stable particle configs once — no delay, stagger via duration variety
const generateParticles = () =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        driftY: -(150 + Math.random() * 200),
        driftX: (Math.random() - 0.5) * 60,
        duration: 2.5 + Math.random() * 3.5,
        opacity: 0.15 + Math.random() * 0.25,
        left: 20 + Math.random() * 60,
        bottom: Math.random() * 40,
        size: 1 + Math.random() * 2,
    }));

const HeroCards = ({ onSpotlight }) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [selected, setSelected] = useState(null);
    const [flipDone, setFlipDone] = useState(false);
    const [hovered, setHovered] = useState(null);
    const [cardOffsets, setCardOffsets] = useState([]);
    const containerRef = useRef(null);
    const cardRefs = useRef([]);
    const flipTimerRef = useRef(null);
    const particles = useMemo(generateParticles, []);

    const isSpotlight = selected !== null;

    // Cleanup flip timer on unmount
    useEffect(() => {
        return () => {
            if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
        };
    }, []);

    // Staggered entrance
    useEffect(() => {
        const timers = CARDS.map((_, i) =>
            setTimeout(() => setVisibleCount(c => c + 1), 350 + i * 160)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    // Notify parent of spotlight state + card position for dynamic spotlight
    useEffect(() => {
        if (!isSpotlight) {
            onSpotlight?.(false, null);
            return;
        }
        // Calculate the selected card's center position as % of the hero section
        const el = cardRefs.current[selected];
        if (el) {
            // Find the hero section ancestor (the InfiniteGrid's section)
            const heroSection = el.closest('section')?.parentElement;
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                const cardRect = el.getBoundingClientRect();
                const offsetX = cardOffsets[selected] || 0;
                const cardCenterX = cardRect.left + cardRect.width / 2 + offsetX;
                const pct = ((cardCenterX - heroRect.left) / heroRect.width) * 100;
                onSpotlight?.(true, pct);
                return;
            }
        }
        onSpotlight?.(true, null);
    }, [isSpotlight, selected, cardOffsets, onSpotlight]);

    // Calculate DOM-measured offsets for repositioning
    const calculateOffsets = useCallback(() => {
        if (selected === null || !containerRef.current) {
            setCardOffsets([]);
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const SPREAD = 25;

        const offsets = CARDS.map((_, i) => {
            const el = cardRefs.current[i];
            if (!el) return 0;

            const rect = el.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;

            if (i === selected) {
                // Move selected card to container center
                return containerCenterX - cardCenterX;
            }

            // Non-selected: push outward from center
            if (i < selected) {
                return -SPREAD;
            }
            return SPREAD;
        });

        setCardOffsets(offsets);
    }, [selected]);

    useEffect(() => {
        calculateOffsets();
    }, [calculateOffsets]);

    useEffect(() => {
        const handleResize = () => calculateOffsets();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateOffsets]);

    const handleCardClick = (i) => {
        // Clear any pending flip timer
        if (flipTimerRef.current) {
            clearTimeout(flipTimerRef.current);
            flipTimerRef.current = null;
        }

        setFlipDone(false);
        setSelected(prev => {
            const next = prev === i ? null : i;
            if (next !== null) {
                // Delay matches flip animation: 0.8s duration + 0.1s delay = 900ms
                flipTimerRef.current = setTimeout(() => setFlipDone(true), 900);
            }
            return next;
        });
    };

    // Fan transform for non-spotlight mode (entrance + idle)
    const getFanTransform = (i) => {
        const isVisible = i < visibleCount;
        const isHoveredCard = hovered === i && !isSpotlight;

        if (!isVisible) return `translateY(44px) rotate(${FAN_ROTATIONS[i]}deg) scale(0.84)`;
        if (isHoveredCard) return `translateY(-6px) rotate(${FAN_ROTATIONS[i] * 0.4}deg) scale(1.03)`;
        return `rotate(${FAN_ROTATIONS[i]}deg)`;
    };

    // Spotlight transform — applied ON TOP of fan position via separate element
    const getSpotlightTransform = (i) => {
        if (!isSpotlight) return '';

        const isSelected = selected === i;
        const offsetX = cardOffsets[i] || 0;

        if (isSelected) {
            return `translateX(${offsetX}px) translateY(-60px) scale(1.15)`;
        }
        return `translateX(${offsetX}px) translateY(30px) scale(0.88)`;
    };

    return (
        <div
            ref={containerRef}
            className={clsx('flex flex-col items-center w-full select-none relative', isSpotlight && 'spotlight-active')}
            style={{ gap: 0 }}
        >
            {/* ── Floating Particles — only visible after flip completes ── */}
            {isSpotlight && flipDone && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
                    {particles.map((p) => (
                        <span
                            key={p.id}
                            className="absolute rounded-full spotlight-particle"
                            style={{
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                left: `${p.left}%`,
                                bottom: `${p.bottom}%`,
                                opacity: 0,
                                background: 'rgba(255, 200, 60, 0.8)',
                                '--particle-drift-y': `${p.driftY}px`,
                                '--particle-drift-x': `${p.driftX}px`,
                                '--particle-opacity': p.opacity,
                                animation: `particleFloat ${p.duration}s ease-in-out 0s infinite`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── Description — Spotlight text reveal ──────────── */}
            <div
                className="w-full flex flex-col justify-end text-center px-4 mb-24 relative z-[60]"
                style={{ height: '150px' }}
            >
                {/* SEO-hidden content */}
                <div className="sr-only" aria-hidden="true">
                    {CARDS.map((card) => (
                        <div key={card.value}>
                            <h2>{`Planning Poker Card ${card.value}: ${card.title}`}</h2>
                            <p>{card.desc}</p>
                        </div>
                    ))}
                </div>

                {selected !== null && (
                    <div key={selected} className="flex flex-col items-center gap-2">
                        {/* Subtitle */}
                        <p
                            className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-gray-400"
                            style={{
                                animation: `spotlightTextReveal 0.8s ${SPOTLIGHT_EASING} 0.5s both`,
                            }}
                        >
                            Card {CARDS[selected].value} — Story Points
                        </p>
                        {/* Title */}
                        <p
                            className="text-xl lg:text-2xl font-heading font-bold leading-tight"
                            style={{
                                animation: `spotlightTitleReveal 0.8s ${SPOTLIGHT_EASING} 0.8s both`,
                                color: '#ffb800',
                            }}
                        >
                            {CARDS[selected].title}
                        </p>
                        {/* Description */}
                        <p
                            className="text-sm text-gray-400 leading-relaxed max-w-xs"
                            style={{
                                animation: `spotlightTextReveal 0.8s ${SPOTLIGHT_EASING} 1s both`,
                            }}
                        >
                            {CARDS[selected].desc}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Card Fan / Spotlight Row ────────────────────── */}
            <div className="flex items-end justify-center gap-3.5 lg:gap-5 relative">
                {CARDS.map((card, i) => {
                    const isVisible = i < visibleCount;
                    const isSelected = selected === i;
                    const isHoveredCard = hovered === i;
                    const isFloating = isVisible && !isSpotlight;

                    return (
                        <div
                            key={card.value}
                            ref={(el) => { cardRefs.current[i] = el; }}
                            className="cursor-pointer"
                            style={{
                                // Fan rotation (entrance + idle)
                                transform: isSpotlight ? `rotate(0deg)` : getFanTransform(i),
                                opacity: isVisible ? 1 : 0,
                                transition: isSpotlight
                                    ? `transform 0.7s ${SPOTLIGHT_EASING}, opacity 0.7s ${SPOTLIGHT_EASING}`
                                    : 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
                                zIndex: isSelected ? 50 : isSpotlight ? 1 : i,
                            }}
                            onClick={() => handleCardClick(i)}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Spotlight repositioning wrapper */}
                            <div
                                style={{
                                    transform: getSpotlightTransform(i),
                                    opacity: isSpotlight && !isSelected ? 0.35 : 1,
                                    filter: isSpotlight && !isSelected ? 'blur(2px) brightness(0.5)' : 'none',
                                    transition: `transform 0.7s ${SPOTLIGHT_EASING}, opacity 0.7s ${SPOTLIGHT_EASING}, filter 0.7s ${SPOTLIGHT_EASING}`,
                                }}
                            >
                                {/* Card body — perspective container */}
                                <div
                                    className="rounded-xl relative"
                                    style={{
                                        width: 'clamp(80px, 8vw, 130px)',
                                        height: 'clamp(112px, 11.2vw, 182px)',
                                        perspective: '1200px',
                                        animation: isFloating
                                            ? `cardFloat 3.8s ease-in-out ${FLOAT_DELAYS[i]}s infinite`
                                            : 'none',
                                        boxShadow: isSelected && flipDone
                                            ? '0 20px 60px -10px rgba(255, 184, 0, 0.35), 0 8px 24px rgba(0,0,0,0.3)'
                                            : isHoveredCard && !isSpotlight
                                                ? '0 14px 20px -4px rgba(255,184,0,0.22)'
                                                : '0 6px 16px rgba(0,0,0,0.3)',
                                        transition: 'box-shadow 0.35s ease',
                                    }}
                                >
                                    {/* 3D flip inner */}
                                    <div
                                        className={clsx('flip-card-inner', isSelected && 'flipped')}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        {/* Back */}
                                        <div className="flip-card-face flip-card-back-face rounded-xl overflow-hidden">
                                            <img
                                                src={cardBack}
                                                alt="Keystimate planning poker card back"
                                                className="w-full h-full"
                                                style={{ objectFit: 'fill', display: 'block' }}
                                            />
                                        </div>
                                        {/* Front */}
                                        <div className="flip-card-face flip-card-front-face rounded-xl overflow-hidden">
                                            <img
                                                src={CARD_FRONTS[card.value]}
                                                alt={`Planning poker card value ${card.value} - ${card.title}`}
                                                className="w-full h-full"
                                                style={{ objectFit: 'fill', display: 'block' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Warm glow beneath selected card — only after flip */}
                                    {isSelected && flipDone && (
                                        <div
                                            className="absolute pointer-events-none"
                                            style={{
                                                width: '140%',
                                                height: '40px',
                                                left: '50%',
                                                bottom: '-24px',
                                                background: 'radial-gradient(ellipse at center, rgba(255,184,0,0.35) 0%, rgba(255,140,0,0.15) 40%, transparent 70%)',
                                                borderRadius: '50%',
                                                animation: `cardGlow 0.5s ${SPOTLIGHT_EASING} 0.3s both`,
                                            }}
                                        />
                                    )}
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
