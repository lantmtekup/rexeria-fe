import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          600: '#3d352d',
          700: '#2c2621',
          800: '#1f1a15',
          900: '#14110e',
          950: '#0b0908',
          night: '#0a0e14',
        },
        ivory: '#e8e5dd',
        champagne: {
          50: '#faf6ef',
          100: '#f2e9da',
          200: '#e6d6bc',
          300: '#d8c09a',
          400: '#c9a961',
        },
        navy: { dark: '#000c1a' },
      },
      fontFamily: {
        display: [
          'var(--font-display)',
          'Playfair Display',
          'Georgia',
          'serif',
        ],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { luxe: '0.28em' },
      transitionTimingFunction: { luxe: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      backgroundImage: {
        'panel-scrim':
          'linear-gradient(0deg, rgba(11,9,8,0.88) 0, rgba(11,9,8,0.35) 45%, rgba(11,9,8,0.15))',
      },
      keyframes: {
        twinkle: {
          '0%,100%': { opacity: '.45', transform: 'scale(.92) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(90deg)' },
        },
      },
      animation: { twinkle: 'twinkle 4s ease-in-out infinite' },
    },
  },
  plugins: [],
};
export default config;
