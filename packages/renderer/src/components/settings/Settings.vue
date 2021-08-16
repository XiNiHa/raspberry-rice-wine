<template>
  <div class="flex bg-gray-800 h-full items-center">
    <ul class="flex flex-col justify-center bg-gray-600 pl-4 py-4 text-white w-60 h-4/5 shadow-lg z-10">
      <RouterLink v-slot="{ isActive }" to="/settings/hotkey">
        <li class="w-full px-2 py-0.5 select-none hover:bg-gray-500" :class="{'bg-gray-500': isActive}">
          {{ t('settings.hotkey') }}
        </li>
      </RouterLink>
    </ul>
    <main class="flex-grow h-4/5 bg-gray-600 shadow-lg p-8 lg:p-16">
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup () {
    const { t } = useI18n()

    return { t }
  }
})
</script>
