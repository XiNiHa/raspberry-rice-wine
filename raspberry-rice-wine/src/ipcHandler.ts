import { app, ipcMain } from 'electron'
import fs from 'fs'

ipcMain.on('close', (e, arg) => app.quit())
ipcMain.on('export', (e, args: { path: string; dataUrl: string }) => {
  const sender = e.sender
  fs.writeFile(args.path, args.dataUrl.replace(/^data:image\/png;base64,/, ''), {
    encoding: 'base64'
  }, (e) => {
    if (e) sender.send('exportError', e)
    else sender.send('exported')
  })
})
