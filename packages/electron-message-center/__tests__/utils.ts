export const generateRoute = (function generateRoute() {
  let i = 1;
  return () => `${i++}`; // eslint-disable-line no-plusplus
})();
