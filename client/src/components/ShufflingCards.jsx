import React from 'react';
import card1 from '../assets/card1.svg';
import card2 from '../assets/card2.svg';
import card3 from '../assets/card3.svg';
import card4 from '../assets/card4.svg';
import card5 from '../assets/card5.svg';
import card6 from '../assets/card6.svg';
import card7 from '../assets/card7.svg';
import card8 from '../assets/card8.svg';

const ShufflingCards = () => {
    // 8 Cards with random positions for the "expanded" state
    // --tx: translateX value, --ty: translateY value, --tr: rotate value
    const cards = [
        { id: 1, img: card1, tx: '-80px', ty: '-60px', tr: '-15deg', delay: '0s', z: 10 },
        { id: 2, img: card2, tx: '80px', ty: '-60px', tr: '15deg', delay: '0.1s', z: 11 },
        { id: 3, img: card3, tx: '-90px', ty: '40px', tr: '-10deg', delay: '0.2s', z: 12 },
        { id: 4, img: card4, tx: '90px', ty: '40px', tr: '10deg', delay: '0.3s', z: 13 },
        { id: 5, img: card5, tx: '0px', ty: '-100px', tr: '5deg', delay: '0.15s', z: 14 },
        { id: 6, img: card6, tx: '0px', ty: '100px', tr: '-5deg', delay: '0.25s', z: 15 },
        { id: 7, img: card7, tx: '-50px', ty: '0px', tr: '-20deg', delay: '0.05s', z: 16 },
        { id: 8, img: card8, tx: '50px', ty: '0px', tr: '20deg', delay: '0.35s', z: 17 },
    ];

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center pointer-events-none">
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

            {/* Optional: Central glow behind the stack */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-banana-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        </div>
    );
};

export default ShufflingCards;
