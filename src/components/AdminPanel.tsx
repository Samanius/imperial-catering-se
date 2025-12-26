import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { ArrowLeft, Plus, Trash, PencilSimple, Check, X, ClockCounterClockwise, DownloadSimple, CaretDown, CaretUp, Eye, EyeSlash, FileArrowDown, SpinnerGap } from '@phosphor-icons/react'
import type { Restaurant, MenuItem, MenuType } from '@/lib/types'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { createBackup, getBackups, exportBackupsAsJSON, type BackupEntry } from '@/lib/backup'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { importFromGoogleSheets, extractSpreadsheetId } from '@/lib/google-sheets-import'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [restaurants, setRestaurants] = useKV<Restaurant[]>('restaurants', [])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [activeTab, setActiveTab] = useState<'restaurants' | 'backups'>('restaurants')
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1my60zyjTGdDaY0sen9WAxCWooP7EDPneRTzwVDxoxEQ/edit?gid=0#gid=0')
  const [isImporting, setIsImporting] = useState(false)

  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    tagline: '',
    tags: [],
    description: '',
    story: '',
    menuType: 'visual',
    coverImage: '',
    galleryImages: [],
    menuItems: [],
    tastingMenuDescription: '',
    categories: [],
    minimumOrderAmount: undefined,
    orderDeadlineHours: undefined,
    chefServicePrice: undefined,
    waiterServicePrice: undefined
  })

  const [newTag, setNewTag] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    weight: undefined
  })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemData, setEditingItemData] = useState<MenuItem | null>(null)

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    const allBackups = await getBackups()
    setBackups(allBackups)
  }

  const downloadBackups = async () => {
    try {
      const json = await exportBackupsAsJSON()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meridien-backups-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Backups exported successfully')
    } catch (error) {
      toast.error('Failed to export backups')
    }
  }

  const startCreating = () => {
    setIsCreating(true)
    setSelectedRestaurant(null)
    setFormData({
      name: '',
      tagline: '',
      tags: [],
      description: '',
      story: '',
      menuType: 'visual',
      coverImage: '',
      galleryImages: [],
      menuItems: [],
      tastingMenuDescription: '',
      categories: [],
      minimumOrderAmount: undefined,
      orderDeadlineHours: undefined,
      chefServicePrice: undefined,
      waiterServicePrice: undefined
    })
  }

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsCreating(false)
    setFormData(restaurant)
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }))
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), newCategory.trim()]
      }))
      setNewCategory('')
    }
  }

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter((_, i) => i !== index)
    }))
  }

  const addMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      toast.error('Please fill menu item name and price')
      return
    }

    const menuItem: MenuItem = {
      id: Date.now().toString(),
      name: newMenuItem.name,
      description: newMenuItem.description || '',
      price: Number(newMenuItem.price),
      image: newMenuItem.image || '',
      category: newMenuItem.category || 'Uncategorized',
      weight: newMenuItem.weight ? Number(newMenuItem.weight) : undefined
    }

    setFormData(prev => ({
      ...prev,
      menuItems: [...(prev.menuItems || []), menuItem]
    }))

    setNewMenuItem({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      weight: undefined
    })

    toast.success('Menu item added')
  }

  const removeMenuItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      menuItems: (prev.menuItems || []).filter(item => item.id !== id)
    }))
  }

  const startEditingItem = (item: MenuItem) => {
    setEditingItemId(item.id)
    setEditingItemData({ ...item })
  }

  const cancelEditingItem = () => {
    setEditingItemId(null)
    setEditingItemData(null)
  }

  const saveEditedItem = () => {
    if (!editingItemData || !editingItemData.name || !editingItemData.price) {
      toast.error('Please fill name and price')
      return
    }

    setFormData(prev => ({
      ...prev,
      menuItems: (prev.menuItems || []).map(item =>
        item.id === editingItemId ? editingItemData : item
      )
    }))

    toast.success('Menu item updated')
    setEditingItemId(null)
    setEditingItemData(null)
  }

  const saveRestaurant = async () => {
    if (!formData.name || !formData.story) {
      toast.error('Please fill required fields')
      return
    }

    const restaurant: Restaurant = {
      id: selectedRestaurant?.id || Date.now().toString(),
      name: formData.name,
      tagline: formData.tagline || '',
      tags: formData.tags || [],
      description: formData.description || '',
      story: formData.story,
      menuType: formData.menuType || 'visual',
      coverImage: formData.coverImage || '',
      galleryImages: formData.galleryImages || [],
      menuItems: formData.menuItems || [],
      tastingMenuDescription: formData.tastingMenuDescription || '',
      categories: formData.categories || [],
      minimumOrderAmount: formData.minimumOrderAmount ? Number(formData.minimumOrderAmount) : undefined,
      orderDeadlineHours: formData.orderDeadlineHours ? Number(formData.orderDeadlineHours) : undefined,
      chefServicePrice: formData.chefServicePrice ? Number(formData.chefServicePrice) : undefined,
      waiterServicePrice: formData.waiterServicePrice ? Number(formData.waiterServicePrice) : undefined
    }

    if (selectedRestaurant) {
      await createBackup('update', 'restaurant', restaurant.id, restaurant.name, restaurant, selectedRestaurant)
      setRestaurants((current) => 
        (current || []).map(r => r.id === restaurant.id ? restaurant : r)
      )
      toast.success('Restaurant updated')
    } else {
      await createBackup('create', 'restaurant', restaurant.id, restaurant.name, restaurant)
      setRestaurants((current) => [...(current || []), restaurant])
      toast.success('Restaurant created')
    }

    await loadBackups()
    setIsCreating(false)
    setSelectedRestaurant(null)
  }

  const toggleRestaurantVisibility = async (id: string) => {
    const restaurant = restaurants?.find(r => r.id === id)
    if (!restaurant) return
    
    const updatedRestaurant = { ...restaurant, isHidden: !restaurant.isHidden }
    const action = updatedRestaurant.isHidden ? 'hidden' : 'shown'
    
    await createBackup('update', 'restaurant', id, restaurant.name, updatedRestaurant, restaurant)
    setRestaurants((current) => 
      (current || []).map(r => r.id === id ? updatedRestaurant : r)
    )
    toast.success(`Restaurant ${action}`)
    await loadBackups()
  }

  const deleteRestaurant = async (id: string) => {
    const restaurantToDelete = restaurants?.find(r => r.id === id)
    if (!restaurantToDelete) return
    
    if (confirm('Are you sure you want to delete this restaurant?')) {
      await createBackup('delete', 'restaurant', id, restaurantToDelete.name, restaurantToDelete)
      setRestaurants((current) => (current || []).filter(r => r.id !== id))
      toast.success('Restaurant deleted')
      await loadBackups()
    }
  }

  const handleImportFromGoogleSheets = async () => {
    if (!googleSheetUrl.trim()) {
      toast.error('Please enter a Google Sheets URL')
      return
    }

    const spreadsheetId = extractSpreadsheetId(googleSheetUrl)
    
    if (!spreadsheetId) {
      toast.error('Invalid Google Sheets URL')
      return
    }

    setIsImporting(true)

    try {
      const result = await importFromGoogleSheets(spreadsheetId, restaurants || [])
      
      console.log('Import result:', result)
      console.log('Errors array:', result.errors)

      const hasChanges = result.addedCount > 0 || result.updatedCount > 0

      if (hasChanges) {
        setRestaurants((current) => {
          const currentRestaurants = current || []
          
          let updatedList = [...currentRestaurants]
          
          if (result.updatedRestaurants.length > 0) {
            updatedList = updatedList.map(restaurant => {
              const updated = result.updatedRestaurants.find(r => r.id === restaurant.id)
              return updated || restaurant
            })
          }
          
          if (result.newRestaurants.length > 0) {
            updatedList = [...updatedList, ...result.newRestaurants]
          }
          
          console.log('Updated restaurant list:', updatedList.map(r => r.name))
          
          return updatedList
        })
        
        const messages: string[] = []
        if (result.addedCount > 0) {
          messages.push(`${result.addedCount} new restaurant${result.addedCount !== 1 ? 's' : ''}`)
        }
        if (result.updatedCount > 0) {
          messages.push(`${result.updatedCount} updated restaurant${result.updatedCount !== 1 ? 's' : ''}`)
        }
        
        console.group('✅ Import Successful!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`📊 IMPORT SUMMARY:`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`✓ New restaurants added: ${result.addedCount}`)
        console.log(`✓ Existing restaurants updated: ${result.updatedCount}`)
        console.log(`✓ Total menu items imported: ${result.itemsAddedCount}`)
        
        if (result.newRestaurants.length > 0) {
          console.log('\n🆕 NEW RESTAURANTS:')
          result.newRestaurants.forEach(r => {
            console.log(`  • ${r.name} (${r.menuItems?.length || 0} items)`)
          })
        }
        
        if (result.updatedRestaurants.length > 0) {
          console.log('\n🔄 UPDATED RESTAURANTS:')
          result.updatedRestaurants.forEach(r => {
            console.log(`  • ${r.name} (${r.menuItems?.length || 0} total items)`)
          })
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.groupEnd()
        
        toast.success(
          `Successfully imported: ${messages.join(', ')} with ${result.itemsAddedCount} total menu item${result.itemsAddedCount !== 1 ? 's' : ''}`,
          { duration: 6000 }
        )
        
        if (result.errors.length > 0) {
          console.group('ℹ️  Import Warnings:')
          result.errors.forEach((error, idx) => {
            console.log(`${idx + 1}. ${error}`)
          })
          console.groupEnd()
        }
        
        await loadBackups()
        setIsImportDialogOpen(false)
      } else {
        if (result.errors.length > 0) {
          console.group('❌ Import Failed - Detailed Error Report:')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log(`Total errors found: ${result.errors.length}`)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          
          result.errors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error}`)
          })
          
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('📋 SPREADSHEET REQUIREMENTS:')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('✓ Each sheet = one restaurant (sheet name = restaurant name)')
          console.log('✓ First row can be headers (will be skipped automatically)')
          console.log('✓ Required columns:')
          console.log('  • Column A: Item Name (must not be empty)')
          console.log('  • Column C: Price (must be a valid number, $ signs OK)')
          console.log('✓ Optional columns:')
          console.log('  • Column B: Description')
          console.log('  • Column D: Category')
          console.log('  • Column E: Weight (in grams)')
          console.log('  • Column F: Image URL (must start with http or https)')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('\n🔍 COMMON ISSUES:')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('1. Empty rows - will be automatically skipped')
          console.log('2. Invalid prices - check that prices are numbers (e.g., 25, $25, 25.50)')
          console.log('3. Missing Item Name or Price - these are required fields')
          console.log('4. Invalid image URLs - must start with http:// or https://')
          console.log('5. All items identical - if restaurant exists and all items are the same, no update needed')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.groupEnd()
          
          const errorSummary = result.errors
            .map(err => {
              if (err.includes('no valid menu items')) return '• Missing required data (Item Name or Price)'
              if (err.includes('No changes detected')) return '• All items already exist with identical data'
              if (err.includes('empty name')) return '• Found sheet with no name'
              return `• ${err.substring(0, 80)}${err.length > 80 ? '...' : ''}`
            })
            .slice(0, 5)
            .join('\n')
          
          toast.error(
            `Import failed. Check browser console (F12) for details.\n\nIssues found:\n${errorSummary}`,
            { duration: 10000 }
          )
        } else {
          toast.info('No data found to import from the spreadsheet.')
          console.log('No sheets or no data found in spreadsheet')
        }
      }
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold">
                Concierge Dashboard
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Manage restaurants and menus
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-accent text-accent-foreground hover:bg-accent/10"
                >
                  <FileArrowDown size={20} weight="bold" className="mr-2" />
                  Import from Google Sheets
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Import from Google Sheets</DialogTitle>
                  <DialogDescription>
                    Import restaurants and menu items from your Google Spreadsheet
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <Card className="p-4 bg-muted/30 border-accent/20">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      <strong className="text-foreground">Sheet Structure:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Each sheet = one restaurant (sheet name = restaurant name)</li>
                      <li><strong>First row can be headers</strong> (will be skipped automatically)</li>
                      <li>Column A: Item Name (required)</li>
                      <li>Column B: Description (optional)</li>
                      <li>Column C: Price (required, numbers only or with $)</li>
                      <li>Column D: Category (optional)</li>
                      <li>Column E: Weight in grams (optional)</li>
                      <li>Column F: Image URL (optional)</li>
                    </ul>
                    <p className="text-xs text-accent-foreground mt-3 font-medium">
                      ⚠️ Empty rows are skipped. At least Item Name and Price must be filled.
                    </p>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="sheet-url">Google Sheets URL</Label>
                    <Input
                      id="sheet-url"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      New restaurants will be added. Existing restaurants will be updated with new menu items only.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleImportFromGoogleSheets}
                      disabled={isImporting}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isImporting ? (
                        <>
                          <SpinnerGap size={20} weight="bold" className="mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileArrowDown size={20} weight="bold" className="mr-2" />
                          Import Data
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportDialogOpen(false)}
                      disabled={isImporting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={startCreating}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus size={20} weight="bold" className="mr-2" />
              New Restaurant
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'restaurants' | 'backups')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="backups">
              <ClockCounterClockwise size={16} className="mr-2" />
              Backups ({backups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{/* ... restaurant management UI ... */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Restaurants
            </h2>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {!restaurants || restaurants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No restaurants yet
                  </p>
                ) : (
                  restaurants.map(restaurant => (
                    <div
                      key={restaurant.id}
                      className={`p-3 rounded-sm border cursor-pointer transition-colors ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => selectRestaurant(restaurant)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-medium truncate">
                            {restaurant.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {restaurant.menuType}
                            {restaurant.isHidden && (
                              <span className="ml-2 text-destructive font-medium">• Hidden</span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRestaurantVisibility(restaurant.id)
                            }}
                            className={`h-8 w-8 ${
                              restaurant.isHidden 
                                ? 'hover:bg-accent/10 hover:text-accent text-muted-foreground' 
                                : 'hover:bg-accent/10 hover:text-accent'
                            }`}
                          >
                            {restaurant.isHidden ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRestaurant(restaurant.id)
                            }}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="p-6 lg:col-span-2">
            {!isCreating && !selectedRestaurant ? (
              <div className="text-center py-16">
                <p className="font-heading text-xl text-muted-foreground">
                  Select a restaurant or create a new one
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-6 pr-4">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-1">
                      {isCreating ? 'New Restaurant' : 'Edit Restaurant'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Fill in the details below
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Le Bernardin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="Fine French Seafood"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Mediterranean"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button type="button" onClick={addTag} size="icon">
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(formData.tags || []).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-sm text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(index)}
                              className="hover:text-destructive"
                            >
                              <Trash size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="story">Restaurant Story *</Label>
                      <Textarea
                        id="story"
                        value={formData.story}
                        onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                        placeholder="A gastronomic journey from the shores of Sicily..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="menuType">Menu Type</Label>
                      <Select
                        value={formData.menuType}
                        onValueChange={(value: MenuType) => setFormData(prev => ({ ...prev, menuType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Visual Menu (À la Carte)</SelectItem>
                          <SelectItem value="tasting">Tasting Menu (PDF Style)</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                        <Input
                          id="minimumOrderAmount"
                          type="number"
                          value={formData.minimumOrderAmount || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderDeadlineHours">Order Deadline (hours before charter)</Label>
                        <Input
                          id="orderDeadlineHours"
                          type="number"
                          value={formData.orderDeadlineHours || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, orderDeadlineHours: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="24"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chefServicePrice">Chef Service Price ($)</Label>
                        <Input
                          id="chefServicePrice"
                          type="number"
                          value={formData.chefServicePrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, chefServicePrice: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="waiterServicePrice">Waiter Service Price ($ per waiter)</Label>
                        <Input
                          id="waiterServicePrice"
                          type="number"
                          value={formData.waiterServicePrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, waiterServicePrice: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {(formData.menuType === 'tasting' || formData.menuType === 'both') && (
                      <div className="space-y-2">
                        <Label htmlFor="tastingDescription">Tasting Menu Description</Label>
                        <Textarea
                          id="tastingDescription"
                          value={formData.tastingMenuDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, tastingMenuDescription: e.target.value }))}
                          placeholder="An eight-course journey through seasonal flavors..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-4">
                      Menu Categories
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Starters"
                        onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                      />
                      <Button type="button" onClick={addCategory} size="icon">
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.categories || []).map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-sm text-sm"
                        >
                          {category}
                          <button
                            onClick={() => removeCategory(index)}
                            className="hover:text-destructive"
                          >
                            <Trash size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-4">
                      Menu Items
                    </h3>

                    <Card className="p-4 mb-4 bg-muted/30">
                      <p className="text-sm font-semibold mb-3">Add Menu Item</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Item name"
                          value={newMenuItem.name}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={newMenuItem.price || ''}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                        />
                        <Input
                          placeholder="Category"
                          value={newMenuItem.category}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Weight (g)"
                          value={newMenuItem.weight || ''}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }))}
                        />
                        <Input
                          placeholder="Image URL"
                          value={newMenuItem.image}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, image: e.target.value }))}
                          className="md:col-span-2"
                        />
                        <Textarea
                          placeholder="Description"
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                          className="md:col-span-2"
                          rows={2}
                        />
                      </div>
                      <Button onClick={addMenuItem} className="mt-3 w-full" size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Item
                      </Button>
                    </Card>

                    <div className="space-y-2">
                      {(formData.menuItems || []).map((item) => (
                        <Card key={item.id} className="p-3">
                          {editingItemId === item.id && editingItemData ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    placeholder="Item name"
                                    value={editingItemData.name}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Price</Label>
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    value={editingItemData.price || ''}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Category</Label>
                                  <Input
                                    placeholder="Category"
                                    value={editingItemData.category}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Weight (g)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Weight"
                                    value={editingItemData.weight || ''}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }) : null)}
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <Label className="text-xs">Image URL</Label>
                                  <Input
                                    placeholder="Image URL"
                                    value={editingItemData.image || ''}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, image: e.target.value }) : null)}
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <Label className="text-xs">Description</Label>
                                  <Textarea
                                    placeholder="Description"
                                    value={editingItemData.description}
                                    onChange={(e) => setEditingItemData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={saveEditedItem}
                                  size="sm"
                                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                                >
                                  <Check size={16} weight="bold" className="mr-2" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={cancelEditingItem}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <X size={16} weight="bold" className="mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                <div className="flex gap-2 items-center text-sm font-medium">
                                  <span>${item.price}</span>
                                  {item.weight && (
                                    <span className="text-muted-foreground">• {item.weight} g</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingItem(item)}
                                  className="h-8 w-8 hover:bg-accent/10 hover:text-accent"
                                >
                                  <PencilSimple size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMenuItem(item.id)}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button
                      onClick={saveRestaurant}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Save Restaurant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false)
                        setSelectedRestaurant(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="backups" className="mt-0">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">
                    Data Backups Archive
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    All logs and image URLs • Automatic backup system
                  </p>
                </div>
                <Button
                  onClick={downloadBackups}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 whitespace-nowrap"
                >
                  <DownloadSimple size={18} weight="bold" />
                  Download Full Backup
                </Button>
              </div>

              <Card className="p-4 mb-6 bg-muted/30 border-accent/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-sm bg-accent/10">
                    <DownloadSimple size={20} className="text-accent" weight="bold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm mb-1">
                      Backup File Contents
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      JSON file includes: all change logs, current restaurants data, all image URLs (covers, galleries, menu items), timestamps, and detailed change history.
                    </p>
                  </div>
                </div>
              </Card>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {backups.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockCounterClockwise size={48} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No backups yet. All changes will be automatically archived here.
                      </p>
                    </div>
                  ) : (
                    backups
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((backup, index) => (
                        <Collapsible key={index}>
                          <Card className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                                      backup.action === 'create'
                                        ? 'bg-green-500/10 text-green-700'
                                        : backup.action === 'update'
                                        ? 'bg-blue-500/10 text-blue-700'
                                        : 'bg-red-500/10 text-red-700'
                                    }`}
                                  >
                                    {backup.action.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(backup.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="font-heading font-medium">
                                  {backup.entityName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {backup.entityId}
                                </p>
                                {backup.changesSummary && (
                                  <p className="text-sm text-foreground mt-2 font-medium">
                                    {backup.changesSummary}
                                  </p>
                                )}
                              </div>
                              {backup.changes && backup.changes.length > 0 && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <CaretDown size={16} className="transition-transform [[data-state=open]_&]:rotate-180" />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                            
                            {backup.changes && backup.changes.length > 0 && (
                              <CollapsibleContent className="mt-3">
                                <Separator className="mb-3" />
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Detailed Changes
                                  </p>
                                  {backup.changes.map((change, changeIndex) => (
                                    <div
                                      key={changeIndex}
                                      className="p-2 bg-muted/30 rounded text-xs space-y-1"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-1.5 py-0.5 rounded font-medium ${
                                            change.changeType === 'added'
                                              ? 'bg-green-500/10 text-green-700'
                                              : change.changeType === 'removed'
                                              ? 'bg-red-500/10 text-red-700'
                                              : 'bg-blue-500/10 text-blue-700'
                                          }`}
                                        >
                                          {change.changeType}
                                        </span>
                                        <span className="font-medium">{change.field}</span>
                                      </div>
                                      {change.changeType === 'modified' && (
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                          <div>
                                            <span className="text-muted-foreground">Before:</span>
                                            <div className="mt-0.5 text-foreground break-words">
                                              {typeof change.oldValue === 'object' && change.oldValue !== null
                                                ? JSON.stringify(change.oldValue).substring(0, 100)
                                                : String(change.oldValue)}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">After:</span>
                                            <div className="mt-0.5 text-foreground break-words">
                                              {typeof change.newValue === 'object' && change.newValue !== null
                                                ? JSON.stringify(change.newValue).substring(0, 100)
                                                : String(change.newValue)}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {change.changeType === 'added' && (
                                        <div className="text-foreground break-words">
                                          Value: {typeof change.newValue === 'object' && change.newValue !== null
                                            ? JSON.stringify(change.newValue).substring(0, 100)
                                            : String(change.newValue)}
                                        </div>
                                      )}
                                      {change.changeType === 'removed' && (
                                        <div className="text-foreground break-words">
                                          Previous value: {typeof change.oldValue === 'object' && change.oldValue !== null
                                            ? JSON.stringify(change.oldValue).substring(0, 100)
                                            : String(change.oldValue)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            )}
                          </Card>
                        </Collapsible>
                      ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
