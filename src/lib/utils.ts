import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Language } from "./i18n"
import type { MenuItem, Restaurant } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `Dh ${amount.toFixed(2)}`
}

export function getLocalizedText(obj: any, field: string, lang: Language): string {
  if (lang === 'ru' && obj[`${field}_ru`]) {
    return obj[`${field}_ru`]
  }
  return obj[field] || ''
}

export function getLocalizedArray(obj: any, field: string, lang: Language): string[] {
  if (lang === 'ru' && obj[`${field}_ru`]) {
    return obj[`${field}_ru`]
  }
  return obj[field] || []
}

