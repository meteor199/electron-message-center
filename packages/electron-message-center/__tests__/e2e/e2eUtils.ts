import { ElectronApplication, _electron as electron } from 'playwright';
import { MessageCenter } from '../../main';

declare global {
  interface Window {
    messageCenter: MessageCenter;
  }
}

declare global {
  const messageCenter: MessageCenter;
}

export const sleep = (timeouts: number) => {
  return new Promise((resolve, reject) => setTimeout(resolve, timeouts));
};

export const generateRoute = (function generateRoute() {
  let i = 1;
  return () => `${i++}`; // eslint-disable-line no-plusplus
})();

export function setupElectron() {
  let electronApp: ElectronApplication;

  let route = '';
  beforeAll(async () => {
    electronApp = await electron.launch({ args: ['packages/example/index.js'] });
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
