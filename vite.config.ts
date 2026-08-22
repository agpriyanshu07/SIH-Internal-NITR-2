import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so `npm run build` output can be opened straight from the
  // filesystem (file://) without a dev server.
  base: './',
});
