import Color from 'color'
import type { Field, Script } from './script'
import type { Layer, PropType, Template } from './template'
import { LayerType } from './template'

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

interface ScriptSelection {
  anchor: Script | null;
  rest: Script[] | null;
}
export class File {
  // eslint-disable-next-line no-useless-constructor
  constructor (
    public scripts: Script[] = [],
    public templates: Template[] = [],
    public fsPath: string | null = null,
    public selectedScript: ScriptSelection = { anchor: null, rest: null },
    public selectedTemplate: Template | null = null,
    public selectedLayer: Layer | null = null
  ) {}

  static async fromFileSystem (): Promise<File> {
    const { data, path } = await window.bridgeApi.fileIo.open({
      encoding: 'utf8',
      fileTypes: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }]
    })

    return File.fromJson(data, path)
  }

  static fromJson (json: string, fsPath: string | null = null): File {
    const result: File = new File([], [], fsPath)
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

  toJson (): string {
    const converted: JsonFile = {
      scripts: [],
      templates: []
    }

    for (const script of this.scripts) {
      converted.scripts.push({
        fields: script.fields,
        templateId: script.template?.name,
        mappings: script.mappings
      })
    }

    for (const template of this.templates) {
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

  async save (): Promise<void> {
    if (!this.fsPath) {
      return this.saveAs()
    }

    const json = this.toJson()
    return window.bridgeApi.fileIo.save({
      path: this.fsPath,
      encoding: 'utf8',
      data: json
    })
  }

  async saveAs (): Promise<void> {
    const json = this.toJson()

    const { path } = await window.bridgeApi.fileIo.saveAs({
      encoding: 'utf8',
      data: json,
      defaultPath: 'Project.rrw',
      fileTypes: [{
        name: 'RRW Project File',
        extensions: ['rrw']
      }]
    })

    this.fsPath = path
  }
}
