import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setupTests.tsx',
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
