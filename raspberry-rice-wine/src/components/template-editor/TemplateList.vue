<template>
  <ul class="w-full">
    <li
      v-for="(template, i) in templates"
      :key="i"
      class="select-none w-full px-2 text-gray-200 hover:bg-gray-500"
      :class="{'bg-gray-500': template === selectedTemplate}"
      @click="selectTemplate(template)">
      {{ template.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { Mutations, State } from '@/store'
import { Template } from '@/common/template'

export default defineComponent({
  setup () {
    const store = useStore<State>()

    const templates = computed(() => store.state.currentFile.templates)
    const selectedTemplate = computed(() => store.state.currentFile.selectedTemplate)
    const selectTemplate = (target: Template) => { store.commit(Mutations.SelectTemplate, { target }) }

    return { templates, selectedTemplate, selectTemplate }
  }
})
</script>
