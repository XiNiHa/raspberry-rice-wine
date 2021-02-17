import { Script } from './script'
import { Template } from './template'

export interface File {
  scripts: Script[];
  templates: Template[];
}
