import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'
import { useEffect } from 'react'

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  useEffect(() => {
    console.log('🌐 Current language:', language)
  }, [language])
  
  const toggleLanguage = () => {
    setLanguage((current) => {
      const newLang = current === 'en' ? 'ru' : 'en'
      console.log('🔄 Toggling language from', current, 'to', newLang)
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    console.log('🔄 Changing language to', newLang)
    setLanguage(newLang)
  }
  
  return { language: language || 'en', setLanguage: changeLanguage, toggleLanguage }
}
