<template>
  <div v-if="!store.state.currentFile.selectedScript" />
  <div v-else class="w-full flex flex-col my-2">
    <div class="flex items-center my-2">
      <span class="text-white mx-2">{{ t('scriptMapper.template') }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="state.currentTemplateId ?? undefined" @change="selectTemplate">
        <option v-for="template in templates" :key="template.id" :value="template.id">
          {{ template.name }}
        </option>
      </select>
    </div>
    <div v-for="(value, key) in state.overlapMappings" :key="key" class="flex items-center my-2">
      <span class="text-white mx-2">{{ key }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="value ?? undefined" @change="setMapping(key, $event)">
        <option v-for="textbox in textboxes" :key="textbox.id" :value="textbox.id">
          {{ textbox.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { getSelectedScripts, Mutations } from '@/store'
import type { State } from '@/store'
import { getTextboxes } from '@/common/template'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const state = reactive({
      currentTemplateId: null as string | null,
      overlapMappings: {} as Record<string, string | null>
    })

    const templates = computed(() => store.state.currentFile.templates)
    const selectedScripts = computed(() => getSelectedScripts(store.state))
    const textboxes = computed(() => getTextboxes(
      templates.value.find(template => template.id === state.currentTemplateId)?.layers ?? []
    ))

    watch(() => selectedScripts.value, (v) => {
      const newOverlapMappings: Record<string, string | null> = {}
      for (let i = 0; i < v.length; i++) {
        if (i === 0) {
          v[i].fields.forEach(field => {
            newOverlapMappings[field.name] = v[i].mappings[field.name]
          })
        } else {
          Object.entries(newOverlapMappings).forEach(([key, value]) => {
            const field = v[i].fields.find(field => field.name === key)

            if (!field) {
              delete newOverlapMappings[key]
            } else if (v[i].mappings[field.name] !== value) {
              newOverlapMappings[key] = null
            }
          })
        }
      }

      state.overlapMappings = newOverlapMappings
    }, { immediate: true, deep: true })

    const selectTemplate = (event: Event) => {
      state.currentTemplateId = (event.target as HTMLSelectElement).value
      const template = templates.value.find(t => t.id === state.currentTemplateId)

      if (template) {
        store.commit(Mutations.MapTemplate, { template })
      }
    }

    const setMapping = (fieldName: string, event: Event) => {
      const textboxName = (event.target as HTMLSelectElement).value || null
      state.overlapMappings[fieldName] = textboxName

      if (textboxName) {
        store.commit(Mutations.MapTextbox, { fieldName, textboxName })
      }
    }

    return { t, store, state, templates, textboxes, selectTemplate, setMapping }
  }
})
</script>
