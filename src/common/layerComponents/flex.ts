import type { Component } from '../template'
import Default from './editorComponents/Default.vue'

export const FlexComponent: Component<{
  direction: string;
  alignItems: string;
  justifyContent: string;
}> = {
  editorComponent: Default('flex'),
  transformer (props) {
    return {
      display: 'flex',
      flexDirection: props.direction,
      alignItems: props.alignItems,
      justifyContent: props.justifyContent
    }
  },
  defaultProps: () => ({
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  })
}
