export type FieldValue = number | string | Array<Field>

export interface Field {
  name: string;

  get: () => FieldValue;
  update: (newValue: FieldValue) => void;
}

export interface Script {
  fields: Field[];
}

export interface ScriptSet {
  scripts: Script[];

  new: () => Script;
}
