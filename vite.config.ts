import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the build can be uploaded to any web portal or wrapped by Capacitor.
  base: './',
  build: {
    target: 'es2022',
    // Rapier inlines its WASM; Phaser is large. Both are expected in the main chunk.
    chunkSizeWarningLimit: 3000,
  },
  test: {
    environment: 'node',
  },
});
