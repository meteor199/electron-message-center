import { MessageCenter } from '../../main';
import { setupElectron, sleep } from './e2eUtils';

declare let global: { messageCenter: MessageCenter };

describe('boardcast', () => {
  const { electronApp } = setupElectron();

  test('When sending a message in the rendering process, other processes should be able to listen normally', async () => {
    const [main, first, second] = electronApp().windows();

    const retPromise = Promise.all([
      main.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', (event, data) => {
              resolve(data);
            });
          })
      ),
      first.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', (event, data) => {
              resolve(data);
            });
          })
      ),
      second.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', (event, data) => {
              resolve(data);
            });
          })
      ),
      electronApp().evaluate(
        () =>
          new Promise(resolve => {
            global.messageCenter.on('message', (event, data) => {
              resolve(data);
            });
          })
      ),
    ]);
    await sleep(100);
    await main.evaluate(() => {
      return window.messageCenter.broadcast('message', 1);
    });
    const ret = await retPromise;
    expect(ret).toEqual([1, 1, 1, 1]);
  });
});
