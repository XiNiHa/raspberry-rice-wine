import { createStore } from 'vuex'
import type Color from 'color'
import vueI18n from '@/vueI18n'
import { File } from '@/common/file'
import type { Script } from '@/common/script'
import { Template, Layer, LayerComponents, genUniqueId } from '@/common/template'
import type { LayerType, ComponentPropKey, ComponentName, ComponentPropValue, ComponentPropType, PropType } from '@/common/template'

const state = {
  currentFile: new File(),
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
  colorPickerData: {
    target: null as Color | null,
    callback: null as ((c: Color) => void) | null
  },
  importText: null as string | null
}

export type State = typeof state

export const enum Mutations {
  NewFile = 'new-file',
  OpenFile = 'open-file',
  NewScript = 'new-script',
  AddScripts = 'add-scripts',
  RemoveScript = 'remove-script',
  MoveScript = 'move-script',
  SelectScript = 'select-script',
  AddField = 'add-field',
  RemoveFields = 'remove-fields',
  UpdateNames = 'update-names',
  UpdateValues = 'update-values',
  MapTemplate = 'map-template',
  MapTextbox = 'map-textbox',
  NewTemplate = 'new-template',
  RemoveTemplate = 'remove-template',
  SelectTemplate = 'select-template',
  NewLayer = 'new-layer',
  RemoveLayer = 'remove-layer',
  MoveLayer = 'move-layer',
  SelectLayer = 'select-layer',
  ClearHierarchySelectons = 'clear-hierarchy-selectons',
  SetTemplateName = 'set-template-name',
  SetTemplateWidth = 'set-template-width',
  SetTemplateHeight = 'set-template-height',
  SetLayerName = 'set-layer-name',
  SetLayerType = 'set-layer-type',
  SetLayerImage = 'set-layer-image',
  AddLayerComponent = 'add-layer-component',
  UpdateLayerComponentProp = 'update-layer-component-prop',
  UpdateHotkey = 'update-hotkey',
  OpenImportScript = 'open-import-script',
  OpenExportOption = 'open-export-option',
  OpenColorPicker = 'open-color-picker',
  TriggerExport = 'trigger-export',
  CloseModal = 'close-modal',
  UpdateColorPickerTarget = 'update-color-picker-target'
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
    [Mutations.NewFile] (state) {
      state.currentFile = new File()
    },
    [Mutations.OpenFile] (state, payload: { file: File }) {
      state.currentFile = payload.file
    },
    [Mutations.NewScript] (state) {
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
    [Mutations.AddScripts] (state, payload: { scripts: Script[] }) {
      state.currentFile.scripts.push(...payload.scripts)
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
    [Mutations.UpdateNames] (state, payload: { origName: string, newName: string }) {
      getSelectedScripts(state)
        .forEach(script => {
          const field = script.fields.find(field => field.name === payload.origName)

          if (field) field.name = payload.newName
        })
    },
    [Mutations.UpdateValues] (state, payload: { name: string, value: string }) {
      getSelectedScripts(state)
        .forEach(script => {
          const field = script.fields.find(field => field.name === payload.name)

          if (field) field.value = payload.value
        })
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
    [Mutations.AddField] (state) {
      getSelectedScripts(state)
        .forEach(script => script.fields.push({
          name: vueI18n.global.t('scriptEditor.newFieldName'),
          value: ''
        }))
    },
    [Mutations.RemoveFields] (state, payload: { name?: string, value?: string }) {
      getSelectedScripts(state)
        .forEach(script => {
          const fieldsToRemove = script.fields.filter(field =>
            (!payload.name || field.name === payload.name) &&
            (!payload.value || field.value === payload.value)
          )
          for (const field of fieldsToRemove) {
            script.fields.splice(script.fields.indexOf(field), 1)
          }
        })
    },
    [Mutations.MapTemplate] (state, payload: { template: Template }) {
      getSelectedScripts(state).forEach(script => { script.template = payload.template })
    },
    [Mutations.MapTextbox] (state, payload: { fieldName: string, textboxName: string }) {
      getSelectedScripts(state).forEach(script => {
        script.mappings[payload.fieldName] = payload.textboxName
      })
    },
    [Mutations.NewTemplate] (state) {
      state.currentFile.templates.push(
        new Template(genUniqueId(), vueI18n.global.t('hierarchy.newTemplate'), [], 1920, 1080)
      )
    },
    [Mutations.RemoveTemplate] (state, payload: { templateId: string }) {
      for (let i = 0; i < state.currentFile.templates.length; i++) {
        if (state.currentFile.templates[i].id === payload.templateId) {
          state.currentFile.templates.splice(i, 1)
          return
        }
      }
    },
    [Mutations.SelectTemplate] (state, payload: { target: Template }) {
      if (state.currentFile.templates.includes(payload.target)) {
        state.currentFile.selectedTemplate = payload.target
        state.currentFile.selectedLayer = null
      }
    },
    [Mutations.NewLayer] (state, payload: { parentId: string }) {
      const template = state.currentFile.getContainingTemplate(payload.parentId)
      template?.addChild(payload.parentId, new Layer())
    },
    [Mutations.RemoveLayer] (state, payload: { parentId: string, layerId: string }) {
      const template = state.currentFile.getContainingTemplate(payload.parentId)
      template?.removeChild(payload.parentId, payload.layerId)
    },
    [Mutations.MoveLayer] (state, payload: { originParentId: string, targetParentId: string, layerId: string }) {
      const template = state.currentFile.getContainingTemplate(payload.originParentId, payload.targetParentId, payload.layerId)
      template?.moveChild(payload.originParentId, payload.targetParentId, payload.layerId)
    },
    [Mutations.SelectLayer] (state, payload: { target: Layer }) {
      if (state.currentFile.selectedTemplate?.hasOrIs(payload.target.id)) {
        state.currentFile.selectedLayer = payload.target
      }
    },
    [Mutations.ClearHierarchySelectons] (state) {
      state.currentFile.selectedTemplate = null
      state.currentFile.selectedLayer = null
    },
    [Mutations.SetTemplateName] (state, payload: { templateId: string, name: string }) {
      const template = state.currentFile.templates.find(t => t.id === payload.templateId)
      if (template) template.name = payload.name
    },
    [Mutations.SetTemplateWidth] (state, payload: { templateId: string, width: number }) {
      const template = state.currentFile.templates.find(t => t.id === payload.templateId)
      if (template) template.width = payload.width
    },
    [Mutations.SetTemplateHeight] (state, payload: { templateId: string, height: number }) {
      const template = state.currentFile.templates.find(t => t.id === payload.templateId)
      if (template) template.height = payload.height
    },
    [Mutations.SetLayerName] (state, payload: { layerId: string, name: string }) {
      const template = state.currentFile.getContainingTemplate(payload.layerId)
      const layer = template?.getChild(payload.layerId)

      if (layer) {
        layer.name = payload.name
      }
    },
    [Mutations.SetLayerType] (state, payload: { layerId: string, type: LayerType }) {
      const template = state.currentFile.getContainingTemplate(payload.layerId)
      const layer = template?.getChild(payload.layerId)

      if (layer) {
        layer.type = payload.type
      }
    },
    [Mutations.SetLayerImage] (state, payload: { layerId: string, imageSrc: string, base64Url: string }) {
      const template = state.currentFile.getContainingTemplate(payload.layerId)
      const layer = template?.getChild(payload.layerId)

      if (layer) {
        layer.imageSrc = payload.imageSrc
        layer.base64Url = payload.base64Url
      }
    },
    [Mutations.AddLayerComponent] (state, payload: { layerId: string, componentName: ComponentName }) {
      const template = state.currentFile.getContainingTemplate(payload.layerId)
      const layer = template?.getChild(payload.layerId)

      if (layer) {
        (layer.props[payload.componentName] as Record<string, PropType>) = LayerComponents[payload.componentName].defaultProps()
      }
    },
    [Mutations.UpdateLayerComponentProp] <N extends ComponentName, K extends ComponentPropKey<N>> (state: State, payload: {
      layerId: string;
      componentName: N;
      propKey: K;
      value: ComponentPropValue<N, K>;
    }) {
      const template = state.currentFile.getContainingTemplate(payload.layerId)
      const target = template?.getChild(payload.layerId)?.props[payload.componentName]

      if (target) {
        const converted = target as ComponentPropType<N>
        converted[payload.propKey] = payload.value
      }
    },
    [Mutations.UpdateHotkey] (state, payload: { comb: Set<string>, path: string[] }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = state.hotkeyBinds
      for (const part of payload.path) {
        if (!(part in target)) return

        target = target[part]
      }

      if (target && typeof target === 'object' && target instanceof Set) {
        target.clear()
        payload.comb.forEach(key => target.add(key))
      }
    },
    [Mutations.OpenImportScript] (state, payload: { importText: string }) {
      state.activeModal = 'importScript'
      state.importText = payload.importText
    },
    [Mutations.OpenExportOption] (state) {
      state.activeModal = 'exportOption'
    },
    [Mutations.OpenColorPicker] (state, payload: {
      target: Color;
      callback?: (c: Color) => void;
    }) {
      state.activeModal = 'colorPicker'
      state.colorPickerData.target = payload.target
      if (payload.callback) {
        state.colorPickerData.callback = payload.callback
      }
    },
    [Mutations.UpdateColorPickerTarget] (state, payload: { target: Color }) {
      state.colorPickerData.target = payload.target
    },
    [Mutations.CloseModal] (state) {
      state.activeModal = ''
      state.importText = null
      state.colorPickerData.target = null
      state.colorPickerData.callback = null
    },
    [Mutations.TriggerExport] (state, payload: { targetDir: string, formatter: (scriptIndex: number) => string }) {
      state.activeModal = 'exportProgress'
      state.exportData.targetDir = payload.targetDir
      state.exportData.formatter = payload.formatter
    }
  },
  actions: {
  },
  modules: {
  }
})
