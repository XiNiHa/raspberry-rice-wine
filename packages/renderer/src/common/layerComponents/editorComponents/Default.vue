<script lang="tsx">
import { defineComponent } from 'vue'
import type { PropType as VuePropType } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Color from 'color'
import type { State } from '@/store'
import { LayerType } from '@/common/template'
import type { Component, ComponentProp, PropType } from '@/common/template'

function getComponent<T extends ComponentProp<T>> (componentName: string): Component<T>['editorComponent'] {
  return defineComponent({
    props: {
      modelValue: {
        type: Object as VuePropType<Record<string, PropType>>,
        default: null
      },
      // eslint-disable-next-line vue/prop-name-casing
      'onUpdate:modelValue': {
        type: Function as VuePropType<(v: Record<string, PropType>) => void>,
        default: null
      }
    },
    emits: ['update:modelValue'],
    setup (props, { emit }) {
      const store = useStore<State>()
      const { t } = useI18n()

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

        return (
          <ul>
            {
              props.modelValue && Object.entries(props.modelValue).map(([key, value]) => {
                return inputRow(
                  t(`layerComponents.${componentName}.props.${key}.title`),
                  value,
                  newValue => {
                    emit('update:modelValue', {
                      ...props.modelValue,
                      [key]: newValue
                    })
                  })
              })
            }
          </ul>
        )
      }
    }
  })
}

export default getComponent
</script>
