import { ViteUserConfig } from 'vitest/config';
import { mergeConfig } from 'vitest/config';
import config from './vitest.config';

export default mergeConfig(config, {
  test: {
    hookTimeout: 100000,
    maxConcurrency: 1,
    include: ['__tests__/e2e/*.spec.ts'],
  },
} as ViteUserConfig);
