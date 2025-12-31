import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { FloppyDisk, ArrowsClockwise } from '@phosphor-icons/react'
import { translations as defaultTranslations } from '@/lib/i18n'
import { toast } from 'sonner'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

interface FlatTranslation {
  key: string
  en: string
  ru: string
}

export default function TranslationsEditor() {
  const [customTranslations, setCustomTranslations] = useKV<{ en: TranslationObject; ru: TranslationObject }>('custom-translations', {
    en: {},
    ru: {}
  })
  const [flattenedTranslations, setFlattenedTranslations] = useState<FlatTranslation[]>([])
  const [editedValues, setEditedValues] = useState<{ [key: string]: { en: string; ru: string } }>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const flattenTranslations = (obj: TranslationObject, prefix = ''): FlatTranslation[] => {
    const result: FlatTranslation[] = []
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (typeof value === 'string') {
        const enValue = getNestedValue(defaultTranslations.en, fullKey) || value
        const ruValue = getNestedValue(defaultTranslations.ru, fullKey) || value
        
        const customEn = getNestedValue(customTranslations?.en, fullKey)
        const customRu = getNestedValue(customTranslations?.ru, fullKey)
        
        result.push({
          key: fullKey,
          en: customEn || enValue,
          ru: customRu || ruValue
        })
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTranslations(value as TranslationObject, fullKey))
      }
    }
    
    return result
  }

  const getNestedValue = (obj: any, path: string): string | undefined => {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    
    return typeof current === 'string' ? current : undefined
  }

  const setNestedValue = (obj: any, path: string, value: string): any => {
    const keys = path.split('.')
    const result = { ...obj }
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      } else {
        current[key] = { ...current[key] }
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
    return result
  }

  useEffect(() => {
    const flattened = flattenTranslations(defaultTranslations.en)
    setFlattenedTranslations(flattened)
    
    const initialEdited: { [key: string]: { en: string; ru: string } } = {}
    flattened.forEach(item => {
      initialEdited[item.key] = {
        en: item.en,
        ru: item.ru
      }
    })
    setEditedValues(initialEdited)
  }, [customTranslations])

  const handleValueChange = (key: string, lang: 'en' | 'ru', value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const saveTranslations = () => {
    let newCustomEn = {}
    let newCustomRu = {}
    
    Object.entries(editedValues).forEach(([key, values]) => {
      const defaultEn = getNestedValue(defaultTranslations.en, key)
      const defaultRu = getNestedValue(defaultTranslations.ru, key)
      
      if (values.en !== defaultEn) {
        newCustomEn = setNestedValue(newCustomEn, key, values.en)
      }
      
      if (values.ru !== defaultRu) {
        newCustomRu = setNestedValue(newCustomRu, key, values.ru)
      }
    })
    
    setCustomTranslations({
      en: newCustomEn,
      ru: newCustomRu
    })
    
    setHasUnsavedChanges(false)
    toast.success('Translations saved successfully!')
    
    window.location.reload()
  }

  const resetToDefaults = () => {
    if (confirm('Reset all translations to default values? This cannot be undone.')) {
      setCustomTranslations({
        en: {},
        ru: {}
      })
      setHasUnsavedChanges(false)
      toast.success('Translations reset to defaults')
      
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  const getSectionTitle = (key: string): string => {
    const parts = key.split('.')
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }

  const groupedTranslations: { [section: string]: FlatTranslation[] } = {}
  flattenedTranslations.forEach(item => {
    const section = getSectionTitle(item.key)
    if (!groupedTranslations[section]) {
      groupedTranslations[section] = []
    }
    groupedTranslations[section].push(item)
  })

  const formatKeyLabel = (key: string): string => {
    const parts = key.split('.')
    return parts.slice(1).join(' › ')
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-2xl">Translations Editor</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Edit all website text in English and Russian
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                size="sm"
              >
                <ArrowsClockwise size={16} className="mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={saveTranslations}
                disabled={!hasUnsavedChanges}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                size="sm"
              >
                <FloppyDisk size={16} weight="bold" className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-8 pr-4">
              {Object.entries(groupedTranslations).map(([section, items]) => (
                <div key={section}>
                  <h3 className="font-heading text-xl font-semibold mb-4 sticky top-0 bg-card py-2 z-10">
                    {section}
                  </h3>
                  <div className="space-y-6">
                    {items.map(item => {
                      const isMultiline = editedValues[item.key]?.en.length > 100 || 
                                          editedValues[item.key]?.ru.length > 100 ||
                                          editedValues[item.key]?.en.includes('\n') ||
                                          editedValues[item.key]?.ru.includes('\n')
                      
                      return (
                        <Card key={item.key} className="p-4 bg-muted/30">
                          <div className="mb-3">
                            <Label className="text-sm font-semibold text-foreground">
                              {formatKeyLabel(item.key)}
                            </Label>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {item.key}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`${item.key}-en`} className="text-xs font-medium">
                                English
                              </Label>
                              {isMultiline ? (
                                <Textarea
                                  id={`${item.key}-en`}
                                  value={editedValues[item.key]?.en || ''}
                                  onChange={(e) => handleValueChange(item.key, 'en', e.target.value)}
                                  rows={4}
                                  className="font-body text-sm"
                                />
                              ) : (
                                <Input
                                  id={`${item.key}-en`}
                                  value={editedValues[item.key]?.en || ''}
                                  onChange={(e) => handleValueChange(item.key, 'en', e.target.value)}
                                  className="font-body text-sm"
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`${item.key}-ru`} className="text-xs font-medium">
                                Русский
                              </Label>
                              {isMultiline ? (
                                <Textarea
                                  id={`${item.key}-ru`}
                                  value={editedValues[item.key]?.ru || ''}
                                  onChange={(e) => handleValueChange(item.key, 'ru', e.target.value)}
                                  rows={4}
                                  className="font-body text-sm"
                                />
                              ) : (
                                <Input
                                  id={`${item.key}-ru`}
                                  value={editedValues[item.key]?.ru || ''}
                                  onChange={(e) => handleValueChange(item.key, 'ru', e.target.value)}
                                  className="font-body text-sm"
                                />
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  {Object.keys(groupedTranslations).indexOf(section) < Object.keys(groupedTranslations).length - 1 && (
                    <Separator className="mt-8" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
