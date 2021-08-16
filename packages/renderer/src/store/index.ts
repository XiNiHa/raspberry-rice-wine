import { createStore } from 'vuex'
import type Color from 'color'
import type { File } from '@/common/file'
import type { Script } from '@/common/script'
import type { Layer, Template } from '@/common/template'

interface FileEditState {
  fsPath?: string;
  selectedScript: {
    anchor: Script | null;
    rest: Script[] | null;
  };
  selectedTemplate: Template | null;
  selectedLayer: Layer | null;
}

const state = {
  currentFile: {
    scripts: [],
    templates: [],
    selectedScript: {
      anchor: null,
      rest: null
    },
    selectedTemplate: null,
    selectedLayer: null
  } as File & FileEditState,
  hotkeyBinds: {
    scriptEditor: {
      newField: new Set(['Shift', '+'])
    }
  },
  activeModal: '',
  exportData: {
    targetDir: '',
    formatter: null as ((scriptIndex: number) => string) | null
  },
  colorPickerTarget: null as Color | null,
  colorPickerCallback: null as ((c: Color) => void) | null,
  importText: null as string | null
}

export type State = typeof state

export const enum Mutations {
  AddScript = 'add-script',
  RemoveScript = 'remove-script',
  MoveScript = 'move-script',
  SelectScript = 'select-script',

  SelectTemplate = 'select-template',

  SelectLayer = 'select-layer'
}

export function getSelectedScripts (state: State): Script[] {
  const result = []

  if (state.currentFile.selectedScript.anchor) {
    result.push(state.currentFile.selectedScript.anchor)

    if (state.currentFile.selectedScript.rest) {
      state.currentFile.selectedScript.rest.forEach(script => result.push(script))
    }
  }

  return result
}

export default createStore({
  state,
  mutations: {
    [Mutations.AddScript] (state) {
      const from = state.currentFile.scripts[state.currentFile.scripts.length - 1]
      state.currentFile.scripts.push({
        fields: from != null
          ? from.fields.map(field => ({
            name: field.name,
            value: ''
          }))
          : [],
        mappings: { ...from?.mappings }
      })
    },
    [Mutations.RemoveScript] (state, payload: { script: Script }) {
      const index = state.currentFile.scripts.indexOf(payload.script)

      if (index !== -1) {
        state.currentFile.scripts.splice(index, 1)

        if (getSelectedScripts(state).includes(payload.script)) {
          state.currentFile.selectedScript.anchor = null
          state.currentFile.selectedScript.rest = null
        }
      }
    },
    [Mutations.MoveScript] (state, payload: { target: Script; at: number }) {
      const targetIndex = state.currentFile.scripts.indexOf(payload.target)

      if (targetIndex !== -1) {
        state.currentFile.scripts.splice(payload.at, 0, state.currentFile.scripts.splice(targetIndex, 1)[0])
      }
    },
    [Mutations.SelectScript] (state, payload: { target: Script, multiSelect: boolean }) {
      if (state.currentFile.scripts.includes(payload.target)) {
        if (state.currentFile.selectedScript.anchor == null || !payload.multiSelect) {
          state.currentFile.selectedScript.anchor = payload.target
          state.currentFile.selectedScript.rest = []
        } else {
          const restArray = []
          const anchorIndex = state.currentFile.scripts.indexOf(state.currentFile.selectedScript.anchor)
          const tailIndex = state.currentFile.scripts.indexOf(payload.target)

          const lower = Math.min(anchorIndex, tailIndex)
          const larger = Math.max(anchorIndex, tailIndex)

          for (let i = lower; i <= larger; i++) {
            if (i !== anchorIndex) {
              restArray.push(state.currentFile.scripts[i])
            }
          }

          state.currentFile.selectedScript.rest = restArray
        }
      }
    },

    [Mutations.SelectTemplate] (state, payload: { target: Template }) {
      if (state.currentFile.templates.includes(payload.target)) {
        state.currentFile.selectedTemplate = payload.target
        state.currentFile.selectedLayer = null
      }
    },

    [Mutations.SelectLayer] (state, payload: { target: Layer }) {
      // Is performing recursive search a worth thing to do?
      // if (state.currentFile.selectedTemplate?.layers.includes(payload.target)) {
      state.currentFile.selectedLayer = payload.target
      // }
    }
  },
  actions: {
  },
  modules: {
  }
})
