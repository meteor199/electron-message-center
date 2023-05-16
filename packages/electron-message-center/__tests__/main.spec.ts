import { messageCenter as messageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute, getWebContents, sleep } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain } from '../src/main';
import { listenerList, webContentsMap } from '../src/main/mainProcess';

describe('message center in main process', () => {
  describe('broadcast', () => {
    let route: string;

    beforeEach(() => {
      route = generateRoute();
    });

    afterEach(() => {
      clearEnv();
    });

    it('broadcast from main to render', () =>
      new Promise<void>(resolve => {
        messageCenterRenderer.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        setTimeout(() => {
          messageCenterMain.broadcast(route, 'broadcast');
        });
      }));

    it('broadcast from main to main', () =>
      new Promise<void>(resolve => {
        messageCenterMain.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        setTimeout(() => {
          messageCenterMain.broadcast(route, 'broadcast');
        });
      }));

    it('broadcast from renderer to main', () =>
      new Promise<void>(resolve => {
        messageCenterMain.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        setTimeout(() => {
          messageCenterRenderer.broadcast(route, 'broadcast');
        });
      }));

    it('removes one listener', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterMain.on(route, first);

        messageCenterMain.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenterMain.off(route, first);
        messageCenterMain.broadcast(route, 'broadcast');
      }));

    it('removes all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterMain.on(route, first);
        messageCenterMain.on(route, first);

        const newRoute = generateRoute();

        messageCenterMain.on(newRoute, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenterMain.off(route);
        messageCenterMain.broadcast(route, 'broadcast');
        messageCenterMain.broadcast(newRoute, 'broadcast');
      }));

    it('get all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterMain.on(route, first);
        messageCenterMain.on(route, first);

        messageCenterMain.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(2);
          resolve();
        });
      }));

    it('get all listeners when removed all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterMain.on(route, first);
        messageCenterMain.on(route, first);
        messageCenterMain.off(route);
        messageCenterMain.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(0);
          resolve();
        });
      }));
  });

  describe('监听事件处理', () => {
    let route: string;

    beforeEach(() => {
      route = generateRoute();
    });

    afterEach(() => {
      clearEnv();
    });

    it('当renderer重新加载时，应清空所有监听', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);

      await sleep(1);
      expect(listenerList.length).toBe(1);
      getWebContents().reload();
      await sleep(1);
      expect(listenerList.length).toBe(0);
    });

    it('当renderer销毁时，应清空所有监听', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);

      await sleep(1);
      expect(listenerList.length).toBe(1);
      getWebContents().close();
      await sleep(1);
      expect(listenerList.length).toBe(0);
    });

    it('当renderer监听后，map中应有值', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      messageCenterRenderer.on(route, first);

      await sleep(1);

      expect(typeof webContentsMap.get(getWebContents())?.removeListener).toBe('function');
      expect(webContentsMap.get(getWebContents())?.data.size).toBe(2);
    });

    it('当renderer重新加载时，应清空map', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      expect(webContentsMap.get(getWebContents())?.data.size).toBe(1);
      getWebContents().reload();
      await sleep(1);
      expect(webContentsMap.get(getWebContents())).toBe(undefined);
    });

    it('当renderer销毁时，应清空map', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      expect(webContentsMap.get(getWebContents())?.data.size).toBe(1);
      getWebContents().close();

      await sleep(1);
      expect(webContentsMap.get(getWebContents())).toBe(undefined);
    });

    it('当监听后，webContents应该有监听', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      messageCenterRenderer.on(route, first);
      await sleep(1);
      expect(getWebContents().listenerCount('did-start-navigation')).toBe(1);
      expect(getWebContents().listenerCount('destroyed')).toBe(1);
    });

    it('当取消监听时，应注销destroy和重载事件', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      messageCenterRenderer.on(route, first);
      await sleep(1);
      expect(getWebContents().listenerCount('did-start-navigation')).toBe(1);
      expect(getWebContents().listenerCount('destroyed')).toBe(1);
      messageCenterRenderer.off(route, first);
      await sleep(1);
      expect(getWebContents().listenerCount('did-start-navigation')).toBe(0);
      expect(getWebContents().listenerCount('destroyed')).toBe(0);
    });
  });
});
