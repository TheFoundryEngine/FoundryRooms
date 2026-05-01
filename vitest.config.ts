import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'modules/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@foundry/contracts': path.resolve(__dirname, './contracts'),
      '@foundry/identity-access': path.resolve(__dirname, './modules/identity-access'),
      '@foundry/community-structure': path.resolve(__dirname, './modules/community-structure'),
    },
  },
});
