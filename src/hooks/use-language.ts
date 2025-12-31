import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'
import { clearTranslationCache } from '@/lib/i18n'

export function useLanguage() {
  const [language, setStoredLanguage] = useKV<Language>('app-language', 'en')
  
  const toggleLanguage = () => {
    setStoredLanguage((current) => {
      const newLang = (current === 'en' ? 'ru' : 'en') as Language
      clearTranslationCache()
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    clearTranslationCache()
    setStoredLanguage(newLang)
  }
  
  return { language: language || 'en', setLanguage: changeLanguage, toggleLanguage }
}
