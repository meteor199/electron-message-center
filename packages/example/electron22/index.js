// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

require('electron-message-center/main');

const { messageCenter } = require('electron-message-center/main');
// for testing purposes
global.messageCenter = messageCenter;

require('electron-message-center/main');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'main.html'));

  const window1 = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });
  window1.loadFile(path.join(__dirname, 'window1.html'));

  const window2 = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });
  window2.loadFile(path.join(__dirname, 'window2.html'));

  // window1.webContents.openDevTools({ mode: 'right' });
  // window2.webContents.openDevTools({ mode: 'right' });
  // mainWindow.webContents.openDevTools({ mode: 'right' });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
