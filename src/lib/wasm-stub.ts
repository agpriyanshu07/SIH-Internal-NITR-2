/**
 * Stub for satellite.js's optional WebAssembly SGP4 runtimes.
 *
 * satellite.js ships a WASM build alongside its JavaScript one, reached through
 * `await import('#wasm-single-thread')` inside `createSingleThreadRuntime()`.
 * This app never calls those, so the only thing the real modules contribute is
 * a megabyte of inlined base64 and a top-level await that the bundler then has
 * to find a chunk format for. Aliasing them here keeps the pure-JS path, which
 * screens 840 objects over 24 hours in about ten seconds — fast enough that the
 * WASM path buys nothing a demo would notice.
 *
 * If a future run needs the throughput, delete the alias in vite.config.ts and
 * use satellite.js's BulkPropagator instead.
 */
export default function unavailable(): never {
  throw new Error(
    'satellite.js WASM runtime is deliberately not bundled — see src/lib/wasm-stub.ts',
  );
}
