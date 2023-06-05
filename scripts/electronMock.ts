import createIPCMock from 'electron-mock-ipc';
import type { WebContents } from 'electron';
const mocked = createIPCMock();
const ipcMain = mocked.ipcMain;

import EventEmitter from 'events';
const eventEmitter = new EventEmitter();

const ipcRenderer = mocked.ipcRenderer;

mockWebContents();
export { ipcMain, ipcRenderer };

function mockWebContents() {
  ipcMain.on('mock', event => {
    //
    const webContents = (event.sender as any).__proto__ as any as WebContents;
    webContents.once = function (name: string, callback: any) {
      eventEmitter.once(name, callback);
      return this;
    };

    webContents.reload = function () {
      eventEmitter.emit('did-start-navigation');
    };
    webContents.close = function () {
      eventEmitter.emit('destroyed');
    };
    webContents.removeListener = function (name: string, callback: any) {
      eventEmitter.removeListener(name, callback);
      return this;
    };
    webContents.listenerCount = function (...args) {
      return eventEmitter.listenerCount(...args);
    };
    webContents.removeAllListeners = function () {
      eventEmitter.removeAllListeners();
      return this;
    };

    globalThis.webConents = event.sender;
    globalThis.webConents.id = 1;
  });
  ipcRenderer.send('mock');
}
