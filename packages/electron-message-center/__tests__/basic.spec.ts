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

  test('should pass when comparing "1" to "1"', async () => {
    expect('1').toBe('1');
  });

  test('should have ipcMain.on and ipcRenderer.on as functions', async () => {
    expect(typeof ipcMain.on).toBe('function');
    expect(typeof ipcRenderer.on).toBe('function');
  });

  test('should successfully send and receive messages between ipcMain and ipcRenderer', async () => {
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
