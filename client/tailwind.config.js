/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Primary accent — Carbon Silver palette
                silver: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8', // ← PRIMARY ACCENT
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                // Deep backgrounds
                carbon: {
                    950: '#07090D', // page bg (dark)
                    900: '#0F1117', // surface (dark)
                    800: '#171B24', // elevated surface (dark)
                },
                // Keep dark tokens — updated to carbon tones
                dark: {
                    900: '#07090D', // was #0a0a0a — now cosmic carbon
                    800: '#0F1117', // was #151921 — now carbon surface
                },
                // Rich editorial gold accent
                champagne: {
                    300: '#D4AF6E',
                    400: '#C09A3C',
                    500: '#9A7520',
                    600: '#6B4E0A',
                },
                // Semantic status colors (unchanged)
                gray: {
                    400: '#94a3b8',
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                heading: ["Inter", "sans-serif"],
            },
            animation: {
                'blob': 'blob 7s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'expand-contract': 'expand-contract 6s ease-in-out infinite',
                'float-up': 'float-up var(--tw-float-duration, 3s) ease-in forwards',
                'spin-slow': 'spin 3s linear infinite',
                "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
                "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
            },
            keyframes: {
                flip: {
                    '0%': { transform: 'rotateY(0deg)' },
                    '100%': { transform: 'rotateY(180deg)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-up': {
                    '0%': { transform: 'translateY(100vh) scale(0.5)', opacity: 0 },
                    '10%': { opacity: 1, transform: 'translateY(80vh) scale(1.2)' },
                    '90%': { opacity: 1 },
                    '100%': { transform: 'translateY(-20vh) scale(1)', opacity: 0 },
                },
                'expand-contract': {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate(var(--tx), var(--ty)) rotate(var(--tr))' },
                },
                "spin-around": {
                    "0%": { transform: "translateZ(0) rotate(0)" },
                    "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
                    "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
                    "100%": { transform: "translateZ(0) rotate(360deg)" },
                },
                "shimmer-slide": {
                    to: { transform: "translate(calc(100cqw - 100%), 0)" },
                },
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
