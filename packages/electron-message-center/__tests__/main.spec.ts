import { ipcMain, ipcRenderer } from 'electron';
import { messageCenter as messageCenterRenderer } from '../src/renderer';
import { generateRoute } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain } from '../src/main';

describe('main', () => {
  describe('broadcast', () => {
    let route: string;

    beforeEach(() => {
      route = generateRoute();
    });

    afterEach(() => {
      ipcMain.removeAllListeners();
      ipcRenderer.removeAllListeners();
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

    it('broadcast off one listener', () =>
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

    it('broadcast off all listeners', () =>
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
  });
});
