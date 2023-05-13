// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

require('electron-message-center/main');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    maximize: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');
  mainWindow.maximize();
  const view1 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.setBrowserView(view1);
  view1.setBounds({ x: 0, y: 100, width: 1200, height: 300 });
  view1.webContents.loadFile('view1.html');
  view1.webContents.openDevTools();

  const view2 = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.addBrowserView(view2);
  view2.setBounds({ x: 0, y: 400, width: 1200, height: 300 });
  view2.webContents.loadFile('view2.html');
  view2.webContents.openDevTools();
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
