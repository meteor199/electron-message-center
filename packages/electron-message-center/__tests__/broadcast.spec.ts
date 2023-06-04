import { messageCenter as messageCenterRenderer, MessageCenter as MessageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute, getWebContents, sleep } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain, MessageCenter as MessageCenterMain } from '../src/main';
import { IpcEvent, MAIN_PROCESS_ID } from '../src/shared';
describe('broadcast', () => {
  describe('broadcast in main process', () => {
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

    it('broadcast with specified WebContents should be successful', async () => {
      return new Promise<void>((resolve, reject) => {
        messageCenterRenderer.on(route, () => {
          expect.fail('should not be called');
        });
        messageCenterMain.on(route, (event: IpcEvent, args: string) => {
          resolve();
        });

        const specified = new MessageCenterMain({ webContentsId: MAIN_PROCESS_ID });
        specified.broadcast(route, 1);
      });
    });

    it('broadcast with multiple WebContents should be successful', async () => {
      return new Promise<void>((resolve, reject) => {
        Promise.all([
          new Promise<void>((resolve, reject) => {
            messageCenterMain.on(route, (event: IpcEvent, args: string) => {
              resolve();
            });
          }),
          new Promise<void>((resolve, reject) => {
            messageCenterMain.on(route, (event: IpcEvent, args: string) => {
              resolve();
            });
          }),
        ]).then(() => resolve());

        const specified = new MessageCenterMain({ webContentsId: [MAIN_PROCESS_ID, getWebContents().id] });
        specified.broadcast(route, 1);
      });
    });
  });

  describe('broadcast in renderer', () => {
    let route: string;

    beforeEach(() => {
      route = generateRoute();
    });

    afterEach(() => {
      clearEnv();
    });

    it('should broadcast message as arguments are right', () =>
      new Promise<void>(resolve => {
        messageCenterRenderer.on(route, (event, ...args: unknown[]) => {
          expect(route).toBe(route);
          expect(args[0]).to.equal(1);
          expect(args[1]).to.equal(null);
          expect(args[2]).to.equal('x');
          expect(args[3]).toMatchObject({ a: 1 });
          resolve();
        });
        messageCenterRenderer.broadcast(route, 1, null, 'x', { a: 1 }, new Error('test'));
      }));

    it('should remove one listener', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterRenderer.on(route, first);

        messageCenterRenderer.on(route, (event, args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenterRenderer.off(route, first);
        messageCenterRenderer.broadcast(route, 'broadcast');
      }));

    it('should remove all listeners ', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterRenderer.on(route, first);
        messageCenterRenderer.on(route, first);
        messageCenterMain.on(route, first);
        messageCenterMain.on(route, first);

        const newRoute = generateRoute();

        messageCenterRenderer.on(newRoute, (event, args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenterRenderer.off(route);
        messageCenterRenderer.broadcast(route, 'broadcast');
        messageCenterRenderer.broadcast(newRoute, 'broadcast');
      }));

    it('should get all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterRenderer.on(route, first);
        messageCenterRenderer.on(route, first);

        messageCenterRenderer.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(2);
          resolve();
        });
      }));

    it('should get all listeners when all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenterRenderer.on(route, first);
        messageCenterRenderer.on(route, first);
        messageCenterRenderer.off(route);
        messageCenterRenderer.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(0);
          resolve();
        });
      }));

    it('broadcast with specified WebContents should be successful', async () => {
      return new Promise<void>((resolve, reject) => {
        messageCenterRenderer.on(route, () => {
          expect.fail('should not be called');
        });
        messageCenterMain.on(route, (event: IpcEvent, args: string) => {
          resolve();
        });

        const specified = new MessageCenterRenderer({ webContentsId: MAIN_PROCESS_ID });
        specified.broadcast(route, 1);
      });
    });
  });
});
