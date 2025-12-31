import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'
import { clearTranslationCache } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  const toggleLanguage = () => {
    setLanguage((current) => {
      const newLang = current === 'en' ? 'ru' : 'en'
      clearTranslationCache()
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
    clearTranslationCache()
  }
  
  return { language: language || 'en', setLanguage: changeLanguage, toggleLanguage }
}
