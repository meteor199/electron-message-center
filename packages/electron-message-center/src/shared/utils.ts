let id = 0;

export function createId() {
  return id++;
}

export function remove<T>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): T[] {
  const removedElements: T[] = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i, arr)) {
      removedElements.push(arr.splice(i, 1)[0]);
    }
  }
  return removedElements;
}
