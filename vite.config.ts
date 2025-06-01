import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/degen-intel/',
  build: {
    emptyOutDir: false,
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    proxy: {
      // Proxy API calls to the backend server on port 3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Fallback for direct routes
      '/wallet': 'http://localhost:3001',
      '/trending': 'http://localhost:3001',
      '/tweets': 'http://localhost:3001',
      '/sentiment': 'http://localhost:3001',
      '/statistics': 'http://localhost:3001',
      '/config': 'http://localhost:3001',
      '/portfolio': 'http://localhost:3001',
    },
  },
  envPrefix: 'VITE_',
});
