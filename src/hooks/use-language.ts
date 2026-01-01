import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'
import type { Language } from '@/lib/i18n'
import { clearTranslationCache, setCustomTranslationsCache } from '@/lib/i18n'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

export function useLanguage() {
  const [language, setStoredLanguage] = useKV<Language>('app-language', 'en')
  const [customTranslations] = useKV<{ en: TranslationObject; ru: TranslationObject }>('custom-translations', {
    en: {},
    ru: {}
  })
  
  useEffect(() => {
    if (customTranslations) {
      clearTranslationCache()
      setCustomTranslationsCache(customTranslations)
    }
  }, [customTranslations])
  
  const toggleLanguage = () => {
    setStoredLanguage((current) => {
      const newLang = (current === 'en' ? 'ru' : 'en') as Language
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    setStoredLanguage(newLang)
  }
  
  return { language: language || 'en', setLanguage: changeLanguage, toggleLanguage }
}
