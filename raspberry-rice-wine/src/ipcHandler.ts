import { app, ipcMain } from 'electron'
import fs from 'fs'

export default function (): void {
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
  ipcMain.on('read', (e, args: { path: string }) => {
    const sender = e.sender
    fs.readFile(args.path, (e, buf) => {
      if (e) sender.send('readError', e)
      else sender.send('readCompleted', buf.toString('utf8'))
    })
  })
  ipcMain.on('readBase64', (e, args: { path: string }) => {
    const sender = e.sender
    fs.readFile(args.path, (e, buf) => {
      if (e) sender.send('readBase64Error', e)
      else sender.send('readBase64Completed', buf.toString('base64'))
    })
  })
}
