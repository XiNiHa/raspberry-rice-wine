import Color from 'color'
import { Component } from '../template'
import Default from './editorComponents/Default.vue'

export const BackgroundComponent: Component<{ color: Color }> = {
  editorComponent: Default('background'),
  transformer (props) {
    return {
      backgroundColor: props.color.string()
    }
  },
  defaultProps: () => ({ color: Color.rgb(255, 255, 255).alpha(1) })
}
