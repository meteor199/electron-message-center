import { setupElectron, sleep } from './e2eUtils';

describe('boardcast', () => {
  const { electronApp } = setupElectron();

  test('在渲染进程发送消息，其他进程应该可以正常监听', async () => {
    const [main, first, second] = electronApp().windows();

    const retPromise = Promise.all([
      main.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', data => {
              resolve(data);
            });
          })
      ),
      first.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', data => {
              resolve(data);
            });
          })
      ),
      second.evaluate(
        () =>
          new Promise(resolve => {
            window.messageCenter.on('message', data => {
              resolve(data);
            });
          })
      ),
      electronApp().evaluate(
        () =>
          new Promise(resolve => {
            global.messageCenter.on('message', data => {
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
