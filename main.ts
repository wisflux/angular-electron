import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  isDevMode = args.some(val => val === '--serve'),
  isLocalMode = args.some(val => val === '.');

console.log('args', args);

console.log(isDevMode, isLocalMode);
let pluginName;
let pluginVersion;
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplugin.dll';
    pluginVersion = '32.0.0.223';
    break;
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin';
    pluginVersion = '32.0.0.255';
    break;
  case 'linux':
    pluginName = 'libpepflashplayer.so';
    pluginVersion = '32.0.0.223';
    break;
}

isDevMode || isLocalMode
  ? app.commandLine.appendSwitch(
      'ppapi-flash-path',
      path.join(__dirname, `plugins/${pluginName}`)
    )
  : app.commandLine.appendSwitch(
      'ppapi-flash-path',
      path.join(__dirname, `../plugins/${pluginName}`)
    );

if (pluginVersion) {
  app.commandLine.appendSwitch('ppapi-flash-version', pluginVersion);
}

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: isDevMode ? true : false,
      plugins: true
    }
  });

  if (isDevMode) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200/assets/flash-birds.swf');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/assets/flash-birds.swf'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  if (isDevMode) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
