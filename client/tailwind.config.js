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
                primary: {
                    DEFAULT: '#2b7cee', // Figma Primary Blue
                    light: '#5ba4fc',
                    dark: '#1a5bb8',
                },
                slate: {
                    850: '#151f32',
                    900: '#0f172a', // Figma Dark Text
                },
                background: {
                    light: '#f8fafc', // Figma Input BG
                    dark: '#101022',
                }
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Poppins", "sans-serif"], // Figma Headers
            },
            animation: {
                'flip-card': 'flip 0.6s preserve-3d',
                'blob': 'blob 7s infinite',
                'float-slow': 'float 6s ease-in-out infinite',
                'expand-contract': 'expand-contract 4s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
