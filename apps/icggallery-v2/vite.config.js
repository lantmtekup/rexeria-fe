import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Draco/KTX2-compressed GLB assets — don't inline; serve from /public/webgl
  assetsInclude: ['**/*.glb'],
});
