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
      window.fileIo.open({
        encoding: 'utf8',
        fileTypes: [{
          name: 'Text Files',
          extensions: ['txt']
        }]
      }).then(({ data }) => {
        if (store) {
          store.state.importText = data
          store.state.activeModal = 'importScript'
        }
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
      window.shell.notifyNewView('scriptEditor')
    },
    templateEditor: ({ router }) => {
      router?.push('/template-editor')
      window.shell.notifyNewView('templateEditor')
    },
    settings: ({ router }) => {
      router?.push('/settings')
      window.shell.notifyNewView('settings')
    }
  }
}
