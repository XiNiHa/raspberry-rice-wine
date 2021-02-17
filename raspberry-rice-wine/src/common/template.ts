import Color from 'color'

export type PropType = string | number | Color

export interface Layer {
  name: string;
  isTextbox: boolean;
  children?: Layer[];
  props?: Record<string, Record<string, PropType>>;
  plainStyles?: Record<string, string>;
}

export interface Template {
  name: string;
  layers: Layer[];
}

export const LayerComponents: Record<string, (props: any) => Record<string, string>> = {
  background (props: {
    color: Color;
  }) {
    return {
      backgroundColor: props.color.string()
    }
  }
}
