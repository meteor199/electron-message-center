/// <reference types="vitest/globals" />

// Global compile-time constants
declare let __DEV__: boolean;
declare let __TEST__: boolean;

// for tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R;
    toHaveBeenWarnedLast(): R;
    toHaveBeenWarnedTimes(n: number): R;
  }
}
