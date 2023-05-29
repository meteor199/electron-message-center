import { messageCenter as messageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain } from '../src/main';
import { IpcEvent } from '../src/shared';

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
        messageCenterRenderer.on(route, (event: IpcEvent, args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        setTimeout(() => {
          messageCenterMain.broadcast(route, 'broadcast');
        });
      }));

    it('broadcast from main to main', () =>
      new Promise<void>(resolve => {
        messageCenterMain.on(route, (event: IpcEvent, args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        setTimeout(() => {
          messageCenterMain.broadcast(route, 'broadcast');
        });
      }));

    it('broadcast from renderer to main', () =>
      new Promise<void>(resolve => {
        messageCenterMain.on(route, (event: IpcEvent, args: string) => {
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

        messageCenterMain.on(route, (event: IpcEvent, args: string) => {
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

        messageCenterMain.on(newRoute, (event: IpcEvent, args: string) => {
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
});
