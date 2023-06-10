/**
 * create unique id
 * @returns {number} - unique id
 */
export const createId = (() => {
  let id = 0;
  return () => ++id;
})();

export function remove<T>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): T[] {
  const removedElements: T[] = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i, arr)) {
      removedElements.push(arr.splice(i, 1)[0]);
    }
  }
  return removedElements;
}

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
