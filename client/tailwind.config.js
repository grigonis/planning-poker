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
            },
            keyframes: {
                flip: {
                    '0%': { transform: 'rotateY(0deg)' },
                    '100%': { transform: 'rotateY(180deg)' },
                }
            }
        },
    },
    plugins: [],
}
