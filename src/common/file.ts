import { State } from '@/store'
import Color from 'color'
import { Store } from 'vuex'
import { Field, Script } from './script'
import { Layer, LayerType, PropType, Template } from './template'

export interface File {
  scripts: Script[];
  templates: Template[];
}

export type TypedObject = {
  type: 'Color';
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface JsonLayer {
  type: LayerType;
  imageSrc?: string;
  base64Url?: string;
  name: string;
  children?: JsonLayer[],
  props?: Record<string, Record<string, Exclude<PropType, Color> | TypedObject>>;
  plainStyles?: Record<string, string>;
}

export interface JsonFile {
  scripts: {
    fields: Field[],
    templateId?: string,
    mappings: Record<string, string>;
  }[];
  templates: {
    name: string;
    layers: JsonLayer[];
    width: number;
    height: number;
  }[];
}

export function openFile ({ store }: {store?: Store<State>}): void {
  if (store) {
    window.fileIo.open({
      encoding: 'utf8',
      fileTypes: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }]
    }).then(({ data, path }) => {
      store.state.currentFile = {
        ...fromJson(JSON.parse(data)),
        fsPath: path,
        selectedScript: {
          anchor: null,
          rest: null
        },
        selectedTemplate: null,
        selectedLayer: null
      }
    })
  }
}

export function saveFile ({ store }: {store?: Store<State>}): void {
  if (store) {
    if (!store.state.currentFile.fsPath) {
      return saveFileAs({ store })
    }

    const json = toJson(store.state.currentFile)
    window.fileIo.save({
      path: store.state.currentFile.fsPath,
      encoding: 'utf8',
      data: json
    })
  }
}

export function saveFileAs ({ store }: {store?: Store<State>}): void {
  if (store) {
    const json = toJson(store.state.currentFile)
    window.fileIo.saveAs({
      encoding: 'utf8',
      data: json,
      defaultPath: 'Project.rrw',
      fileTypes: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }]
    }).then(({ path }) => { store.state.currentFile.fsPath = path })
  }
}

function toJson (file: File) {
  const converted: JsonFile = {
    scripts: [],
    templates: []
  }

  for (const script of file.scripts) {
    converted.scripts.push({
      fields: script.fields,
      templateId: script.template?.name,
      mappings: script.mappings
    })
  }

  for (const template of file.templates) {
    const convertLayer = (layer: Layer): JsonLayer => {
      const converted: JsonLayer = {
        type: layer.type,
        imageSrc: layer.type === LayerType.Image ? layer.imageSrc : undefined,
        base64Url: layer.type === LayerType.Image ? layer.base64Url : undefined,
        name: layer.name,
        children: layer.children?.map(convertLayer),
        plainStyles: layer.plainStyles
      }
      if (layer.props) {
        const convertedProps: Record<string, Record<string, Exclude<PropType, Color> | TypedObject>> = {}
        for (const [propKey, propObj] of Object.entries(layer.props)) {
          if (!propObj) continue
          convertedProps[propKey] = {}

          for (const [key, value] of Object.entries(propObj)) {
            if (typeof value === 'object' && value instanceof Color) {
              convertedProps[propKey][key] = {
                type: 'Color',
                r: value.red(),
                g: value.green(),
                b: value.blue(),
                a: value.alpha()
              }
            } else {
              convertedProps[propKey][key] = value
            }
          }
        }
        converted.props = convertedProps
      }

      return converted
    }

    converted.templates.push({
      name: template.name,
      width: template.width,
      height: template.height,
      layers: template.layers.map(convertLayer)
    })
  }

  return JSON.stringify(converted)
}

function fromJson (json: string) {
  const result: File = {
    scripts: [],
    templates: []
  }
  const parsed: JsonFile = JSON.parse(json)

  for (const template of parsed.templates) {
    const convertLayer = (layer: JsonLayer): Layer => {
      const converted: Layer = {
        type: layer.type,
        imageSrc: layer.type === LayerType.Image ? layer.imageSrc : undefined,
        base64Url: layer.type === LayerType.Image ? layer.base64Url : undefined,
        name: layer.name,
        children: layer.children?.map(convertLayer),
        plainStyles: layer.plainStyles
      }
      if (layer.props) {
        const convertedProps: Record<string, Record<string, PropType>> = {}
        for (const [propKey, propObj] of Object.entries(layer.props)) {
          if (!propObj) continue
          convertedProps[propKey] = {}

          for (const [key, value] of Object.entries(propObj)) {
            if (typeof value === 'object') {
              if (value.type === 'Color') {
                convertedProps[propKey][key] = Color.rgb(value.r, value.g, value.b).alpha(value.a)
              }
            } else {
              convertedProps[propKey][key] = value
            }
          }
        }
        converted.props = convertedProps
      }

      return converted
    }
    result.templates.push({
      name: template.name,
      width: template.width,
      height: template.height,
      layers: template.layers.map(convertLayer)
    })
  }

  for (const script of parsed.scripts) {
    result.scripts.push({
      fields: script.fields,
      template: result.templates.find(template => template.name === script.templateId),
      mappings: script.mappings
    })
  }

  return result
}
