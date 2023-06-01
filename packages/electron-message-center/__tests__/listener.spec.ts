import { messageCenter as messageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute, getWebContents, sleep } from './utils';
import '../src/main';
import { listenerList, webContentsMap } from '../src/main/mainProcess';
import { messageCenter as messageCenterMain } from '../src/main';
import { MAIN_PROCESS_ID } from '../src/shared';

describe('listener test', () => {
  let route: string;

  beforeEach(() => {
    route = generateRoute();
  });

  afterEach(() => {
    clearEnv();
  });

  describe('webContents reset', () => {
    it('When the renderer is reloaded, all listeners should be cleared', async () => {
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

    it('When the renderer is destroyed, all listeners should be cleared', async () => {
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

    it('When the renderer listens, there should be a value in the map', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      messageCenterRenderer.on(route, first);

      await sleep(1);

      expect(typeof webContentsMap.get(getWebContents())?.removeListener).toBe('function');
      expect(webContentsMap.get(getWebContents())?.data.size).toBe(2);
    });

    it('When the renderer is reloaded, the map should be cleared', async () => {
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

    it('When the renderer is destroyed, the map should be cleared', async () => {
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
  });

  describe('listeners count test', () => {
    it('When listening, webContents should have listeners', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      messageCenterRenderer.on(route, first);
      await sleep(1);
      expect(getWebContents().listenerCount('did-start-navigation')).toBe(1);
      expect(getWebContents().listenerCount('destroyed')).toBe(1);
    });

    it('When canceling the listener, the destroyed and reload events should be unregistered', async () => {
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

  describe('getAllListeners', () => {
    it('When listening in the main process, webContentId should be the main process', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const listeners = await messageCenterRenderer.getAllListeners();
      expect(listeners.length).toBe(1);
      expect(listeners[0].webContentId).toBe(MAIN_PROCESS_ID);
    });

    it('When listening in the renderer process, webContentId should be the renderer process webContentId', async () => {
      function first() {
        expect.fail('not off successfully');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const listeners = await messageCenterRenderer.getAllListeners();
      expect(listeners.length).toBe(1);
      expect(listeners[0].webContentId).toBe(getWebContents().id);
    });
  });
});
