export interface Field {
  name: string;
  value: string;
}

export interface Script {
  fields: Field[];
}

export interface ScriptSet {
  scripts: Script[];
}
