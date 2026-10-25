import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The app is served through the custom Express server in middleware mode.
      // Vite's browser HMR client cannot establish a socket through the preview proxy,
      // so disable HMR to prevent repeated "WebSocket closed without opened" errors.
      hmr: false,
      watch: null,
    },
  };
});
