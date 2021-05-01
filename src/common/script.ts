import { Template } from './template'

export interface Field {
  name: string;
  value: string;
}

export interface Script {
  fields: Field[];
  template?: Template;
  mappings: Record<string, string>;
}
