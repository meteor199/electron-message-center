import { ElectronApplication, _electron as electron } from 'playwright';
import type { MessageCenter } from '../../main';

declare global {
  interface Window {
    messageCenter: MessageCenter;
  }
}

export const sleep = (timeouts: number) => {
  return new Promise((resolve, reject) => setTimeout(resolve, timeouts));
};

export const generateRoute = (function generateRoute() {
  let i = 1;
  return () => `${i++}`;
})();

export function setupElectron() {
  let electronApp: ElectronApplication;

  let route = '';
  beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['packages/example/index.js', '--no-sandbox', '--disable-setuid-sandbox'],
    });
    await electronApp.waitForEvent('window');
    await electronApp.waitForEvent('window');
    await electronApp.waitForEvent('window');
  });
  beforeEach(() => {
    route = generateRoute();
  });
  afterEach(async () => {
    const [main, first, second] = electronApp.windows();
    await Promise.all([main.reload(), first.reload(), second.reload()]);
  });
  afterAll(async () => {
    await electronApp.close();
  });

  return { electronApp: () => electronApp, route: () => route };
}
