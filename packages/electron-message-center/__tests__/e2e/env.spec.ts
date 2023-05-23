import { setupElectron } from './e2eUtils';

describe('setup e2e environment', () => {
  const { electronApp } = setupElectron();
  test('get isPackaged', async () => {
    const isPackaged = await electronApp().evaluate(async ({ app }) => {
      // This runs in Electron's main process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.isPackaged;
    });

    expect(isPackaged).toBe(false);
  });
});
