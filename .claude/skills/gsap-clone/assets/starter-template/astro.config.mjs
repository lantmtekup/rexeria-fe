import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  server: { port: 4321 },
  vite: {
    ssr: {
      noExternal: ['gsap', 'lenis', 'split-type', 'swiper'],
    },
  },
});
