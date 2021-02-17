<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const layer = computed(() => store.state.currentFile.selectedLayer)

    return () => {
      if (!layer.value) return <div />

      return <ul class="flex flex-col text-gray-200 py-2">
        <li class="flex justify-between px-2">
          <h1 class="text-lg">{t('layerEditor.layerName')}</h1>
          <input value={layer.value.name} />
        </li>
      </ul>
    }
  }
})
</script>
