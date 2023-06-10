import { WebContents, ipcMain, ipcRenderer } from 'electron';
import { invokeCallbackMap, listenerList, webContentsMap } from '../src/main/mainProcess';

export const generateRoute = (function generateRoute() {
  let i = 1;
  return () => `${i++}`; // eslint-disable-line no-plusplus
})();

export const getWebContents = () => {
  return (globalThis as any).webConents as WebContents;
};

export const sleep = (timeouts: number) => {
  return new Promise(resolve => setTimeout(resolve, timeouts));
};

export function clearEnv() {
  ipcMain.removeAllListeners();
  ipcRenderer.removeAllListeners();
  listenerList.splice(0, listenerList.length);
  webContentsMap.delete(getWebContents());
  getWebContents().removeAllListeners();
  invokeCallbackMap.clear();
}
