import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
    alias: {
      electron: './scripts/electronMock.ts',
    },
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
      exclude: [
        // ...configDefaults.coverage.exclude!,
        // DOM transitions are tested via e2e so no coverage is collected
        'packages/runtime-dom/src/components/Transition*',
        // mostly entries
        'packages/vue-compat/**',
      ],
    },
  },
});
