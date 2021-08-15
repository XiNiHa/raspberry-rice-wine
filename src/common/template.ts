import type { Component as VueComponent } from 'vue'
import type Color from 'color'
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

export type Layer = ({
  type: LayerType.Layer | LayerType.Text;
} | {
  type: LayerType.Image;
  imageSrc?: string;
  base64Url?: string;
}) & {
  name: string;
  children?: Layer[];
  props?: Partial<ComponentProps>;
  plainStyles?: Record<string, string>;
}

export interface Template {
  name: string;
  layers: Layer[];
  width: number;
  height: number;
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
