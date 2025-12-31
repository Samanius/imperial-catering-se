import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  const toggleLanguage = () => {
    setLanguage((current) => {
      const newLang = (current || 'en') === 'en' ? 'ru' : 'en'
      return newLang
    })
  }
  
  const currentLanguage: Language = language || 'en'
  
  return { language: currentLanguage, setLanguage, toggleLanguage }
}
