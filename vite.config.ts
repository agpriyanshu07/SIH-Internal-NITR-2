import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const stub = fileURLToPath(new URL('./src/lib/wasm-stub.ts', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative base so `npm run build` output can be served from any static host
  // or subdirectory without server-side rewrites.
  base: './',
  resolve: {
    alias: [
      // satellite.js's optional WASM SGP4 runtimes. Never called by this app;
      // see src/lib/wasm-stub.ts for why they are stubbed rather than bundled.
      { find: '#wasm-single-thread', replacement: stub },
      { find: '#wasm-multi-thread', replacement: stub },
    ],
  },
  worker: {
    // The screening worker is an ES module so it can import the engine directly
    // rather than being handed a duplicated copy of it.
    format: 'es',
  },
});
