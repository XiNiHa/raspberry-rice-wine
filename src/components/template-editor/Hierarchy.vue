<script lang="tsx">
import { computed, defineComponent, reactive } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { Mutations, State } from '@/store'
import { Layer, LayerType, Template } from '@/common/template'

export default defineComponent({
  setup () {
    const store = useStore<State>()
    const { t } = useI18n()

    const state = reactive({
      openedItems: [] as (Template | Layer)[],
      drag: null as Layer | null,
      dragParent: null as Layer[] | null
    })

    const templates = computed(() => store.state.currentFile.templates)
    const selectedLayer = computed(() => store.state.currentFile.selectedLayer)
    const selectedTemplate = computed(() => selectedLayer.value ? null : store.state.currentFile.selectedTemplate)

    const selectTemplate = (target: Template) => { store.commit(Mutations.SelectTemplate, { target }) }
    const selectLayer = (target: Layer) => { store.commit(Mutations.SelectLayer, { target }) }

    const toggleOpen = (layer: Template | Layer) => {
      const index = state.openedItems.indexOf(layer)

      if (index === -1) {
        state.openedItems.push(layer)
      } else {
        state.openedItems.splice(index, 1)
      }
    }

    const add = () => {
      const newLayer = () => ({
        name: t('hierarchy.newLayer'),
        type: LayerType.Layer as const,
        children: [],
        props: {},
        plainStyles: {}
      })

      if (selectedLayer.value) {
        if (!selectedLayer.value.children) {
          selectedLayer.value.children = []
        }
        selectedLayer.value.children.push(newLayer())
        if (!state.openedItems.includes(selectedLayer.value)) {
          state.openedItems.push(selectedLayer.value)
        }
      } else if (selectedTemplate.value) {
        selectedTemplate.value.layers.push(newLayer())
        if (!state.openedItems.includes(selectedTemplate.value)) {
          state.openedItems.push(selectedTemplate.value)
        }
      } else {
        store.state.currentFile.templates.push({
          name: t('hierarchy.newTemplate'),
          layers: [],
          width: 1920,
          height: 1080
        })
      }
    }

    const clearSelection = () => {
      store.state.currentFile.selectedTemplate = null
      store.state.currentFile.selectedLayer = null
    }

    return () => {
      const getToggleButton = (target: Template | Layer) => state.openedItems.includes(target)
        ? <button class="w-6 focus:outline-none" onClick={() => toggleOpen(target)} key="down">
            <i class="fas fa-caret-down" />
          </button>
        : <button class="w-6 focus:outline-none" onClick={() => toggleOpen(target)} key="right">
            <i class="fas fa-caret-right" />
          </button>

      const getLayerItem = (layer: Layer, parentArr: Layer[], indent = 0) => {
        return (
          <li>
            <div
              draggable
              class={'flex select-none w-full pr-2 hover:bg-gray-500 ' + (selectedLayer.value === layer ? 'bg-gray-500' : undefined)}
              onClick={() => selectLayer(layer)}
              onDragstart={e => {
                e.stopPropagation()
                state.drag = layer
                state.dragParent = parentArr
              }}
              onDragover={e => e.preventDefault()}
              onDrop={e => {
                e.stopPropagation()
                if (state.dragParent && state.drag) {
                  const oldIndex = state.dragParent.indexOf(state.drag)
                  if (oldIndex !== -1) {
                    state.dragParent.splice(oldIndex, 1)

                    if (!layer.children) { layer.children = [] }
                    layer.children.push(state.drag)
                    if (!state.openedItems.includes(layer)) {
                      state.openedItems.push(layer)
                    }

                    state.drag = null
                    state.dragParent = null
                  }
                }
              }}>
              <div style={{ width: `${18 * indent}px` }} />
              {
                layer.children?.length
                  ? getToggleButton(layer)
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
              (layer.children?.length && state.openedItems.includes(layer) && (
                <ol class="w-full">
                  { layer.children.map((child, _, array) => getLayerItem(child, array, indent + 1)) }
                </ol>
              )) || undefined
            }
          </li>
        )
      }

      const getTemplateItem = (template: Template) => {
        return (
          <li>
            <div
              class={'flex select-none w-full pr-2 hover:bg-gray-500 ' + (selectedTemplate.value === template ? 'bg-gray-500' : undefined)}
              onClick={() => selectTemplate(template)}
              onDragover={e => e.preventDefault()}
              onDrop={e => {
                e.stopPropagation()
                if (state.dragParent && state.drag) {
                  const oldIndex = state.dragParent.indexOf(state.drag)
                  if (oldIndex !== -1) {
                    state.dragParent.splice(oldIndex, 1)
                    template.layers.push(state.drag)
                    if (!state.openedItems.includes(template)) {
                      state.openedItems.push(template)
                    }

                    state.drag = null
                    state.dragParent = null
                  }
                }
              }}>
              {
                template.layers?.length
                  ? getToggleButton(template)
                  : <div class="w-6" />
              }
              <span class="text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis flex-grow">
                { template.name }
              </span>
              <button class="float-right px-1 focus:outline-none" onClick={(e) => {
                e.stopPropagation()
                const index = templates.value?.indexOf(template)
                if (index !== -1) {
                  templates.value?.splice(index, 1)
                }
              }}>
                <i class="fas fa-times" />
              </button>
            </div>
            {
              (state.openedItems.includes(template) && (
                <ol class="w-full">
                  { template.layers.map(layer => getLayerItem(layer, template.layers, 1)) }
                </ol>
              )) || undefined
            }
          </li>
        )
      }

      return <ol class="w-full h-full flex flex-col">
        {
          templates.value.map(getTemplateItem)
        }
        <li class="text-center text-white select-none w-full hover:bg-gray-500" onClick={add}>
          <i class="fas fa-plus" />
        </li>
        <div class="w-full flex-grow" onClick={clearSelection} />
      </ol>
    }
  }
})
</script>
