import { app, ipcMain } from 'electron'

ipcMain.on('close', (e, arg) => app.quit())
