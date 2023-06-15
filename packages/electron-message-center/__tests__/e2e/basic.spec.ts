import type { MessageCenter } from '../../main';
import { setupElectron, sleep } from './e2eUtils';
declare let global: { messageCenter: MessageCenter };

describe('basic test', () => {
  const { electronApp } = setupElectron();
  test('get isPackaged', async () => {
    const isPackaged = await electronApp().evaluate(async ({ app }) => {
      // This runs in Electron's main process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.isPackaged;
    });

    expect(isPackaged).toBe(false);
  });

  test('get listeners', async () => {
    const [main, first, second] = electronApp().windows();

    const listeners = await electronApp().evaluate(() => {
      return global.messageCenter.getAllListeners();
    });
    expect(listeners.length).toBe(3);
  });

  test('get listeners when reload', async () => {
    const [main, first, second] = electronApp().windows();

    await first.evaluate(() => {
      return window.messageCenter.on('message', () => {
        //
      });
    });

    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(4);
    }

    await first.reload();

    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(3);
    }
  });

  test('get listeners when navigate to blank', async () => {
    const [main, first, second] = electronApp().windows();

    await first.evaluate(() => {
      return window.messageCenter.on('message', () => {
        //
      });
    });

    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(4);
    }

    const url = first.url();

    await first.goto('about:blank');
    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(2);
    }

    await first.goto(url);
  });

  test('get listeners when destroy', async () => {
    const [main, first, second] = electronApp().windows();

    await first.evaluate(() => {
      return window.messageCenter.on('message', () => {
        //
      });
    });

    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(4);
    }

    // await first.close();
    {
      await sleep(1);
      const listeners = await electronApp().evaluate(() => {
        return global.messageCenter.getAllListeners();
      });
      expect(listeners.length).toBe(4);
    }
  });
});
