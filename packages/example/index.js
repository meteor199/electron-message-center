// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

let isE2E = false;
try {
  isE2E = __TEST__;
} catch (e) {
  //
}

require('electron-message-center/main');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: !isE2E,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('main.html');
  mainWindow.webContents.openDevTools({ mode: 'right' });

  const window1 = new BrowserWindow({
    show: !isE2E,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });
  window1.webContents.loadFile('window1.html');
  window1.webContents.openDevTools({ mode: 'right' });

  const window2 = new BrowserWindow({
    show: !isE2E,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: false,
    },
  });
  window2.webContents.loadFile('window2.html');
  window2.webContents.openDevTools({ mode: 'right' });
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
