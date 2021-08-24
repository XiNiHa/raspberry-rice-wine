import type { Store } from 'vuex'
import type { Router } from 'vue-router'
import { Mutations } from '@/store'
import type { State } from '@/store'
import { Modals, useModalStore } from '@/stores/modal'
import { File } from './file'

type Context = {
  router?: Router;
  store?: Store<State>;
}

type Handler = (ctx: Context) => void
interface HandlerMap {
  [k: string]: Handler | HandlerMap;
}

export default function (path: string, context: Context): void {
  const parts = path.split('.')
  let index = 0
  let handlerOrMap: Handler | HandlerMap | undefined = handlerMap

  while (typeof handlerOrMap === 'object') {
    handlerOrMap = handlerOrMap[parts[index]]
    index++
  }

  if (typeof handlerOrMap === 'function' && parts.length === index) {
    handlerOrMap(context)
  }
}

const handlerMap: HandlerMap = {
  file: {
    newFile: ({ store }) => {
      if (store) {
        store.commit(Mutations.NewFile)
      }
    },
    openFile: async ({ store }) => {
      if (store) {
        store.commit(Mutations.OpenFile, { file: await File.fromFileSystem() })
      }
    },
    saveFile: async ({ store }) => {
      if (store) {
        await store.state.currentFile.save()
      }
    },
    saveFileAs: async ({ store }) => {
      if (store) {
        await store.state.currentFile.saveAs()
      }
    },
    importScript: async ({ store }) => {
      if (store) {
        const { data } = await window.bridgeApi.fileIo.open({
          encoding: 'utf8',
          fileTypes: [{
            name: 'Text Files',
            extensions: ['txt']
          }]
        })

        const modalStore = useModalStore()
        modalStore.open(Modals.ImportScript, { importText: data })
      }
    },
    export: ({ store }) => {
      if (store) {
        const modalStore = useModalStore()
        modalStore.open(Modals.ExportOption, null)
      }
    }
  },
  view: {
    scriptEditor: ({ router }) => {
      if (router) {
        router.push('/')
        window.bridgeApi.shell.notifyNewView('scriptEditor')
      }
    },
    templateEditor: ({ router }) => {
      if (router) {
        router.push('/template-editor')
        window.bridgeApi.shell.notifyNewView('templateEditor')
      }
    },
    settings: ({ router }) => {
      if (router) {
        router.push('/settings')
        window.bridgeApi.shell.notifyNewView('settings')
      }
    }
  }
}
