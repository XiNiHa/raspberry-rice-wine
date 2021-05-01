import { Store } from 'vuex'
import { Router } from 'vue-router'
import { State } from '@/store'
import { openFile, saveFile, saveFileAs } from './file'

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
        store.state.currentFile = {
          scripts: [],
          templates: [],
          selectedScript: {
            anchor: null,
            rest: null
          },
          selectedTemplate: null,
          selectedLayer: null
        }
      }
    },
    openFile,
    saveFile,
    saveFileAs,
    importScript: ({ store }) => {
      window.ipcRenderer.on('readCompleted', (e, { data: content }) => {
        window.ipcRenderer.removeAllListeners('readCompleted')
        if (store) {
          store.state.importText = content
          store.state.activeModal = 'importScript'
        }
      })
      window.ipcRenderer.send('read', {
        encoding: 'utf8',
        fileTypes: [{
          name: 'Text Files',
          extensions: ['txt']
        }]
      })
    },
    export: ({ store }) => {
      if (store) {
        store.state.activeModal = 'exportOption'
      }
    }
  },
  view: {
    scriptEditor: ({ router }) => {
      router?.push('/')
      window.ipcRenderer.send('viewChanged', 'scriptEditor')
    },
    templateEditor: ({ router }) => {
      router?.push('/template-editor')
      window.ipcRenderer.send('viewChanged', 'templateEditor')
    },
    settings: ({ router }) => {
      router?.push('/settings')
      window.ipcRenderer.send('viewChanged', 'settings')
    }
  }
}
