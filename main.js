// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false, // Prevents window flickering while loading
    icon: path.join(__dirname, 'dist/favicon.ico'), // Desktop icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove the browser top menu bar for a clean "native app" feel
  win.setMenuBarVisibility(false);

  // Load the built offline React files
  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});