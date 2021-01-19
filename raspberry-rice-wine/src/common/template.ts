import Color from 'color'

export type PropertyType = string | Color

export interface Property {
  value: PropertyType;
  update: (newValue: PropertyType) => boolean;
}

export interface Props {
  [name: string]: Property;
}

export interface Layer {
  name: string;
  getHtml: (props: Props) => string;
  getCss: (props: Props) => string;
}

export interface Template {
  name: string;
  layers: Layer[];
}
