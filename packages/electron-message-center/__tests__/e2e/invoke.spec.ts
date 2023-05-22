import { MessageCenter } from '../../main';

import { setupElectron } from './e2eUtils';

declare const messageCenter: MessageCenter;

describe('invoke', () => {
  test('invoking renderer in itself returns successfully', async () => {
    const electronApp = await setupElectron();

    await electronApp.waitForEvent('window');
    await electronApp.waitForEvent('window');
    await electronApp.waitForEvent('window');

    const [main, first, second] = electronApp.windows();

    await main.waitForLoadState();
    await first.waitForLoadState();
    await second.waitForLoadState();

    await first.evaluate(`() => {
      messageCenter.on('message', () => {
        return 1;
      });
    }`);
    const result = await first.evaluate(`() => messageCenter.invoke('message')`);

    expect(result).toEqual(1);
    // close app
    await electronApp.close();
  });
});
