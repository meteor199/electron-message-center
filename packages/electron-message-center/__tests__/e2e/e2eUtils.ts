import { _electron as electron } from 'playwright';

export async function setupElectron() {
  const electronApp = await electron.launch({ args: ['packages/example/index.js'] });

  return electronApp;
}
