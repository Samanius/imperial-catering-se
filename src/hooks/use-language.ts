import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import type { Language } from '@/lib/i18n'
import { clearTranslationCache } from '@/lib/i18n'

export function useLanguage() {
  const [storedLanguage, setStoredLanguage] = useKV<Language>('app-language', 'en')
  const [language, setLanguageState] = useState<Language>('en')
  
  useEffect(() => {
    if (storedLanguage) {
      setLanguageState(storedLanguage)
    }
  }, [storedLanguage])
  
  const toggleLanguage = () => {
    setStoredLanguage((current) => {
      const newLang = (current === 'en' ? 'ru' : 'en') as Language
      setLanguageState(newLang)
      clearTranslationCache()
      return newLang
    })
  }
  
  const changeLanguage = (newLang: Language) => {
    setLanguageState(newLang)
    setStoredLanguage(newLang)
    clearTranslationCache()
  }
  
  return { language, setLanguage: changeLanguage, toggleLanguage }
}
