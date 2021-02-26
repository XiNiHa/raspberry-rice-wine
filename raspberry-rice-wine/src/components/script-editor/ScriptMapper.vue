<template>
  <div v-if="!store.state.currentFile.selectedScript" />
  <div v-else class="w-full flex flex-col my-2">
    <div class="flex items-center my-2">
      <span class="text-white mx-2">{{ t('scriptMapper.template') }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="currentTemplateName" @change="selectTemplate">
        <option v-for="template in templates" :key="template.name" :value="template.name">
          {{ template.name }}
        </option>
      </select>
    </div>
    <div v-for="field in fields" :key="field.name" class="flex items-center my-2">
      <span class="text-white mx-2">{{ field.name }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="getMappedTextbox(field.name)" @change="setMapping(field.name, $event)">
        <option v-for="textbox in textboxes" :key="textbox.name" :value="textbox.name">
          {{ textbox.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'
import { getTextboxes } from '@/common/template'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const templates = computed(() => store.state.currentFile.templates)
    const currentScript = computed(() => store.state.currentFile.selectedScript)
    const fields = computed(() => currentScript.value?.fields || [])
    const currentTemplateName = computed(() => currentScript.value?.template?.name)
    const textboxes = computed(() => getTextboxes(currentScript.value?.template?.layers ?? []))

    const selectTemplate = (event: Event) => {
      if (!currentScript.value) return

      for (const template of templates.value) {
        if (template.name === (event.target as HTMLSelectElement).value) {
          currentScript.value.template = template
          break
        }
      }
    }

    const getMappedTextbox = (fieldName: string) => currentScript.value?.mappings[fieldName]
    const setMapping = (fieldName: string, event: Event) => {
      if (!currentScript.value) return

      currentScript.value.mappings[fieldName] = (event.target as HTMLSelectElement).value
    }

    return { t, store, templates, currentScript, fields, currentTemplateName, textboxes, selectTemplate, getMappedTextbox, setMapping }
  }
})
</script>
