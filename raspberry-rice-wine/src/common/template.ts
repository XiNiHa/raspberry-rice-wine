import Color from 'color'

export type PropType = string | number | boolean | Color

export type ComponentProp<T> = {
  [K in keyof T]: PropType;
}

export interface Component<T extends ComponentProp<T>> {
  transformer: (props: T) => Record<keyof CSSStyleDeclaration, string>;
  defaultProps: () => T;
}

export const LayerComponents = {
  background: {
    transformer (props) {
      return {
        backgroundColor: props.color.string()
      }
    },
    defaultProps: () => ({ color: Color.rgb(255, 255, 255).alpha(1) })
  } as Component<{ color: Color }>,
  flex: {
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
  } as Component<{
    direction: string;
    alignItems: string;
    justifyContent: string;
  }>,
  spacing: {
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
  } as Component<{
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
  }>
}

export type ComponentProps = {
  [K in keyof typeof LayerComponents]: Parameters<typeof LayerComponents[K]['transformer']>[0]
}

export type ComponentName = keyof ComponentProps
export type ComponentPropType<T extends ComponentName> = ComponentProps[T]
export type ComponentPropKey<T extends ComponentName> = keyof ComponentPropType<T>
export type ComponentPropValue<P extends ComponentName, T extends ComponentPropKey<P>> = ComponentPropType<P>[T]

export interface Layer {
  name: string;
  isTextbox: boolean;
  children?: Layer[];
  props?: Partial<ComponentProps>;
  plainStyles?: Record<string, string>;
}

export interface Template {
  name: string;
  layers: Layer[];
  width: number;
  height: number;
}

export function getTextboxes (layers: Layer[]): Layer[] {
  const result = []

  for (const layer of layers) {
    if (layer.isTextbox) {
      result.push(layer)
    }

    if (layer.children && layer.children.length > 0) {
      getTextboxes(layer.children).forEach(layer => result.push(layer))
    }
  }

  return result
}
