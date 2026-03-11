/**
 * Vite build and dev server configuration for the frontend app.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Builds the Vite configuration for development and production builds.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Keep imports stable and readable across the feature-oriented frontend tree.
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Expose the dev server on all interfaces so Docker/LAN testing works without extra flags.
    port: 3000,
    host: true,
  },
});
