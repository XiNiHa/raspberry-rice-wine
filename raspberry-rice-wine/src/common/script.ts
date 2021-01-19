export type FieldValue = number | string | Array<Field>

export interface Field {
  get: () => FieldValue;
  update: (newValue: FieldValue) => void;
}

export interface Script {
  fields: {
    [key: string]: Field;
  };
}

export interface ScriptSet {
  scripts: Script[];

  new: () => Script;
}
