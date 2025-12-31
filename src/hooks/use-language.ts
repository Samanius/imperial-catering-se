import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  const toggleLanguage = () => {
    setLanguage((current) => {
      const newLang = current === 'en' ? 'ru' : 'en'
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
  }
  
  return { language: language || 'en', setLanguage: changeLanguage, toggleLanguage }
}
