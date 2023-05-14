import { ipcMain, ipcRenderer } from 'electron';
import { MessageChannelEnum } from '../src/shared';
import { messageCenter } from '../src/renderer';
import { generateRoute } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain } from '../src/main';

describe('renderer', () => {
  describe('send', () => {
    let route: string;

    beforeEach(() => {
      route = generateRoute();
    });

    afterEach(() => {
      ipcMain.removeAllListeners();
      ipcRenderer.removeAllListeners();
    });

    it('send to main', () =>
      new Promise<void>(resolve => {
        ipcMain.once(
          MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST,
          (event, info: { route: string }, ...args: unknown[]) => {
            expect(info.route).toBe(route);
            expect(args[0]).to.equal(1);
            expect(args[1]).to.equal(null);
            expect(args[2]).to.equal('x');
            expect(args[3]).toMatchObject({ a: 1 });
            resolve();
          }
        );
        messageCenter.broadcast(route, 1, null, 'x', { a: 1 }, new Error('test'));
      }));

    it('broadcast', () =>
      new Promise<void>(resolve => {
        messageCenter.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenter.broadcast(route, 'broadcast');
      }));

    it('broadcast off one listener', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenter.on(route, first);

        messageCenter.on(route, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenter.off(route, first);
        messageCenter.broadcast(route, 'broadcast');
      }));

    it('broadcast off all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenter.on(route, first);
        messageCenter.on(route, first);
        messageCenterMain.on(route, first);
        messageCenterMain.on(route, first);

        const newRoute = generateRoute();

        messageCenter.on(newRoute, (args: string) => {
          expect(args).to.equal('broadcast');
          resolve();
        });
        messageCenter.off(route);
        messageCenter.broadcast(route, 'broadcast');
        messageCenter.broadcast(newRoute, 'broadcast');
      }));

    it('get all listeners', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenter.on(route, first);
        messageCenter.on(route, first);

        messageCenter.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(2);
          resolve();
        });
      }));

    it('get all listeners when off', () =>
      new Promise<void>(resolve => {
        function first() {
          expect.fail('not off successfully');
        }
        messageCenter.on(route, first);
        messageCenter.on(route, first);
        messageCenter.off(route);
        messageCenter.getAllListeners(route).then(listeners => {
          expect(listeners.length).toBe(0);
          resolve();
        });
      }));
  });
});
