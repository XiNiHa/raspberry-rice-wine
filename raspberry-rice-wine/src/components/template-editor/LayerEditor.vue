<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'
import { PropType } from '@/common/template'
import Color from 'color'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const layer = computed(() => store.state.currentFile.selectedLayer)

    return () => {
      if (!layer.value) return <div />

      const row = (name: string, value: PropType, onInput: (value: PropType) => void) => {
        let inputElement

        if (typeof value === 'string') {
          inputElement = <input class="ml-3 p-1 flex-grow rounded border border-gray-600" value={value} onInput={e => onInput((e.target as HTMLInputElement).value)} />
        } else if (typeof value === 'number') {
          inputElement = <input type="number" class="ml-3 p-1 flex-grow rounded border border-gray-600" value={value} onInput={e => onInput((e.target as HTMLInputElement).value)} />
        } else if (typeof value === 'object') {
          if (value instanceof Color) {
            let r = value.red()
            let g = value.green()
            let b = value.blue()
            let a = value.alpha()

            inputElement = <>
              <input type="number" class="ml-3 p-1 text-right rounded border border-gray-600 flex-grow min-w-0" value={r} min={0} max={255} onInput={e => {
                r = parseFloat((e.target as HTMLInputElement).value)
                onInput(Color.rgb(r, g, b).alpha(a))
              }} />
              <input type="number" class="ml-1 p-1 text-right rounded border border-gray-600 flex-grow min-w-0" value={g} min={0} max={255} onInput={e => {
                g = parseFloat((e.target as HTMLInputElement).value)
                onInput(Color.rgb(r, g, b).alpha(a))
              }} />
              <input type="number" class="ml-1 p-1 text-right rounded border border-gray-600 flex-grow min-w-0" value={b} min={0} max={255} onInput={e => {
                b = parseFloat((e.target as HTMLInputElement).value)
                onInput(Color.rgb(r, g, b).alpha(a))
              }} />
              <input type="number" class="ml-1 p-1 text-right rounded border border-gray-600 flex-grow min-w-0" value={a} min={0} max={1} step={0.1} onInput={e => {
                a = parseFloat((e.target as HTMLInputElement).value)
                onInput(Color.rgb(r, g, b).alpha(a))
              }} />
            </>
          }
        }

        return (
          <li class="w-full flex justify-between items-center px-2">
            <h1 class="text-lg text-gray-200 whitespace-nowrap">{name}</h1>
            {inputElement}
          </li>
        )
      }

      return <ul class="w-full flex flex-col py-2">
        {row(t('layerEditor.layerName'), layer.value.name, newValue => { if (layer.value) { layer.value.name = newValue as string } })}
        {
          layer.value.props && Object.entries(layer.value.props).map(([componentName, props]) => {
            return <>
              <h1 class="mt-6 mb-2 text-center text-xl text-gray-100">{t(`layerComponents.${componentName}.title`)}</h1>
              {
                Object.entries(props).map(([key, value]) =>
                  row(t(`layerComponents.${componentName}.${key}`), value, newValue => { props[key] = newValue }))
              }
            </>
          })
        }
      </ul>
    }
  }
})
</script>
