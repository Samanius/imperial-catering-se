import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useDatabase } from '@/hooks/use-database'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { ArrowLeft, Plus, Trash, PencilSimple, Check, X, Eye, EyeSlash, FileArrowDown, SpinnerGap, ArrowsClockwise } from '@phosphor-icons/react'
import type { Restaurant, MenuItem, MenuType } from '@/lib/types'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { createBackup } from '@/lib/backup'
import { importFromGoogleSheets, extractSpreadsheetId } from '@/lib/google-sheets-import'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import DatabaseSetup from './DatabaseSetup'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const database = useDatabase()
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'database'>('restaurants')
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1my60zyjTGdDaY0sen9WAxCWooP7EDPneRTzwVDxoxEQ/edit?gid=0#gid=0')
  const [googleApiKey, setGoogleApiKey] = useKV<string>('google-sheets-api-key', '')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)

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
    setApiKeyInput(googleApiKey || '')
  }, [googleApiKey])

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

    if (!database.isConfigured) {
      toast.error('Database not configured. Please set up the database first.')
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

    try {
      if (selectedRestaurant) {
        await createBackup('update', 'restaurant', restaurant.id, restaurant.name, restaurant, selectedRestaurant)
        await database.updateRestaurant(restaurant)
        toast.success('Restaurant updated')
      } else {
        await createBackup('create', 'restaurant', restaurant.id, restaurant.name, restaurant)
        await database.addRestaurant(restaurant)
        toast.success('Restaurant created')
      }

      setIsCreating(false)
      setSelectedRestaurant(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save restaurant')
    }
  }

  const toggleRestaurantVisibility = async (id: string) => {
    const restaurant = database.restaurants?.find(r => r.id === id)
    if (!restaurant) return
    
    const updatedRestaurant = { ...restaurant, isHidden: !restaurant.isHidden }
    const action = updatedRestaurant.isHidden ? 'hidden' : 'shown'
    
    try {
      await createBackup('update', 'restaurant', id, restaurant.name, updatedRestaurant, restaurant)
      await database.updateRestaurant(updatedRestaurant)
      toast.success(`Restaurant ${action}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update restaurant')
    }
  }

  const deleteRestaurant = async (id: string) => {
    const restaurantToDelete = database.restaurants?.find(r => r.id === id)
    if (!restaurantToDelete) return
    
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await createBackup('delete', 'restaurant', id, restaurantToDelete.name, restaurantToDelete)
        await database.deleteRestaurant(id)
        toast.success('Restaurant deleted')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete restaurant')
      }
    }
  }

  const handleImportFromGoogleSheets = async () => {
    if (!googleSheetUrl.trim()) {
      toast.error('Please enter a Google Sheets URL')
      return
    }

    if (!apiKeyInput.trim()) {
      toast.error('Please enter your Google Sheets API key')
      return
    }

    const spreadsheetId = extractSpreadsheetId(googleSheetUrl)
    
    if (!spreadsheetId) {
      toast.error('Invalid Google Sheets URL')
      return
    }

    const trimmedApiKey = apiKeyInput.trim()
    
    if (googleApiKey !== trimmedApiKey) {
      setGoogleApiKey(trimmedApiKey)
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const result = await importFromGoogleSheets(spreadsheetId, database.restaurants || [], trimmedApiKey)
      
      console.log('Import result:', result)
      console.log('Errors array:', result.errors)

      const hasChanges = result.addedCount > 0 || result.updatedCount > 0

      if (hasChanges) {
        if (!database.isConfigured) {
          const fullErrorText = `IMPORT FAILED\n\n` +
            `Error Details:\n` +
            `Database not found. Please check your Gist ID.\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `SPREADSHEET REQUIREMENTS:\n` +
            `• Each sheet = one restaurant (sheet name = restaurant name)\n` +
            `• First row can be headers (skipped automatically)\n` +
            `• Required: Column A (Item Name), Column C (Price)\n` +
            `• Optional: Column B (Description), D (Category), E (Weight), F (Image URL)\n\n` +
            `COMMON SETUP ISSUES:\n` +
            `1. Google Sheets API not enabled (most common!)\n` +
            `2. Invalid or incomplete API key\n` +
            `3. Spreadsheet not shared publicly\n` +
            `4. Wrong Google Cloud project selected\n\n` +
            `REQUIRED ACTION:\n` +
            `☐ Go to the "Database" tab in Admin Panel\n` +
            `☐ Set up GitHub Gist credentials\n` +
            `☐ Try importing again\n\n` +
            `NOTE: The import from Google Sheets was successful, but we need\n` +
            `a database to save the data. Please configure the database first.`
          
          setImportError(fullErrorText)
          setIsErrorDialogOpen(true)
          toast.error('Database not configured. Please set up the database first in the Database tab.')
          return
        }

        const currentRestaurants = database.restaurants || []
        
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
        
        await database.saveRestaurants(updatedList)
        
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
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━')
          console.groupEnd()
          
          const fullErrorText = `IMPORT FAILED\n\n` +
            `Total errors found: ${result.errors.length}\n\n` +
            `ERRORS:\n${result.errors.map((err, i) => `${i + 1}. ${err}`).join('\n\n')}\n\n` +
            `SPREADSHEET REQUIREMENTS:\n` +
            `• Each sheet = one restaurant (sheet name = restaurant name)\n` +
            `• First row can be headers (skipped automatically)\n` +
            `• Required: Column A (Item Name), Column C (Price)\n` +
            `• Optional: Column B (Description), D (Category), E (Weight), F (Image URL)\n\n` +
            `COMMON ISSUES:\n` +
            `1. Empty rows are skipped automatically\n` +
            `2. Invalid prices - must be numbers (e.g., 25, $25, 25.50)\n` +
            `3. Missing required fields - Item Name or Price\n` +
            `4. Invalid image URLs - must start with http:// or https://\n` +
            `5. All items identical - no update needed if data is the same`
          
          setImportError(fullErrorText)
          setIsErrorDialogOpen(true)
          
          toast.error(
            `Import failed. Check browser console (F12) for details.\n\nIssues found:\n${result.errors.slice(0, 2).map(err => `• ${err.substring(0, 60)}${err.length > 60 ? '...' : ''}`).join('\n')}${result.errors.length > 2 ? `\n• ...and ${result.errors.length - 2} more` : ''}`,
            { duration: 10000 }
          )
        } else {
          toast.info('No data found to import from the spreadsheet.')
          console.log('No sheets or no data found in spreadsheet')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      let displayError = errorMessage
      let actionableSteps = ''
      
      if (errorMessage.includes('Sheets API is not enabled') || errorMessage.includes('SERVICE_DISABLED')) {
        actionableSteps = '\n\n📋 CHECKLIST TO FIX:\n' +
          '☐ Go to Google Cloud Console\n' +
          '☐ Select your project\n' +
          '☐ Navigate to "APIs & Services" → "Library"\n' +
          '☐ Search for "Google Sheets API"\n' +
          '☐ Click "Enable" button\n' +
          '☐ Wait 2-3 minutes for changes to take effect\n' +
          '☐ Try importing again'
      } else if (errorMessage.includes('Access denied')) {
        actionableSteps = '\n\n📋 CHECKLIST TO FIX:\n' +
          '☐ Verify Google Sheets API is enabled in Cloud Console\n' +
          '☐ Check that your API key is valid (not expired/deleted)\n' +
          '☐ Ensure spreadsheet is shared as "Anyone with the link can view"\n' +
          '☐ Try creating a new API key if problem persists'
      } else if (errorMessage.includes('Invalid API key format')) {
        actionableSteps = '\n\n📋 CHECKLIST TO FIX:\n' +
          '☐ Copy the COMPLETE API key from Google Cloud Console\n' +
          '☐ API key should start with "AIza" and be 39 characters\n' +
          '☐ Make sure no spaces or line breaks were copied\n' +
          '☐ Try creating a new API key if problem persists'
      }
      
      const fullErrorText = `IMPORT FAILED\n\n` +
        `Error Details:\n${displayError}${actionableSteps}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `SPREADSHEET REQUIREMENTS:\n` +
        `• Each sheet = one restaurant (sheet name = restaurant name)\n` +
        `• First row can be headers (skipped automatically)\n` +
        `• Required: Column A (Item Name), Column C (Price)\n` +
        `• Optional: Column B (Description), D (Category), E (Weight), F (Image URL)\n\n` +
        `COMMON SETUP ISSUES:\n` +
        `1. Google Sheets API not enabled (most common!)\n` +
        `2. Invalid or incomplete API key\n` +
        `3. Spreadsheet not shared publicly\n` +
        `4. Wrong Google Cloud project selected`
      
      setImportError(fullErrorText)
      setIsErrorDialogOpen(true)
      
      toast.error(`Import failed: ${errorMessage.split('\n')[0]}`, { duration: 8000 })
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
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="font-heading text-2xl">Import from Google Sheets</DialogTitle>
                  <DialogDescription>
                    Import restaurants and menu items from your Google Spreadsheet
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 overflow-auto pr-4">
                  <div className="space-y-4 py-4 pb-6">
                    <Card className="p-4 bg-accent/5 border-accent/30">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        🔑 Google Sheets API Key Setup (One-Time)
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        Follow these steps to create your API key:
                      </p>
                      <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside mt-2">
                        <li className="pl-2">
                          <strong className="text-foreground">Visit Google Cloud Console:</strong><br/>
                          <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80 ml-6">console.cloud.google.com</a>
                        </li>
                        <li className="pl-2">
                          <strong className="text-foreground">Create or select a project</strong><br/>
                          <span className="ml-6 text-xs">Click "Select a project" dropdown at the top</span>
                        </li>
                        <li className="pl-2">
                          <strong className="text-foreground">Enable Google Sheets API:</strong><br/>
                          <span className="ml-6">• Go to "APIs & Services" → "Enable APIs and Services"</span><br/>
                          <span className="ml-6">• Search for "Google Sheets API"</span><br/>
                          <span className="ml-6">• Click "Enable" button</span><br/>
                          <span className="ml-6 text-accent font-medium">⚠️ This step is critical - the API must be enabled!</span>
                        </li>
                        <li className="pl-2">
                          <strong className="text-foreground">Create API Key:</strong><br/>
                          <span className="ml-6">• Go to "Credentials" → "Create Credentials" → "API Key"</span><br/>
                          <span className="ml-6">• (Optional) Restrict to Google Sheets API for security</span>
                        </li>
                        <li className="pl-2">
                          <strong className="text-foreground">Copy and paste the key below</strong>
                        </li>
                      </ol>
                      <Card className="mt-3 p-3 bg-destructive/10 border-destructive/30">
                        <p className="text-xs font-semibold text-destructive mb-1">
                          ⚠️ Common Error: "SERVICE_DISABLED"
                        </p>
                        <p className="text-xs text-destructive/80 leading-relaxed">
                          If you see this error, it means step 3 (Enable API) was skipped. You must enable the Google Sheets API in your project before the API key will work. After enabling, wait 2-3 minutes before trying to import.
                        </p>
                      </Card>
                    </Card>

                    <div className="space-y-2">
                      <Label htmlFor="api-key">Google Sheets API Key *</Label>
                      <Input
                        id="api-key"
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter your Google Sheets API key"
                      />
                      {googleApiKey && googleApiKey === apiKeyInput ? (
                        <p className="text-xs text-accent-foreground font-medium flex items-center gap-1">
                          <Check size={14} weight="bold" />
                          API key saved and will be remembered for future imports
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Your API key will be saved securely after first import and reused automatically
                        </p>
                      )}
                    </div>

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
                      <Label htmlFor="sheet-url">Google Sheets URL *</Label>
                      <Input
                        id="sheet-url"
                        value={googleSheetUrl}
                        onChange={(e) => setGoogleSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                      />
                      <p className="text-xs text-muted-foreground">
                        ⚠️ <strong>Important:</strong> Your spreadsheet must be shared as "Anyone with the link can view"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        New restaurants will be added. Existing restaurants will be updated with new menu items.
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
                </ScrollArea>
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'restaurants' | 'database')} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-2 mb-6">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{/* ... restaurant management UI ... */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Restaurants
            </h2>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {!database.restaurants || database.restaurants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No restaurants yet
                  </p>
                ) : (
                  database.restaurants.map(restaurant => (
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

          <TabsContent value="database" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <DatabaseSetup
                onSetup={async (gistId, githubToken) => {
                  await database.configureDatabase(gistId, githubToken)
                }}
                onCreateNew={database.createDatabase}
                isConfigured={database.isConfigured}
              />
              
              {database.isConfigured && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Refresh Database</p>
                        <p className="text-sm text-muted-foreground">Load latest data from cloud</p>
                      </div>
                      <Button onClick={database.refresh} variant="outline" size="sm">
                        <ArrowsClockwise size={16} className="mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-heading text-2xl text-destructive flex items-center gap-2">
              <X size={28} weight="bold" />
              Import Error Details
            </DialogTitle>
            <DialogDescription>
              Full error information - check all issues below
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-auto pr-4 my-4">
            <div className="space-y-4">
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground leading-relaxed">
                  {importError}
                </pre>
              </Card>
            </div>
          </ScrollArea>

          <div className="flex gap-2 flex-shrink-0 pt-4 border-t">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(importError || '')
                toast.success('Error details copied to clipboard')
              }}
              variant="outline"
              className="flex-1"
            >
              Copy Error Details
            </Button>
            <Button
              onClick={() => setIsErrorDialogOpen(false)}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
