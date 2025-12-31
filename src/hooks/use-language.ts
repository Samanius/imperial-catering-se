import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  const toggleLanguage = () => {
    setLanguage((current) => current === 'en' ? 'ru' : 'en')
  }
  
  return { language: language || 'en', setLanguage, toggleLanguage }
}
