import { createStore } from 'vuex'
import Color from 'color'
import { File } from '@/common/file'
import { Script } from '@/common/script'
import { Layer, Template } from '@/common/template'

const state = {
  currentFile: {
    scripts: [
      {
        fields: [
          {
            name: 'Main Text',
            value: 'Hello, World!'
          },
          {
            name: 'Speaker',
            value: 'XiNiHa'
          }
        ]
      },
      {
        fields: [
          {
            name: 'Main Text',
            value: 'Hello, World!'
          },
          {
            name: 'Speaker',
            value: 'XiNiHa'
          }
        ]
      },
      {
        fields: [
          {
            name: 'Main Text',
            value: 'Hello, World!'
          },
          {
            name: 'Speaker',
            value: 'XiNiHa'
          }
        ]
      }
    ],
    templates: [
      {
        name: 'New Template',
        layers: [
          {
            name: 'New Layer',
            isTextbox: false,
            children: [
              {
                name: 'Textbox',
                isTextbox: true
              }
            ],
            props: {
              background: {
                color: Color.rgb(200, 40, 40)
              }
            },
            plainStyles: {
              width: '220px',
              height: '60px'
            }
          }
        ]
      }
    ],
    selectedScript: null,
    selectedTemplate: null,
    selectedLayer: null
  } as File & FileEditState,
  hotkeyBinds: {
    scriptEditor: {
      newField: new Set(['Shift', '+'])
    }
  }
}

export type State = typeof state

interface FileEditState {
  selectedScript: Script | null;
  selectedTemplate: Template | null;
  selectedLayer: Layer | null;
}

export const enum Mutations {
  AddScript = 'add-script',
  RemoveScript = 'remove-script',
  MoveScript = 'move-script',
  SelectScript = 'select-script',

  SelectTemplate = 'select-template',

  SelectLayer = 'select-layer'
}

export default createStore({
  state,
  mutations: {
    [Mutations.AddScript] (state) {
      state.currentFile.scripts.push({
        fields: state.currentFile.scripts[state.currentFile.scripts.length - 1].fields.map(field => ({
          name: field.name,
          value: ''
        }))
      })
    },
    [Mutations.RemoveScript] (state, payload: { script: Script }) {
      const index = state.currentFile.scripts.indexOf(payload.script)

      if (index !== -1) {
        state.currentFile.scripts.splice(index, 1)

        if (state.currentFile.selectedScript === payload.script) {
          const newIndex = Math.min(index, state.currentFile.scripts.length - 1)
          state.currentFile.selectedScript = state.currentFile.scripts[newIndex]
        }
      }
    },
    [Mutations.MoveScript] (state, payload: { target: Script; at: number }) {
      const targetIndex = state.currentFile.scripts.indexOf(payload.target)

      if (targetIndex !== -1) {
        state.currentFile.scripts.splice(payload.at, 0, state.currentFile.scripts.splice(targetIndex, 1)[0])
      }
    },
    [Mutations.SelectScript] (state, payload: { target: Script }) {
      if (state.currentFile.scripts.includes(payload.target)) {
        state.currentFile.selectedScript = payload.target
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
