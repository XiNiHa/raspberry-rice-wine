import Color from 'color'

export type PropertyType = string | Color

export interface Property {
  value: PropertyType;
  update: (newValue: PropertyType) => boolean;
}

export interface Props {
  [name: string]: Property;
}

export interface Layer<T extends Props> {
  name: string;
  getHtml: (props: T) => string;
  getCss: (props: T) => string;
}

export interface Template {
  name: string;
  layers: Layer<Props>[];
}
