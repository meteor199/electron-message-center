import { ipcMain, ipcRenderer } from 'electron';
import { generateRoute } from './utils';

describe('basic', () => {
  beforeEach(() => {
    //
  });

  afterEach(() => {
    ipcMain.removeAllListeners();
    ipcRenderer.removeAllListeners('');
  });

  test('test env', async () => {
    expect('1').toBe('1');
  });
  test('mock ipc function exist', async () => {
    expect(typeof ipcMain.on).toBe('function');
    expect(typeof ipcRenderer.on).toBe('function');
  });
  test('mock ipc should success', async () => {
    const toMainRoute = generateRoute();
    const toRenderer = generateRoute();
    ipcMain.on(toMainRoute, (event, num) => {
      expect(num).toBe(1);
      event.sender.send(toRenderer, 2);
    });
    ipcRenderer.on(toRenderer, (event, num) => {
      expect(num).toBe(2);
    });
    ipcRenderer.send(toMainRoute, 1);
  });
});
