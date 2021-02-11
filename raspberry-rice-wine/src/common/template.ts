import Color from 'color'

export type PropType = string | number | Color

export interface Layer {
  name: string;
  isTextbox: boolean;
  children?: Layer[];
  props?: Record<string, PropType>;
  styleGenerators?: ((props: Record<string, PropType>) => Record<string, string>)[];
  plainStyles?: Record<string, string>;
}

export interface Template {
  name: string;
  layers: Layer[];
}
