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
        /*
         * Two dark tones, each with a job.
         *
         * `950` is warm (R11 > B8) and backs every photographic section — the pictures on this
         * page are golden-hour renders and a neutral or cool black sits under them as a
         * different material. `night` is cool (B20 > R10) and backs the opening: the film's
         * first frame averages #021b27, so the loader and the hero's own ground have to be on
         * that side of neutral or the curtain parts onto a visible seam.
         *
         * There is no pure black anywhere. `#000` belonged to neither tone and was only ever
         * a default nobody chose — a scrim over a photograph may still use black at an alpha,
         * which is a neutral darkener rather than a surface.
         */
        charcoal: {
          600: '#3d352d',
          700: '#2c2621',
          800: '#1f1a15',
          900: '#14110e',
          950: '#0b0908',
          night: '#0a0e14',
        },
        /*
         * The warm accent that is not champagne.
         *
         * Champagne is a pale gold for type on dark ground. Where a warm mark has to hold its
         * own ON ivory — the amenity chip and title — champagne has too little contrast, which
         * is why that card reached for Tailwind's stock `amber-700` instead. That colour is
         * #b45309, a saturated orange outside this palette, and it fails AA on ivory at
         * 3.97:1. The file's own comment called it "#8a5418", so the divergence was a
         * misreading rather than a decision. This is that intended colour, declared: earthen
         * rather than orange, and 4.93:1 on ivory.
         */
        clay: {
          500: '#a9661d',
          600: '#8a5418',
          700: '#6b4012',
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
