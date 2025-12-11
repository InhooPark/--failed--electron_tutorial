import { app, shell, BrowserWindow, ipcMain, session, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'

const store = new Store()
const SESSION_PARTITION = 'persist:spotify-session'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    // hasShadow: false,
    resizable: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      partition: SESSION_PARTITION,
      webviewTag: true,
      plugins: true
    }
  })

  session.fromPartition(SESSION_PARTITION).webRequest.onHeadersReceived(
    {
      urls: ['*://*.spotify.com/*']
    },
    (details, callback) => {
      const responseHeaders = { ...details.responseHeaders }
      delete responseHeaders['x-frame-options']
      delete responseHeaders['content-security-policy']
      delete responseHeaders['X-Frame-Options']
      delete responseHeaders['Content-Security-Policy']
      callback({ cancel: false, responseHeaders })
    }
  )

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
ipcMain.on('resize-window', (event, width, height) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  if (win) {
    win.setSize(width, height)
  }
})

// Store init
ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key)
})
ipcMain.on('setStoreValue', (event, key, value) => {
  store.set(key, value)
})
ipcMain.on('open-spotify-login', () => {
  const loginWindow = new BrowserWindow({
    width: 500,
    height: 800,
    // parent: BrowserWindow.getAllWindows()[0],
    // modal: true,
    frame: true,
    alwaysOnTop: true,
    // autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: SESSION_PARTITION
    }
  })
  loginWindow.loadURL('https://accounts.spotify.com/en/login', {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })
  loginWindow.on('closed', () => {
    store.set('isLoggedIn', true)
    console.log('login window closed. saved isloggedin = true')
    // const wins = BrowserWindow.getAllWindows()
    // wins.forEach((win) => win.reaload())
    BrowserWindow.getAllWindows().forEach((win) => win.reload())
  })
})
ipcMain.handle('logout', async () => {
  const ses = session.fromPartition(SESSION_PARTITION)
  await ses.clearStorageData()
  store.set('isLoggedIn', false)
  console.log('logout executed. saved is loggedin = false')
  // const wins = BrowserWindow.getAllWindows()
  // wins.forEach((win) => win.reload())
  BrowserWindow.getAllWindows().forEach((win) => win.reload())
  return true
})

// ***
// app.disableHardwareAcceleration()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault()
    callback(true)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
