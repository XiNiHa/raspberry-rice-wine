<script lang="tsx">
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Color from 'color'
import Mime from 'mime-types'
import MimeDb from 'mime-db'
import { State } from '@/store'
import { ComponentName, LayerComponents, LayerType, PropType } from '@/common/template'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const layer = computed(() => store.state.currentFile.selectedLayer)
    const template = computed(() => store.state.currentFile.selectedTemplate)

    const notInComps = computed(() => Object.keys(LayerComponents)
      .filter(name => !layer.value?.props || !Object.keys(layer.value.props).includes(name)) as ComponentName[])

    const compNameToAdd = ref<ComponentName | null>(notInComps.value[0])
    watch(() => notInComps.value, (v) => { compNameToAdd.value = v[0] })

    return () => {
      function row<T> (name: string, inputElement?: T) {
        return (
          <li class="w-full flex justify-between items-center px-2 py-1">
            <h1 class="text-lg text-gray-200 whitespace-nowrap">{name}</h1>
            {inputElement}
          </li>
        )
      }
      function inputRow<T extends PropType> (name: string, value: T, onInput: (value: T) => void, typeName?: string) {
        let inputElement

        if (typeName === 'LayerType') {
          inputElement = (
              <select class="mx-2 px-1 py-1.5 w-44 rounded" value={value as string} onChange={e => onInput(parseInt((e.target as HTMLSelectElement).value) as T)}>
                {Object.values(LayerType).filter(value => typeof value === 'number').map(value => <option value={value}>{t(`enumNames.layerType.${LayerType[value as LayerType]}`)}</option>)}
              </select>
          )
        } else if (typeof value === 'string') {
          inputElement = <input type="text" class="ml-3 px-2 py-1 flex-grow rounded border border-gray-600 min-w-min" value={value} onInput={e => onInput((e.target as HTMLInputElement).value as T)} />
        } else if (typeof value === 'number') {
          inputElement = <input type="number" class="ml-3 p-1 text-right flex-grow rounded border border-gray-600 min-w-min" value={value} onInput={e => onInput(parseFloat((e.target as HTMLInputElement).value) as T)} />
        } else if (typeof value === 'boolean') {
          inputElement = <input type="checkbox" checked={value} onChange={e => onInput((e.target as HTMLInputElement).checked as T)} />
        } else if (typeof value === 'object') {
          if (value instanceof Color) {
            inputElement = (
              <button
                class="flex-grow h-8 mx-2 rounded border-2 border-gray-600 focus:outline-none"
                style="background: linear-gradient(45deg, #ccc 25%, transparent 25%),linear-gradient(-45deg, #ccc 25%, transparent 25%),linear-gradient(45deg, transparent 75%, #ccc 75%),linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px;"
                onClick={() => {
                  store.state.colorPickerTarget = value
                  store.state.colorPickerCallback = onInput as (c: Color) => void
                  store.state.activeModal = 'colorPicker'
                }}>
                <div class="w-full h-full" style={{ backgroundColor: value.toString() }} />
              </button>
            )
          }
        }

        return row(name, inputElement)
      }

      if (layer.value) {
        return <ul class="w-full flex flex-col py-2">
        {inputRow(t('propEditor.layerName'), layer.value.name, newValue => { if (layer.value) { layer.value.name = newValue } })}
        {inputRow(t('propEditor.layerType'), layer.value.type, newValue => { if (layer.value) { layer.value.type = newValue } }, 'LayerType')}
        {(() => {
          const localLayer = layer.value
          switch (localLayer.type) {
            case LayerType.Image:
              return row(t('propEditor.imageSrc'), (
                <input
                  type="text"
                  class="ml-3 mx-2 py-1 flex-grow rounded border border-gray-600 min-w-min"
                  value={localLayer.imageSrc}
                  readonly
                  onClick={() => {
                    window.fileIo.open({
                      encoding: 'base64',
                      fileTypes: [{
                        name: 'Images',
                        extensions: Object.entries(MimeDb)
                          .filter(([k]) => k.match(/image\/.+/))
                          .map(([, v]) => v.extensions ?? [])
                          .flat()
                      }]
                    })
                      .then(({ path, data: base64 }) => {
                        const type = Mime.lookup(path)
                        localLayer.imageSrc = path
                        localLayer.base64Url = `data:${type};base64,${base64}`
                      })
                      .catch((err) => console.log(err))
                  }} />
              ))
          }
        })()}
        {
          layer.value.props && Object.entries(layer.value.props).map(([_componentName, props]) => {
            const componentName = _componentName as ComponentName
            const EditorComponent = LayerComponents[componentName].editorComponent

            return <>
              <h1 class="mt-6 mb-1 text-center text-xl text-gray-100">
                {t(`layerComponents.${componentName}.title`)}
                <button class="text-gray-900 ml-1 px-2 rounded-full hover:bg-gray-500 focus:outline-none" onClick={() => {
                  if (layer.value?.props) {
                    delete layer.value.props[componentName]
                  }
                }}>
                  <i class="fas fa-times" />
                </button>
              </h1>
              { /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
              { /* @ts-ignore */ }
              <EditorComponent modelValue={props} onUpdate:modelValue={(val) => {
                Object.entries(val).forEach(([k, v]) => {
                  (props as Record<string, PropType>)[k] = v as PropType
                })
              }} />
            </>
          })
        }
        <li class="mx-1 my-2 py-2 flex justify-center">
          <select class="mx-2 px-1 w-44 rounded" value={compNameToAdd.value ?? ''} onChange={e => { compNameToAdd.value = (e.target as HTMLInputElement).value as ComponentName }}>
            {
              notInComps.value.map(name => <option value={name}>{t(`layerComponents.${name}.title`)}</option>)
            }
          </select>
          <button class="px-2 py-1 rounded-lg hover:bg-gray-500 focus:outline-none" onClick={() => {
            if (layer.value && compNameToAdd.value) {
              if (!layer.value.props) { layer.value.props = {} }

              (layer.value.props[compNameToAdd.value] as Record<string, PropType>) = LayerComponents[compNameToAdd.value].defaultProps()
            }
          }}>
            <i class="fas fa-plus" />
          </button>
        </li>
      </ul>
      } else if (template.value) {
        return <ul class="w-full flex flex-col py-2">
          {inputRow(t('propEditor.templateName'), template.value.name, newValue => { if (template.value) { template.value.name = newValue } })}
          {inputRow(t('propEditor.templateWidth'), template.value.width, newValue => { if (template.value) { template.value.width = newValue } })}
          {inputRow(t('propEditor.templateHeight'), template.value.height, newValue => { if (template.value) { template.value.height = newValue } })}
        </ul>
      } else {
        return <div />
      }
    }
  }
})
</script>
