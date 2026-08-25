/**
 * Vite build and dev server configuration for the frontend app.
 */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Builds the Vite configuration for development and production builds.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
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
      // Keep browser requests on relative /api paths during local dev by proxying to the backend.
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/health': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
