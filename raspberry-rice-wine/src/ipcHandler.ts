import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import fs from 'fs'

export default function (window: BrowserWindow): void {
  ipcMain.on('close', (e, arg) => app.quit())
  ipcMain.on('openFile', async (e) => {
    const sender = e.sender
    const result = await dialog.showOpenDialog(window, {
      filters: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }],
      properties: ['openFile']
    })
    fs.readFile(result.filePaths[0], (e, buf) => {
      if (e) sender.send('openFileError', e)
      else {
        sender.send('openFileCompleted', {
          path: result.filePaths[0],
          json: buf.toString('utf8')
        })
      }
    })
  })
  ipcMain.on('saveFile', (e, args: { path: string, json: string }) => {
    const sender = e.sender
    fs.writeFile(args.path, args.json, 'utf8', (e) => {
      if (e) sender.send('saveFileError', e)
      else sender.send('saveFileCompleted')
    })
  })
  ipcMain.on('saveFileAs', async (e, { json }: { json: string }) => {
    const sender = e.sender
    const result = await dialog.showSaveDialog(window, {
      defaultPath: 'Project.rrw',
      filters: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }],
      properties: ['createDirectory']
    })
    if (!result.canceled && result.filePath) {
      fs.writeFile(result.filePath, json, 'utf8', (e) => {
        if (e) sender.send('saveFileAsError', e)
        else sender.send('saveFileAsCompleted', result.filePath)
      })
    }
  })
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
