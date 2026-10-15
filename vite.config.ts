import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { authoringPlugin } = require('./scripts/authoring/authoringApiMiddleware.cjs');

export default defineConfig({
  plugins: [react(), authoringPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@monaco-editor')) {
            return 'monaco-vendor';
          }
          if (id.includes('@dnd-kit')) {
            return 'dnd-vendor';
          }
          if (id.includes('@tabler/icons-react')) {
            return 'icons-vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3030,
    strictPort: true,
    host: true
  }
});
