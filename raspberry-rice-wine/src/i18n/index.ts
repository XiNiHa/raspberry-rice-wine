import { createI18n } from 'vue-i18n'
import en from './en.json'
import ko from './ko.json'

export default createI18n({
  locale: navigator.language,
  messages: { en, ko }
})
