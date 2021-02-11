<script lang="tsx">
import { Layer } from '@/common/template'
import { defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    layer: {
      type: Object as PropType<Layer>,
      default: () => null
    }
  },
  setup (props) {
    const { t } = useI18n()

    return () => {
      const renderLayer = (layer: Layer) => {
        return <div style={{
          ...layer.styleGenerators?.reduce((acc, fn) => ({ ...acc, ...fn(layer.props ?? {}) }), {}),
          ...layer.plainStyles
        }}>
          { layer.isTextbox && <span class="inline-block max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
            {t('layerEditor.textboxPlaceholder')}
          </span> }
          { layer.children?.map(renderLayer) }
        </div>
      }

      return <div class="w-full h-full flex justify-center items-center">
        { props.layer ? renderLayer(props.layer) : <span class="select-none text-gray-300">{t('layerEditor.noLayerSelected')}</span> }
      </div>
    }
  }
})
</script>
