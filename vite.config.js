import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/chatscreen-app': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/chatscreen-app/, '')
      }
    },
    watch: {
      ignored: (file) => {
        const normalized = file.replace(/\\/g, '/');
        // Allow watching src/, index.html, and vite.config.js
        if (normalized.includes('/src/') || normalized.endsWith('/src')) return false;
        if (normalized.endsWith('/index.html') || normalized.endsWith('/vite.config.js')) return false;
        // Ignore everything else (documentation, other project folders, caches) to prevent EBUSY watch errors on Windows
        return true;
      }
    }
  }
});

