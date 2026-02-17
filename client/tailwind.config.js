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
                banana: {
                    100: '#fffbea',
                    200: '#fff1c2',
                    300: '#ffe699',
                    400: '#ffd24d',
                    500: '#ffb800', // Primary
                    600: '#e69900',
                },
                orange: {
                    500: '#ff5c00', // Secondary
                },
                dark: {
                    900: '#0a0a0a', // Background
                    800: '#151921', // Surface
                },
                gray: {
                    400: '#94a3b8', // Text
                }
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                heading: ["Poppins", "sans-serif"],
            },
            animation: {
                'blob': 'blob 7s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'expand-contract': 'expand-contract 6s ease-in-out infinite',
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
                'expand-contract': {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate(var(--tx), var(--ty)) rotate(var(--tr))' },
                }
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
