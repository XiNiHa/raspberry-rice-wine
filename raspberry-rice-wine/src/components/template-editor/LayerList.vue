<script lang="tsx">
import { computed, defineComponent, reactive } from 'vue'
import { useStore } from 'vuex'
import { Mutations, State } from '@/store'
import { Layer } from '@/common/template'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup () {
    const store = useStore<State>()
    const { t } = useI18n()

    const state = reactive({
      openedLayers: [] as Layer[]
    })

    const layers = computed(() => store.state.currentFile.selectedTemplate?.layers)
    const selectedLayer = computed(() => store.state.currentFile.selectedLayer)

    const selectLayer = (target: Layer) => { store.commit(Mutations.SelectLayer, { target }) }

    const toggleOpen = (layer: Layer) => {
      const index = state.openedLayers.indexOf(layer)

      if (index === -1) {
        state.openedLayers.push(layer)
      } else {
        state.openedLayers.splice(index, 1)
      }
    }

    return () => {
      const getLayerItem = (layer: Layer, parentArr: Layer[], indent = 0) => {
        return (
          <li>
            <div class={'flex select-none w-full pr-2 hover:bg-gray-500 ' + (selectedLayer.value === layer ? 'bg-gray-500' : undefined)} onClick={() => selectLayer(layer)}>
              <div style={{ width: `${24 * indent}px` }} />
              {
                layer.children?.length
                  ? state.openedLayers.includes(layer)
                    ? <button class="w-6 focus:outline-none" onClick={() => toggleOpen(layer)} key="down">
                      <i class="fas fa-caret-down" />
                    </button>
                    : <button class="w-6 focus:outline-none" onClick={() => toggleOpen(layer)} key="right">
                      <i class="fas fa-caret-right" />
                    </button>
                  : <div class="w-6" />
              }
              <span class="text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis flex-grow">
                { layer.name }
              </span>
              <button class="float-right px-1 focus:outline-none" onClick={(e) => {
                e.stopPropagation()
                const index = parentArr.indexOf(layer)
                if (index !== -1) {
                  parentArr.splice(index, 1)
                }
              }}>
                <i class="fas fa-times" />
              </button>
            </div>
            {
              (layer.children?.length && state.openedLayers.includes(layer) && (
                <ol class="w-full">
                  { layer.children.map((child, _, array) => getLayerItem(child, array, indent + 1)) }
                </ol>
              )) || undefined
            }
          </li>
        )
      }

      return <ol class="w-full">
        { layers.value?.map((layer) => layers.value && getLayerItem(layer, layers.value)) }
        <li class="text-center text-white select-none w-full hover:bg-gray-500" onClick={() => {
          layers.value?.push({
            name: t('layerList.newLayer'),
            isTextbox: false,
            children: [],
            props: {},
            plainStyles: {}
          })
        }}>
          <i class="fas fa-plus" />
        </li>
      </ol>
    }
  }
})
</script>
