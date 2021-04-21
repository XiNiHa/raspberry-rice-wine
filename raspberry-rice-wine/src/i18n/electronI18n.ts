import { app } from 'electron'
import i18next from 'i18next'
import en from './en.json'
import ko from './ko.json'

let initPromise: ReturnType<typeof i18next.init>

export default function (): typeof initPromise {
  if (!initPromise) {
    initPromise = i18next.init({
      lng: app.getLocale(),
      resources: {
        en: {
          translation: en
        },
        ko: {
          translation: ko
        }
      }
    })
  }
  return initPromise
}
