import { createStore } from 'vuex'
import Color from 'color'
import { File } from '@/common/file'
import { Script } from '@/common/script'
import { Layer, Template } from '@/common/template'

interface FileEditState {
  selectedScript: Script | null;
  selectedTemplate: Template | null;
  selectedLayer: Layer | null;
}

const state = {
  currentFile: {
    scripts: [
      {
        fields: [
          {
            name: 'Main Text',
            value: 'Hello, World!'
          }
        ],
        mappings: {}
      },
      {
        fields: [
          {
            name: 'Main Text',
            value: 'The second title'
          }
        ],
        mappings: {}
      },
      {
        fields: [
          {
            name: 'Main Text',
            value: 'Unicode Test: 유니코드 테스트'
          }
        ],
        mappings: {}
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
                color: Color.rgb(200, 40, 40).alpha(0.8)
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
  },
  activeModal: '',
  exportData: {
    targetDir: '',
    formatter: null as ((scriptIndex: number) => string) | null
  },
  colorPickerTarget: null as Color | null,
  colorPickerCallback: null as ((c: Color) => void)| null
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

export default createStore({
  state,
  mutations: {
    [Mutations.AddScript] (state) {
      const from = state.currentFile.scripts[state.currentFile.scripts.length - 1]
      state.currentFile.scripts.push({
        fields: from.fields.map(field => ({
          name: field.name,
          value: ''
        })),
        mappings: { ...from.mappings }
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
