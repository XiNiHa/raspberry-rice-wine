import fs from 'fs'
import { app, dialog, ipcMain, Menu } from 'electron'
import type { BrowserWindow, FileFilter, IpcMainEvent, IpcRendererEvent, WebContents } from 'electron'

export type IpcRendererArgs = {
  close: void;
  open: {
    encoding: BufferEncoding;
    fileTypes?: FileFilter[];
  };
  save: {
    path: string;
    encoding: BufferEncoding;
    data: string;
  };
  saveAs: {
    encoding: BufferEncoding;
    data: string;
    fileTypes?: FileFilter[];
    defaultPath: string;
  },
  viewChanged: {
    name: string;
  }
}

export type IpcMainArgs = {
  enterFullscreen: void;
  leaveFullscreen: void;
  toolbar: {
    path: string;
  };
  openCompleted: {
    data: string;
    path: string;
  };
  openError: Error;
  saveCompleted: void;
  saveError: Error;
  saveAsCompleted: {
    path: string;
  }
  saveAsError: Error;
}

export type IpcRendererChannel = keyof IpcRendererArgs
export type IpcMainChannel = keyof IpcMainArgs

export type IpcRendererHandler<T extends keyof IpcRendererArgs> = (event: IpcMainEvent, args: IpcRendererArgs[T]) => void
export type IpcMainHandler<T extends keyof IpcMainArgs> = (event: IpcRendererEvent, args: IpcMainArgs[T]) => void

function ipcMainOn<T extends IpcRendererChannel> (channel: T, handler: IpcRendererHandler<T>) {
  return ipcMain.on(channel, handler)
}

function ipcMainSend<T extends IpcMainChannel> (sender: WebContents, channel: T, args: IpcMainArgs[T]) {
  return sender.send(channel, args)
}

export default function (window: BrowserWindow): void {
  ipcMainOn('close', () => app.quit())
  ipcMainOn('open', async (e, args) => {
    const sender = e.sender
    const result = await dialog.showOpenDialog(window, {
      filters: args.fileTypes,
      properties: ['openFile']
    })
    fs.readFile(result.filePaths[0], (error, buf) => {
      if (error) ipcMainSend(sender, 'openError', error)
      else {
        ipcMainSend(sender, 'openCompleted', {
          data: buf.toString(args.encoding),
          path: result.filePaths[0]
        })
      }
    })
  })
  ipcMainOn('save', (e, { path, data, encoding }) => {
    const sender = e.sender
    fs.writeFile(path, data, encoding, (error) => {
      if (error) ipcMainSend(sender, 'saveError', error)
      else ipcMainSend(sender, 'saveCompleted', undefined)
    })
  })
  ipcMainOn('saveAs', async (e, { data, encoding, fileTypes, defaultPath }) => {
    const sender = e.sender
    const result = await dialog.showSaveDialog(window, {
      defaultPath,
      filters: fileTypes,
      properties: ['createDirectory']
    })
    if (!result.canceled && result.filePath) {
      fs.writeFile(result.filePath, data, encoding, (error) => {
        if (error) ipcMainSend(sender, 'saveAsError', error)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        else ipcMainSend(sender, 'saveAsCompleted', { path: result.filePath! })
      })
    }
  })
  ipcMainOn('viewChanged', (e, { name }) => {
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
