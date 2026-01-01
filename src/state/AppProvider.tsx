import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Language } from '@/lib/i18n'
import { clearTranslationCache, setCustomTranslationsCache } from '@/lib/i18n'
import type { CartItem, Cart } from '@/lib/types'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

type AppState = {
  language: Language
  setLanguage: (v: Language) => void
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  cartServices: Cart
  setCartServices: React.Dispatch<React.SetStateAction<Cart>>
  customTranslations: { en: TranslationObject; ru: TranslationObject }
  setCustomTranslations: React.Dispatch<React.SetStateAction<{ en: TranslationObject; ru: TranslationObject }>>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageInternal] = useState<Language>(() => {
    const path = window.location.pathname
    if (path.startsWith('/rus')) {
      return 'ru'
    }
    return 'en'
  })

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart-items')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const [cartServices, setCartServices] = useState<Cart>(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (!stored) return { items: [], total: 0, services: [] }
      const parsed = JSON.parse(stored)
      return parsed || { items: [], total: 0, services: [] }
    } catch {
      return { items: [], total: 0, services: [] }
    }
  })

  const [customTranslations, setCustomTranslations] = useState<{ en: TranslationObject; ru: TranslationObject }>(() => {
    try {
      const stored = localStorage.getItem('custom-translations')
      if (!stored) return { en: {}, ru: {} }
      const parsed = JSON.parse(stored)
      return parsed || { en: {}, ru: {} }
    } catch {
      return { en: {}, ru: {} }
    }
  })

  const setLanguage = (newLang: Language) => {
    setLanguageInternal(newLang)
    
    const currentPath = window.location.pathname
    let newPath = currentPath
    
    if (newLang === 'ru') {
      if (!currentPath.startsWith('/rus')) {
        newPath = '/rus' + currentPath
      }
    } else {
      if (currentPath.startsWith('/rus')) {
        newPath = currentPath.replace(/^\/rus/, '') || '/'
      }
    }
    
    if (newPath !== currentPath) {
      window.history.pushState({}, '', newPath)
    }
  }

  useEffect(() => {
    localStorage.setItem('app-language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('cart-items', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartServices))
  }, [cartServices])

  useEffect(() => {
    localStorage.setItem('custom-translations', JSON.stringify(customTranslations))
  }, [customTranslations])

  useEffect(() => {
    if (customTranslations) {
      clearTranslationCache()
      setCustomTranslationsCache(customTranslations)
    }
  }, [customTranslations])

  const value = useMemo(() => ({
    language,
    setLanguage,
    cart,
    setCart,
    cartServices,
    setCartServices,
    customTranslations,
    setCustomTranslations
  }), [language, cart, cartServices, customTranslations])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}
