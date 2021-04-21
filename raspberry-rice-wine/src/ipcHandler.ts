import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import fs from 'fs'

export default function (window: BrowserWindow): void {
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
  ipcMain.on('read', async (e, args: {
    encoding: BufferEncoding;
    fileTypes: {
      name: string;
      extensions: string[];
    }[];
  }) => {
    const sender = e.sender
    const result = await dialog.showOpenDialog(window, {
      filters: args.fileTypes,
      properties: ['openFile']
    })
    fs.readFile(result.filePaths[0], (e, buf) => {
      if (e) sender.send('readError', e)
      else {
        sender.send('readCompleted', {
          data: buf.toString(args.encoding),
          path: result.filePaths[0]
        })
      }
    })
  })
  ipcMain.on('viewChanged', (e, name) => {
    const viewMenu = Menu.getApplicationMenu()?.getMenuItemById('viewMenu')
    if (viewMenu) {
      viewMenu.submenu?.items.forEach(item => {
        if (item.id === `viewMenu_${name}`) {
          item.checked = true
        } else {
          item.checked = false
        }
      })
    }
  })
}
