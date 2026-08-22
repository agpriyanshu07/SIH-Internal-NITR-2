import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const stub = fileURLToPath(new URL('./src/lib/wasm-stub.ts', import.meta.url));

/**
 * `npm run build`        -> dist/, normal multi-file static build
 * `npm run build:single` -> dist-single/index.html, ONE file, no server needed
 *
 * The single-file build exists because a demo should survive anything: no
 * static host, no dev server, no network, no wifi. Everything is inlined —
 * the JavaScript, the stylesheet, the Latin font subsets, the committed
 * orbital snapshot and the screening worker — so the console opens by
 * double-clicking the file. It is the same application either way; only the
 * packaging differs.
 */
const single = process.env.KESSLER_SINGLE === '1';

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: single
    ? {
        outDir: 'dist-single',
        // Inline every asset, fonts included, rather than emitting them
        // alongside a file that is supposed to stand on its own.
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 8000,
      }
    : {},
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
  optimizeDeps: {
    // Vite's dev-mode dependency pre-bundling crawls satellite.js's package
    // `imports` map, which reaches the WASM entry (and its top-level await)
    // before the aliases above can redirect it. Excluding it makes the dev
    // server serve satellite.js as plain source ESM, where the aliases apply.
    exclude: ['satellite.js'],
  },
  worker: {
    // The screening worker is an ES module so it can import the engine directly
    // rather than being handed a duplicated copy of it.
    format: 'es',
  },
});
