/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00b4ff',
          cyan: '#00f5ff',
          purple: '#a855f7',
          pink: '#f0abfc',
        },
        dark: {
          950: '#02020a',
          900: '#05050f',
          800: '#0a0a1a',
          700: '#0f0f24',
          600: '#14142e',
          500: '#1a1a3a',
          400: '#252548',
          300: '#2e2e58',
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,180,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(168,85,247,0.1) 0%, transparent 50%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,180,255,0.3), 0 0 60px rgba(0,180,255,0.1)',
        'neon-purple': '0 0 20px rgba(168,85,247,0.3), 0 0 60px rgba(168,85,247,0.1)',
        'neon-cyan': '0 0 20px rgba(0,245,255,0.3), 0 0 60px rgba(0,245,255,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        'card-hover': '0 8px 32px rgba(0,180,255,0.15), 0 4px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
