import { UserConfig, configDefaults } from 'vitest/config';
import config from './vitest.config';

export default {
  ...config,
  resolve: {
    alias: {
      electron: './scripts/electronMock.ts',
    },
  },
  test: {
    ...config.test,
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
} as UserConfig;
