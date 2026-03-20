import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark background palette (replaces navy)
        navy: {
          950: '#000000',
          900: '#0A0A0A',
          800: '#111111',
          700: '#1A1A1A',
          600: '#242424',
          500: '#333333',
        },
        // Accent palette (replaces electric/cyan)
        electric: {
          300: '#A7E6C7',
          400: '#7ED9B6',
          500: '#3FAF7A',
          600: '#2FA97F',
        },
        // Additional brand colors
        'off-white': '#F5F7F6',
        'ceibo-red': '#E63946',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dot-pattern':
          'radial-gradient(circle, rgba(126,217,182,0.10) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-30': '30px 30px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(126, 217, 182, 0.12)',
        'glow-md': '0 0 50px rgba(126, 217, 182, 0.18)',
        electric: '0 4px 24px rgba(126, 217, 182, 0.22)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
