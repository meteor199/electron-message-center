import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        useAtomics: true,
        isolate: !process.env.GITHUB_ACTIONS
      }
    },
    setupFiles: 'scripts/setupVitest.ts',
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [],
    },
  },
});
