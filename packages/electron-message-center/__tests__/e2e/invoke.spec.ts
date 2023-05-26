import { MessageCenter } from '../../main';
import { setupElectron, sleep } from './e2eUtils';

declare let global: { messageCenter: MessageCenter };

describe('invoke', () => {
  const { electronApp } = setupElectron();

  test('invoking renderer in itself should returns successfully', async () => {
    const [main] = electronApp().windows();

    await main.evaluate(() => {
      window.messageCenter.on('message', () => {
        return 1;
      });
    });
    await sleep(1);
    const result = await main.evaluate(() => {
      return window.messageCenter.invoke('message');
    });
    expect(result).toEqual(1);
  });

  test('invoking renderer in another renderer process should returns successfully', async () => {
    const [, first, second] = electronApp().windows();

    await first.evaluate(() => {
      window.messageCenter.on('message', () => {
        return 2;
      });
    });
    await sleep(1);
    const result = await second.evaluate(() => {
      return window.messageCenter.invoke('message');
    });
    expect(result).toEqual(2);
  });

  test('invoking main process in renderer process should returns successfully', async () => {
    const [, , second] = electronApp().windows();

    await electronApp().evaluate(() => {
      global.messageCenter.on('message', () => {
        return 3;
      });
    });
    await sleep(1);
    const result = await second.evaluate(() => {
      return window.messageCenter.invoke('message');
    });
    expect(result).toEqual(3);
  });

  test('invoking renderer process in main process should returns successfully', async () => {
    const [, first] = electronApp().windows();

    await first.evaluate(() => {
      window.messageCenter.on('message4', () => {
        return 4;
      });
    });
    await sleep(1);
    const result = await electronApp().evaluate(() => {
      return global.messageCenter.invoke('message4');
    });
    expect(result).toEqual(4);
  });
});
