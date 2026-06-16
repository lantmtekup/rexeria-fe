import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Inline empty PostCSS config so Vite doesn't walk up to the monorepo
  // root's postcss.config.mjs (which pulls in Tailwind plugins not used here).
  css: { postcss: {} },
});
