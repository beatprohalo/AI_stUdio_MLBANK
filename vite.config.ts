import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: './', // Important for Electron
  define: {
    // Fix for Electron security warnings and env.mjs errors
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env': JSON.stringify(process.env),
    'process': JSON.stringify({
      env: process.env,
      platform: process.platform,
      version: process.version
    }),
  },
  optimizeDeps: {
    // Optimize dependencies to prevent module resolution issues
    include: ['react', 'react-dom'],
    exclude: ['@google/genai'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true, // Don't try other ports
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
