export const generateInvokeId = (() => {
  let invokeId = 0;
  return () => ++invokeId;
})();
