<template>
  <div class="w-full h-full overflow-hidden relative">
    <Renderer
      v-if="anchor"
      :root="anchor.template"
      :textbox-mappings="mappings" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { State } from '../../store'
import Renderer from '../base/Renderer.vue'

export default defineComponent({
  components: { Renderer },
  setup () {
    const store = useStore<State>()

    const anchor = computed(() => store.state.currentFile.selectedScript.anchor)
    const mappings = computed(() => anchor.value &&
        Object.fromEntries(
          Object.entries(anchor.value.mappings)
            .map(([fieldName, boxName]) =>
              [boxName, anchor.value?.fields.find(field => field.name === fieldName)?.value])
        ))

    return { store, anchor, mappings }
  }
})
</script>
