/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#eff6ff', // blue-50
                    DEFAULT: '#3b82f6', // blue-500
                    dark: '#1e40af', // blue-800
                },
                slate: {
                    850: '#151f32', // custom dark
                }
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
