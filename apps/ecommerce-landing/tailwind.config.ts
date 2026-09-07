import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        montserrat: [
          'var(--font-montserrat)',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'var(--font-libertinus)',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};
export default config;
