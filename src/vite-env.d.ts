/// <reference types="vite/client" />

/**
 * Vite's `?raw` suffix imports a file as a string. The orbital snapshot is
 * loaded this way so the TLE files are bundled into the build — the app makes
 * no network request at any point, which is what lets the demo run offline.
 */
declare module '*.txt?raw' {
  const content: string;
  export default content;
}
