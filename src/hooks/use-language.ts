import { useKV } from '@github/spark/hooks'
import type { Language } from '@/lib/i18n'
import { useEffect, useState } from 'react'

export function useLanguage() {
  const [storedLanguage, setStoredLanguage] = useKV<Language>('app-language', 'en')
  const [language, setLanguage] = useState<Language>(storedLanguage || 'en')
  
  useEffect(() => {
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [storedLanguage])
  
  const toggleLanguage = () => {
    setStoredLanguage((current) => {
      const newLang = current === 'en' ? 'ru' : 'en'
      setLanguage(newLang)
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    setStoredLanguage(newLang)
    setLanguage(newLang)
  }
  
  return { language, setLanguage: changeLanguage, toggleLanguage }
}
