import { UserConfig } from 'vitest/config';
import config from './vitest.config';

export default {
  ...config,
  test: {
    hookTimeout: 100000,
    ...config.test,
    maxConcurrency: 1,
    include: ['packages/electron-message-center/__tests__/e2e/*.spec.ts'],
  },
} as UserConfig;
