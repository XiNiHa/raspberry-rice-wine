<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'
import { Layer, LayerComponents } from '@/common/template'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const layer = computed(() => store.state.currentFile.selectedLayer)

    return () => {
      const renderLayer = (layer: Layer) => {
        const styleObj: Record<string, string> = {}

        if (layer.props) {
          for (const [componentName, props] of Object.entries(layer.props)) {
            const result = LayerComponents[componentName](props)
            if (result) {
              for (const [key, value] of Object.entries(result)) {
                styleObj[key] = value
              }
            }
          }
        }

        if (layer.plainStyles) {
          for (const [key, value] of Object.entries(layer.plainStyles)) {
            styleObj[key] = value
          }
        }

        return <div style={styleObj}>
          { layer.isTextbox && <span class="inline-block max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
            {t('layerPreview.textboxPlaceholder')}
          </span> }
          { layer.children?.map(renderLayer) }
        </div>
      }

      return <div class="w-full h-full flex justify-center items-center">
        { layer.value ? renderLayer(layer.value) : <span class="select-none text-gray-300">{t('layerPreview.noLayerSelected')}</span> }
      </div>
    }
  }
})
</script>
