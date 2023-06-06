export const generateInvokeId = (() => {
  let invokeId = 0;
  return () => ++invokeId;
})();

/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap.
 * @param timeout The timeout in milliseconds. If 0, no timeout will be applied.
 * @returns A promise that will resolve with the value of the given promise, or reject with an error if the timeout is exceeded.
 */
export function withTimeout(promise: Promise<unknown>, timeout: number) {
  if (timeout) {
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('timeout'));
      }, timeout);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }
  return promise;
}
