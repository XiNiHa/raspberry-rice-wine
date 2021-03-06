import { Menu } from 'electron'
import type { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import initI18n from '@/i18next'

const isMac = process.platform === 'darwin'

export default async function (window: BrowserWindow): Promise<void> {
  const t = await initI18n()

  const menu = Menu.buildFromTemplate([
    ...(isMac
      ? [{
        label: t('app.title'),
        submenu: [
          {
            label: t('toolbar.app.about'),
            role: 'about'
          },
          { type: 'separator' },
          {
            label: t('toolbar.app.services'),
            role: 'services'
          },
          { type: 'separator' },
          {
            label: t('toolbar.app.hide'),
            role: 'hide'
          },
          {
            label: t('toolbar.app.hideothers'),
            role: 'hideothers'
          },
          {
            label: t('toolbar.app.unhide'),
            role: 'unhide'
          },
          { type: 'separator' },
          {
            label: t('toolbar.app.quit'),
            role: 'quit'
          }
        ]
      } as MenuItemConstructorOptions]
      : []),
    {
      label: t('toolbar.file.title'),
      submenu: [
        {
          label: t('toolbar.file.newFile'),
          click: () => window.webContents.send('toolbar', { path: 'file.newFile' })
        },
        {
          label: t('toolbar.file.openFile'),
          click: () => window.webContents.send('toolbar', { path: 'file.openFile' })
        },
        {
          label: t('toolbar.file.saveFile'),
          click: () => window.webContents.send('toolbar', { path: 'file.saveFile' })
        },
        {
          label: t('toolbar.file.saveFileAs'),
          click: () => window.webContents.send('toolbar', { path: 'file.saveFileAs' })
        },
        ...(
          import.meta.env?.DEV
            ? [
                { type: 'separator' as const },
                { role: 'toggleDevTools' as const }
              ]
            : []),
        { type: 'separator' },
        {
          label: t('toolbar.file.importScript'),
          click: () => window.webContents.send('toolbar', { path: 'file.importScript' })
        },
        {
          label: t('toolbar.file.export'),
          click: () => window.webContents.send('toolbar', { path: 'file.export' })
        }
      ]
    },
    {
      id: 'viewMenu',
      label: t('toolbar.view.title'),
      submenu: [
        {
          id: 'viewMenu_scriptEditor',
          label: t('toolbar.view.scriptEditor'),
          type: 'checkbox',
          checked: true,
          click: () => window.webContents.send('toolbar', { path: 'view.scriptEditor' })
        },
        {
          id: 'viewMenu_templateEditor',
          label: t('toolbar.view.templateEditor'),
          type: 'checkbox',
          checked: false,
          click: () => window.webContents.send('toolbar', { path: 'view.templateEditor' })
        },
        { type: 'separator' },
        {
          id: 'viewMenu_settings',
          label: t('toolbar.view.settings'),
          type: 'checkbox',
          checked: false,
          click: () => window.webContents.send('toolbar', { path: 'view.settings' })
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}
