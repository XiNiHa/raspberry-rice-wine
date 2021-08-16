import { createI18n } from 'vue-i18n'
import en from '@/../../i18n/en.json'
import ko from '@/../../i18n/ko.json'

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: { en, ko }
})
