import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import path from 'node:path'
import url from 'url';
import * as remoteMain from '@electron/remote/main';
remoteMain.initialize();
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const windowType = {
  main: 'main',
  customer: 'customer'
}

let mainWin: BrowserWindow | null
let customerWin: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  const {screen} = require('electron')
  const displays = screen.getAllDisplays()
  const secondaryDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  mainWin = new BrowserWindow({
    show: false,
    title: "Point of Sales System",
    icon: path.join(__dirname, '..', 'public', 'pos-logo-white.ico'),
    frame: false,
    // kiosk: true,
    webPreferences: {
      // devTools: false,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    }
  });

  remoteMain.enable(mainWin.webContents);

  // Disable reload for all pages 
  mainWin.webContents.on('before-input-event', (event, input) => { 
    if (input.control && input.key.toLowerCase() === 'r') { 
      event.preventDefault(); 
    }
  });

  mainWin.on('closed', () => {
    mainWin = null
  })

  globalShortcut.register('F11', () => {
    // Do nothing when F11 is pressed
  });

  globalShortcut.register('Alt+Tab', () => {
    // Do nothing or handle it as per your requirement
  });

  globalShortcut.register('Alt+F4', () => {
    // Do nothing or handle it as per your requirement
  });
  
  // mainWin?.setFullScreen(true);
  // mainWin.setAlwaysOnTop(true, 'screen-saver');
  mainWin.maximize()
  mainWin.show();
  mainWin.resizable = true;
  mainWin.on('closed', () => app.quit());

  if (secondaryDisplay) {
    customerWin = new BrowserWindow({
      width: secondaryDisplay.bounds.width,
      height: secondaryDisplay.bounds.height,
      x: secondaryDisplay.bounds.x,
      y: secondaryDisplay.bounds.y,
      show: false,
      frame: false,
      title: "Point of Sales System"
    });
    customerWin.maximize();
    customerWin.show();
    customerWin.resizable = true;
  }

  mainWin.webContents.on('did-finish-load', () => {
    mainWin?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWin.loadURL(VITE_DEV_SERVER_URL+`?view=${windowType.main}`);
    customerWin?.loadURL(VITE_DEV_SERVER_URL+`?view=${windowType.customer}`);
  } else {

    mainWin.loadURL(url.format({
      pathname: path.join(process.env.DIST, 'index.html'),
      protocol: 'file:',
      slashes: true,
      query: { view: 'main' }
    }));
    
    customerWin?.loadURL(url.format({
      pathname: path.join(process.env.DIST, 'index.html'),
      protocol: 'file:',
      slashes: true,
      query: { view: 'customer' }
    }));
  }

  ipcMain.on('open-pdf-window', (_, dataUrl: string) => {
    createNewWindow(dataUrl);
  });
}

function createNewWindow(dataUrl: string) {
  const newWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    },
    icon: "../public/pos-logo-white.ico"
  });
  

  newWin.loadURL(dataUrl);
  newWin.once('ready-to-show', () => {
    newWin.show();
  });
}

app.on('window-all-closed', () => {
  mainWin = null
})



app.whenReady().then(createWindow)
