import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';
import { resolve } from 'path';

export default defineConfig((configEnv) =>
  mergeConfig(baseConfig, {
    test: {
      alias: {
        electron: resolve('./scripts/electronMock.ts'),
      },
      exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
      coverage: {
        include: ['./src/**']
      }
    },
  })
);
