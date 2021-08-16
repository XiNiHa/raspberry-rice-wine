import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererArgs, IpcMainArgs, IpcMainHandler, IpcMainChannel, IpcRendererChannel } from '@/../../main/src/ipcHandler'

function ipcRendererOn<T extends IpcMainChannel> (channel: T, handler: IpcMainHandler<T>) {
  return ipcRenderer.on(channel, handler)
}

function ipcRendererRemoveListener<T extends IpcMainChannel> (channel: T, handler: IpcMainHandler<T>) {
  return ipcRenderer.removeListener(channel, handler)
}

function ipcRendererSend<T extends IpcRendererChannel> (channel: T, args: IpcRendererArgs[T]) {
  return ipcRenderer.send(channel, args)
}

function getPromisifiedHandler<
  T extends IpcRendererChannel,
  C extends IpcMainChannel,
  E extends IpcMainChannel
> (channel: T, completedChannel: C, errorChannel: E) {
  return (args: IpcRendererArgs[T]) => new Promise<IpcMainArgs[C]>((resolve, reject) => {
    const completeHandler: IpcMainHandler<C> = (_, args) => {
      ipcRendererRemoveListener(completedChannel, completeHandler)
      resolve(args)
    }
    const errorHandler: IpcMainHandler<E> = (_, args) => {
      ipcRendererRemoveListener(errorChannel, errorHandler)
      reject(args)
    }

    ipcRendererOn(completedChannel, completeHandler)
    ipcRendererOn(errorChannel, errorHandler)
    ipcRendererSend(channel, args)
  })
}

const infoApi = {
  platform: process.platform
}

const shellApi = {
  registerEnterFullscreenHandler: (handler: IpcMainHandler<'enterFullscreen'>) => ipcRendererOn('enterFullscreen', handler),
  registerLeaveFullscreenHandler: (handler: IpcMainHandler<'leaveFullscreen'>) => ipcRendererOn('leaveFullscreen', handler),
  registerToolbarHandler: (handler: IpcMainHandler<'toolbar'>) => ipcRendererOn('toolbar', handler),
  close: () => ipcRendererSend('close', undefined),
  notifyNewView: (name: string) => ipcRendererSend('viewChanged', { name })
}

const fileIoApi = {
  open: getPromisifiedHandler('open', 'openCompleted', 'openError'),
  save: getPromisifiedHandler('save', 'saveCompleted', 'saveError'),
  saveAs: getPromisifiedHandler('saveAs', 'saveAsCompleted', 'saveAsError')
}

const bridgeApi = {
  info: infoApi,
  shell: shellApi,
  fileIo: fileIoApi
}

contextBridge.exposeInMainWorld('bridgeApi', bridgeApi)

export type BridgeApi = typeof bridgeApi
