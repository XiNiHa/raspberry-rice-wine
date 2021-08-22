<script lang="tsx">
import { computed, defineComponent, reactive } from 'vue'
import { useStore } from 'vuex'
import { Mutations } from '@/store'
import type { State } from '@/store'
import type { Template, Layer } from '@/common/template'

export default defineComponent({
  setup () {
    const store = useStore<State>()

    const state = reactive({
      openedItems: [] as string[],
      dragId: null as string | null,
      dragParentId: null as string | null
    })

    const templates = computed(() => store.state.currentFile.templates)
    const selectedLayer = computed(() => store.state.currentFile.selectedLayer)
    const selectedTemplate = computed(() => selectedLayer.value ? null : store.state.currentFile.selectedTemplate)

    const selectTemplate = (target: Template) => store.commit(Mutations.SelectTemplate, { target })
    const selectLayer = (target: Layer) => store.commit(Mutations.SelectLayer, { target })

    const toggleOpen = (item: Template | Layer) => {
      const index = state.openedItems.indexOf(item.id)

      if (index === -1) {
        state.openedItems.push(item.id)
      } else {
        state.openedItems.splice(index, 1)
      }
    }

    const add = () => {
      const parent = selectedLayer.value ?? selectedTemplate.value

      if (parent) {
        store.commit(Mutations.NewLayer, { parentId: parent.id })
        if (!state.openedItems.includes(parent.id)) {
          state.openedItems.push(parent.id)
        }
      } else {
        store.commit(Mutations.NewTemplate)
      }
    }

    const clearSelection = () => store.commit(Mutations.ClearHierarchySelectons)

    return () => {
      const getToggleButton = (target: Template | Layer) => state.openedItems.includes(target.id)
        ? <button class="w-6 focus:outline-none" onClick={() => toggleOpen(target)} key="down">
            <i class="fas fa-caret-down" />
          </button>
        : <button class="w-6 focus:outline-none" onClick={() => toggleOpen(target)} key="right">
            <i class="fas fa-caret-right" />
          </button>

      const getLayerItem = (layer: Layer, parentId: string, indent = 0) => {
        return (
          <li>
            <div
              draggable
              class={'flex select-none w-full pr-2 hover:bg-gray-500 ' + (selectedLayer.value === layer ? 'bg-gray-500' : undefined)}
              onClick={() => selectLayer(layer)}
              onDragstart={e => {
                e.stopPropagation()
                state.dragId = layer.id
                state.dragParentId = parentId
              }}
              onDragover={e => e.preventDefault()}
              onDrop={e => {
                e.stopPropagation()
                if (state.dragParentId && state.dragId) {
                  store.commit(Mutations.MoveLayer, {
                    originParentId: state.dragParentId,
                    targetParentId: parentId,
                    layerId: state.dragId
                  })

                  if (!state.openedItems.includes(layer.id)) {
                    state.openedItems.push(layer.id)
                  }

                  state.dragId = null
                  state.dragParentId = null
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
                store.commit(Mutations.RemoveLayer, { parentId, layerId: layer.id })

                const index = state.openedItems.indexOf(layer.id)
                if (index !== -1) {
                  state.openedItems.splice(index, 1)
                }
              }}>
                <i class="fas fa-times" />
              </button>
            </div>
            {
              (layer.children?.length && state.openedItems.includes(layer.id) && (
                <ol class="w-full">
                  { layer.children.map(child => getLayerItem(child, layer.id, indent + 1)) }
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
                if (state.dragParentId && state.dragId) {
                  store.commit(Mutations.MoveLayer, {
                    originParentId: state.dragParentId,
                    targetParentId: template.id,
                    layerId: state.dragId
                  })

                  if (!state.openedItems.includes(template.id)) {
                    state.openedItems.push(template.id)
                  }

                  state.dragId = null
                  state.dragParentId = null
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
              <button
                class="float-right px-1 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()

                  const templateId = template.id

                  store.commit(Mutations.RemoveTemplate, { templateId })

                  const index = state.openedItems.indexOf(templateId)
                  if (index !== -1) {
                    state.openedItems.splice(index, 1)
                  }
                }}>
                <i class="fas fa-times" />
              </button>
            </div>
            {
              (state.openedItems.includes(template.id) && (
                <ol class="w-full">
                  { template.layers.map(layer => getLayerItem(layer, template.id, 1)) }
                </ol>
              )) || undefined
            }
          </li>
        )
      }

      return <ol class="w-full h-full flex flex-col">
        {templates.value.map(getTemplateItem)}
        <li class="text-center text-white select-none w-full hover:bg-gray-500" onClick={add}>
          <i class="fas fa-plus" />
        </li>
        <div class="w-full flex-grow" onClick={clearSelection} />
      </ol>
    }
  }
})
</script>
