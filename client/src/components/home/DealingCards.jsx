import React from 'react';
import card1 from '../../assets/card1.svg';
import card2 from '../../assets/card2.svg';
import card3 from '../../assets/card3.svg';
import card4 from '../../assets/card4.svg';
import card5 from '../../assets/card5.svg';
import card6 from '../../assets/card6.svg';

const DealingCards = () => {
    // 6 Cards, mapped to the 6 simulated players around the HeroPokerTable
    // --tx: translateX value, --ty: translateY value, --tr: rotate value
    // The animation expand-contract will move the card from center (0,0) to these coords and back.
    const cards = [
        // Top Left (Alex)
        { id: 1, img: card1, tx: '-140px', ty: '-90px', tr: '-15deg', delay: '0.0s', z: 10 },
        // Top Right (Sam)
        { id: 2, img: card2, tx: '140px', ty: '-90px', tr: '15deg', delay: '0.2s', z: 11 },
        // Left (Jamie)
        { id: 3, img: card3, tx: '-280px', ty: '10px', tr: '-30deg', delay: '0.4s', z: 12 },
        // Right (Taylor)
        { id: 4, img: card4, tx: '280px', ty: '10px', tr: '30deg', delay: '0.6s', z: 13 },
        // Bottom Left (Chris)
        { id: 5, img: card5, tx: '-140px', ty: '120px', tr: '-15deg', delay: '0.8s', z: 14 },
        // Bottom Right (Riley)
        { id: 6, img: card6, tx: '140px', ty: '120px', tr: '15deg', delay: '1.0s', z: 15 },
    ];

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center pointer-events-none">
            {/* Cards Container */}
            <div className="relative w-24 h-36">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="absolute inset-0 animate-expand-contract"
                        style={{
                            '--tx': card.tx,
                            '--ty': card.ty,
                            '--tr': card.tr,
                            zIndex: card.z,
                            animationDelay: card.delay,
                        }}
                    >
                        <img
                            src={card.img}
                            alt={`Card ${card.id}`}
                            className="w-full h-full object-contain drop-shadow-2xl"
                            style={{
                                filter: "drop-shadow(0 10px 15px rgb(0 0 0 / 0.5))"
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Central deck representing the source */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-36 bg-gray-200 dark:bg-slate-800 rounded-xl border-2 border-white/20 dark:border-white/10 shadow-xl opacity-20 -z-10"></div>

            {/* Optional: Central glow behind the stack */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-banana-500/20 rounded-full blur-3xl -z-20 animate-pulse-slow"></div>
        </div>
    );
};

export default DealingCards;
