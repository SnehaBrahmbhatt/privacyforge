/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        wm: {
          green: '#22c55e',
          'green-light': '#4ade80',
          'green-dark': '#16a34a',
          'green-glow': 'rgba(34,197,94,0.15)',
          bg: '#0a0f0a',
          'bg-card': '#0f1a0f',
          'bg-glass': 'rgba(15,26,15,0.7)',
          border: '#1a2e1a',
          'border-glow': 'rgba(34,197,94,0.3)',
          text: '#e8f5e8',
          'text-muted': '#6b8c6b',
        },
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        glow: { '0%,100%': { boxShadow: '0 0 8px rgba(34,197,94,0.3)' }, '50%': { boxShadow: '0 0 24px rgba(34,197,94,0.6)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)',
      },
      backgroundSize: { grid: '32px 32px' },
      boxShadow: {
        'wm-sm': '0 0 10px rgba(34,197,94,0.15)',
        'wm-md': '0 0 20px rgba(34,197,94,0.25)',
        card: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.1)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}