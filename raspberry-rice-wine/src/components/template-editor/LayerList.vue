<script lang="tsx">
import { Layer } from '@/common/template'
import { defineComponent, PropType, reactive } from 'vue'

export default defineComponent({
  props: {
    layers: {
      type: Array as PropType<Layer[]>,
      default: () => []
    },
    selectedLayer: {
      type: Object as PropType<Layer>,
      default: () => null
    }
  },
  emits: ['select'],
  setup (props, { emit }) {
    const state = reactive({
      openedLayers: [] as Layer[]
    })

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
            <div class={'flex select-none w-full pr-2 hover:bg-gray-500 ' + (props.selectedLayer === layer ? 'bg-gray-500' : undefined)} onClick={() => emit('select', layer)}>
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
        { props.layers.map((layer) => getLayerItem(layer, props.layers)) }
      </ol>
    }
  }
})
</script>
