import path from 'path'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension from 'electron-devtools-installer'
import setupIpcHandler from './ipcHandler'
import menuCreator from './menuCreator'

const isDevelopment = process.env.NODE_ENV !== 'production'

let win: BrowserWindow | null

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  win.on('enter-full-screen', () => win?.webContents.send('enter-fullscreen'))
  win.on('leave-full-screen', () => win?.webContents.send('leave-fullscreen'))
  win.on('closed', () => { win = null })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension('ljjemllljcmogpfapbkkighbhhppjdbg') // VueJS Devtools Beta Channel
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
  if (win) {
    setupIpcHandler(win)
    menuCreator(win)
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => app.quit())
  }
}
