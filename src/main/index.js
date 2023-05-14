'use strict'

import { app, BrowserWindow, Menu, remote, globalShortcut, ipcMain, dialog } from 'electron'
// import IpcMain from './plugins/ipMain'
app.allowRendererProcessReuse = false
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: 'iDownloader',
    height: 670,
    minHeight: 670,
    // maxHeight: 520,
    useContentSize: true,
    width: process.env.NODE_ENV === 'development' ? 1270 : 900,
    minWidth: 900,
    webPreferences: {
      sandbox: false,
      nodeIntegration: true,
      webSecurity: false,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  if (process.env.NODE_ENV !== 'development') {
    Menu.setApplicationMenu(null)
  }
  mainWindow.loadURL(winURL)
  // mainWindow.webContents.openDevTools({ mode: 'right' })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  //   IpcMain()
}

app.on('ready', createWindow)

app.whenReady().then(() => {
  let opened = false
  globalShortcut.register('CommandOrControl+F12', () => {
    if (!opened) {
      mainWindow.webContents.openDevTools()
      opened = true
    } else {
      mainWindow.webContents.closeDevTools()
      opened = false
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * ipcMain
 */
ipcMain.on('getLocal', (event, arg) => {
  event.returnValue = dialog.showOpenDialogSync({
    properties: ['openDirectory'],
    filters: []
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
