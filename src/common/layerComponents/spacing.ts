import type { Component } from '../template'
import Default from './editorComponents/Default.vue'

export const SpacingComponent: Component<{
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}> = {
  editorComponent: Default('spacing'),
  transformer (props) {
    return {
      marginLeft: props.marginLeft + 'px',
      marginRight: props.marginRight + 'px',
      marginTop: props.marginTop + 'px',
      marginBottom: props.marginBottom + 'px',
      paddingLeft: props.paddingLeft + 'px',
      paddingRight: props.paddingRight + 'px',
      paddingTop: props.paddingTop + 'px',
      paddingBottom: props.paddingBottom + 'px'
    }
  },
  defaultProps: () => ({
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0
  })
}
