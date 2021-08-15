<template>
  <div v-if="!store.state.currentFile.selectedScript" />
  <div v-else class="w-full flex flex-col my-2">
    <div class="flex items-center my-2">
      <span class="text-white mx-2">{{ t('scriptMapper.template') }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="state.currentTemplateName ?? undefined" @change="selectTemplate">
        <option v-for="template in templates" :key="template.name" :value="template.name">
          {{ template.name }}
        </option>
      </select>
    </div>
    <div v-for="(value, key) in state.overlapMappings" :key="key" class="flex items-center my-2">
      <span class="text-white mx-2">{{ key }}</span>
      <select class="flex-grow mx-2 rounded-md px-1 py-2" :value="value ?? undefined" @change="setMapping(key, $event)">
        <option v-for="textbox in textboxes" :key="textbox.name" :value="textbox.name">
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
import { getSelectedScripts } from '@/store'
import type { State } from '@/store'
import { getTextboxes } from '@/common/template'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const state = reactive({
      currentTemplateName: null as string | null,
      overlapMappings: {} as Record<string, string | null>
    })

    const templates = computed(() => store.state.currentFile.templates)
    const selectedScripts = computed(() => getSelectedScripts(store.state))
    const textboxes = computed(() => getTextboxes(templates.value.find(template => template.name === state.currentTemplateName)?.layers ?? []))

    watch(() => selectedScripts.value, (v) => {
      let newName: string | null = null
      for (let i = 0; i < v.length; i++) {
        if (i === 0) {
          newName = v[i].template?.name ?? null
        } else if (newName !== v[i].template?.name) {
          newName = null
          break
        }
      }

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

      state.currentTemplateName = newName
      state.overlapMappings = newOverlapMappings
    }, { immediate: true, deep: true })

    const selectTemplate = (event: Event) => {
      state.currentTemplateName = (event.target as HTMLSelectElement).value

      for (const template of templates.value) {
        if (template.name === state.currentTemplateName) {
          selectedScripts.value.forEach(script => { script.template = template })
          break
        }
      }
    }

    const setMapping = (fieldName: string, event: Event) => {
      const mapping = (event.target as HTMLSelectElement).value || null
      state.overlapMappings[fieldName] = mapping

      if (mapping) {
        selectedScripts.value.forEach(script => {
          script.mappings[fieldName] = mapping
        })
      }
    }

    return { t, store, state, templates, textboxes, selectTemplate, setMapping }
  }
})
</script>
