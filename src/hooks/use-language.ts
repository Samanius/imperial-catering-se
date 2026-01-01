import { useApp } from '@/state/AppProvider'
import type { Language } from '@/lib/i18n'

export function useLanguage() {
  const { language, setLanguage } = useApp()
  
  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ru' : 'en'
    setLanguage(newLang)
  }
  
  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
  }
  
  return { language, setLanguage: changeLanguage, toggleLanguage }
}
