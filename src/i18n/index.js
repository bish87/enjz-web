import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'

function applyDocumentLanguage(language) {
  const resolved = language?.startsWith('ar') ? 'ar' : 'en'
  document.documentElement.lang = resolved
  document.documentElement.dir = resolved === 'ar' ? 'rtl' : 'ltr'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'enjz.language',
    },
  })

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language)
i18n.on('languageChanged', applyDocumentLanguage)

export default i18n
