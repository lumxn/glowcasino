import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/glowcasino.github.io/', // must match the repo name exactly
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
