import { defineConfig } from 'vitest/config';
export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: '"test"',
  },
  test: {
    globals: true,
    // disable threads on GH actions to speed it up
    threads: !process.env.GITHUB_ACTIONS,
    setupFiles: 'scripts/setupVitest.ts',
    // environmentMatchGlobs: [['packages/{vue,vue-compat,runtime-dom}/**', 'jsdom']],
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
