import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = id.replaceAll('\\', '/');
          if (
            modulePath.includes('/node_modules/react/') ||
            modulePath.includes('/node_modules/react-dom/') ||
            modulePath.includes('/node_modules/react-router-dom/') ||
            modulePath.includes('/node_modules/@remix-run/router/') ||
            modulePath.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          if (modulePath.includes('/node_modules/@tanstack/')) return 'vendor-data';
          if (modulePath.includes('/node_modules/recharts/')) return 'vendor-charts';
          if (
            modulePath.includes('/node_modules/@tiptap/') ||
            modulePath.includes('/node_modules/prosemirror-')
          ) {
            return 'vendor-editor';
          }
          if (modulePath.includes('/node_modules/@dnd-kit/')) return 'vendor-drag-drop';
          return undefined;
        },
      },
    },
  },
});
