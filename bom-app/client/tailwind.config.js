/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Outfit', 'system-ui', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: {
                    50: '#f0f0ff',
                    100: '#e7e7ff',
                    200: '#d2d2ff',
                    300: '#b5b5ff',
                    400: '#9595ff',
                    500: '#6366f1',
                    600: '#5350e9',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#0a0a0f',
                }
            },
            animation: {
                'gradient': 'gradient 15s ease infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
            },
            backdropBlur: {
                'xs': '2px',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-lg': '0 0 40px rgba(99, 102, 241, 0.6)',
            }
        },
    },
    plugins: [],
} 