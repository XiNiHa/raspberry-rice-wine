<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { ComponentName, Layer, LayerComponents, LayerType, Template } from '@/common/template'

export default defineComponent({
  props: {
    root: {
      type: Object as PropType<Template | Layer>,
      default: null
    },
    textboxMappings: {
      type: Object as PropType<Record<string, string>>,
      default: {}
    }
  },
  setup (props) {
    const { t } = useI18n()

    return () => {
      const renderLayer = (layer: Layer) => {
        const styleObj: Record<string, string> = {}

        if (layer.props) {
          for (const [componentName, props] of Object.entries(layer.props)) {
            const result = props && (LayerComponents[componentName as ComponentName].transformer as (props: unknown) => Record<keyof CSSStyleDeclaration, string>)(props)
            if (result) {
              for (const [key, value] of Object.entries(result)) {
                if (value) {
                  styleObj[key] = value.toString()
                }
              }
            }
          }
        }

        if (layer.plainStyles) {
          for (const [key, value] of Object.entries(layer.plainStyles)) {
            styleObj[key] = value
          }
        }

        switch (layer.type) {
          case LayerType.Layer:
            return (
              <div style={styleObj}>
                { layer.children?.map(renderLayer) }
              </div>
            )
          case LayerType.Text:
            return (
              <span style={styleObj} class="inline-block max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
                { props.textboxMappings[layer.name] ?? t('layerPreview.textboxPlaceholder')}
                { layer.children?.map(renderLayer) }
              </span>
            )
          case LayerType.Image:
            return (
              <img src={layer.base64Url} style={styleObj}>
                { layer.children?.map(renderLayer) }
              </img>
            )
        }
      }

      if (props.root) {
        if ('layers' in props.root) {
          return <>
            {props.root.layers.map(layer => {
              return <div style="position: absolute; left: 50%">
                <div style="position: relative; left: -50%">
                  {renderLayer(layer)}
                </div>
              </div>
            })}
          </>
        } else {
          return <>{renderLayer(props.root)}</>
        }
      } else {
        return <div />
      }
    }
  }
})
</script>
