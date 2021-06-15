import { Component } from '../template'
import Default from './editorComponents/Default.vue'

export const SizingComponent: Component<{
  width: number;
  height: number;
}> = {
  editorComponent: Default('sizing'),
  transformer (props) {
    return {
      width: props.width + 'px',
      height: props.height + 'px'
    }
  },
  defaultProps: () => ({
    width: 100,
    height: 100
  })
}
