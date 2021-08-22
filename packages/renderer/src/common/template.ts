import type { Component as VueComponent } from 'vue'
import type Color from 'color'
import vueI18n from '@/vueI18n'
import { BackgroundComponent } from './layerComponents/background'
import { FlexComponent } from './layerComponents/flex'
import { SizingComponent } from './layerComponents/sizing'
import { SpacingComponent } from './layerComponents/spacing'

export type PropType = string | number | boolean | Color

export type ComponentProp<T> = {
  [K in keyof T]: PropType;
}

export interface Component<T extends ComponentProp<T>> {
  editorComponent: VueComponent<{
    modelValue: T;
    'onUpdate:modelValue': (value: T) => void;
  }>,
  transformer: (props: T) => Partial<Record<keyof CSSStyleDeclaration, string>>;
  defaultProps: () => T;
}

export const LayerComponents = {
  background: BackgroundComponent,
  flex: FlexComponent,
  spacing: SpacingComponent,
  sizing: SizingComponent
}

export type ComponentProps = {
  [K in keyof typeof LayerComponents]: Parameters<typeof LayerComponents[K]['transformer']>[0]
}

export type ComponentName = keyof ComponentProps
export type ComponentPropType<T extends ComponentName> = ComponentProps[T]
export type ComponentPropKey<T extends ComponentName> = keyof ComponentPropType<T>
export type ComponentPropValue<P extends ComponentName, T extends ComponentPropKey<P>> = ComponentPropType<P>[T]

export enum LayerType {
  Layer,
  Text,
  Image
}

export class Layer {
  // eslint-disable-next-line no-useless-constructor
  constructor (
    public id = genUniqueId(),
    public name = vueI18n.global.t('hierarchy.newLayer'),
    public type: LayerType = LayerType.Layer,
    public children: Layer[] = [],
    public props: Partial<ComponentProps> = {},
    public plainStyles: Record<string, string> = {},
    public imageSrc?: string,
    public base64Url?: string
  ) {}
}

export class Template {
  private layerMap = new Map<string, Layer>()

  // eslint-disable-next-line no-useless-constructor
  constructor (
    public id: string,
    public name: string,
    public layers: Layer[] = [],
    public width: number,
    public height: number
  ) {
    const registerLayers = (layers: Layer[]) => {
      for (const layer of layers) {
        this.layerMap.set(layer.id, layer)
        registerLayers(layer.children)
      }
    }

    registerLayers(layers)
  }

  hasOrIs (id: string): boolean {
    return this.id === id || this.layerMap.has(id)
  }

  addChild (parentId: string, child: Layer): boolean {
    const parentArr = parentId === this.id
      ? this.layers
      : this.layerMap.get(parentId)?.children

    if (!parentArr) return false

    parentArr.push(child)
    this.layerMap.set(child.id, child)
    return true
  }

  removeChild (parentId: string, childId: string): Layer | null {
    const parentArr = parentId === this.id
      ? this.layers
      : this.layerMap.get(parentId)?.children

    if (!parentArr) return null

    for (let i = 0; i < parentArr.length; i++) {
      if (parentArr[i].id === childId) {
        const child = parentArr[i]
        parentArr.splice(i, 1)
        this.layerMap.delete(childId)
        return child
      }
    }

    return null
  }

  moveChild (originParentId: string, targetParentId: string, childId: string): boolean {
    const layer = this.removeChild(originParentId, childId)
    if (!layer) return false

    return this.addChild(targetParentId, layer)
  }

  getChild (id: string): Layer | null {
    return this.layerMap.get(id) ?? null
  }
}

export function genUniqueId (): string {
  const now = Date.now()
  const randomized = now * (Math.random() * 100)
  return btoa(randomized.toString())
}

export function getTextboxes (layers: Layer[]): Layer[] {
  const result = []

  for (const layer of layers) {
    if (layer.type === LayerType.Text) {
      result.push(layer)
    }

    if (layer.children && layer.children.length > 0) {
      getTextboxes(layer.children).forEach(layer => result.push(layer))
    }
  }

  return result
}
