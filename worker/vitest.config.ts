import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', '*.test.ts'],
  },
  resolve: {
    alias: {
      '@foundry/contracts': path.resolve(__dirname, '../contracts'),
    },
  },
});
