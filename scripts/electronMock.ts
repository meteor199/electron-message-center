import createIPCMock from 'electron-mock-ipc';

const mocked = createIPCMock();
const ipcMain = mocked.ipcMain;
const ipcRenderer = mocked.ipcRenderer;
ipcMain.on('mock', event => {
  //
  (event.sender as any).__proto__.once = () => {
    //
  };
});
ipcRenderer.send('mock');
export { ipcMain, ipcRenderer };
