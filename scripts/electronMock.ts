import createIPCMock from 'electron-mock-ipc';
import type { WebContents } from 'electron';
import EventEmitter from 'events';

const mocked = createIPCMock();
const ipcMain = mocked.ipcMain;
const ipcRenderer = mocked.ipcRenderer;
const eventEmitter = new EventEmitter();

mockWebContents();

// Mock the entire electron module
const electron = {
  ipcMain,
  ipcRenderer,
  // Add other electron APIs as needed
  app: {
    getPath: () => '',
    getName: () => 'electron-message-center',
    getVersion: () => '1.0.0',
  },
};

// Export both named exports and default export
export { ipcMain, ipcRenderer };
export default electron;

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
