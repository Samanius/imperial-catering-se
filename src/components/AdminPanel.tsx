import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { useDatabase } from '@/hooks/use-database'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, Trash, PencilSimple, Check, X, Eye, EyeSlash, FileArrowDown, SpinnerGap, ArrowsClockwise, UploadSimple, Image as ImageIcon } from '@phosphor-icons/react'
import type { Restaurant, MenuItem, MenuType } from '@/lib/types'
import { toast } from 'sonner'
import { processImageUpload } from '@/lib/file-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { createBackup } from '@/lib/backup'
import { importFromGoogleSheets, extractSpreadsheetId } from '@/lib/google-sheets-import'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import DatabaseSetup from './DatabaseSetup'
import TranslationsEditor from './TranslationsEditor'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const database = useDatabase()
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'restaurants' | 'database' | 'translations'>('restaurants')
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [googleSheetUrl, setGoogleSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1my60zyjTGdDaY0sen9WAxCWooP7EDPneRTzwVDxoxEQ/edit?gid=0#gid=0')
  const [googleApiKey, setGoogleApiKey] = useKV<string>('google-sheets-api-key', 'AIzaSyDX3Morf9Oeg-ANaP4ABE_irlIRbqMsSyE')
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
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingMenuItem, setIsUploadingMenuItem] = useState(false)
  const [isDraggingCover, setIsDraggingCover] = useState(false)
  const [isDraggingMenuItem, setIsDraggingMenuItem] = useState(false)
  const [isDraggingEditItem, setIsDraggingEditItem] = useState(false)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (googleApiKey) {
      setApiKeyInput(googleApiKey)
    } else {
      const defaultKey = 'AIzaSyDX3Morf9Oeg-ANaP4ABE_irlIRbqMsSyE'
      setApiKeyInput(defaultKey)
      setGoogleApiKey(defaultKey)
    }
  }, [])

  const startCreating = () => {
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

    if (!database.hasWriteAccess) {
      toast.error('No write access. Please configure GitHub token in Database tab.')
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

    console.log('💾 Saving restaurant:', restaurant.name)
    console.log('📸 Cover image:', restaurant.coverImage ? `${restaurant.coverImage.substring(0, 50)}... (${restaurant.coverImage.length} chars)` : 'No image')

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
      console.error('❌ Failed to save restaurant:', error)
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

  const handleCoverImageSelect = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setIsUploadingCover(true)
    try {
      const base64Image = await processImageUpload(file)
      setFormData(prev => ({ ...prev, coverImage: base64Image }))
      toast.success('Cover image uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleCoverImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleCoverImageSelect(e.target.files)
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleCoverImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCover(false)

    await handleCoverImageSelect(e.dataTransfer.files)
  }

  const handleCoverImageDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCover(true)
  }

  const handleCoverImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingCover(false)
  }

  const handleCoverImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMenuItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    setIsUploadingMenuItem(true)
    try {
      const base64Image = await processImageUpload(file)
      setNewMenuItem(prev => ({ ...prev, image: base64Image }))
      toast.success('Image uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploadingMenuItem(false)
    }
  }

  const handleMenuItemImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingMenuItem(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setIsUploadingMenuItem(true)
    try {
      const base64Image = await processImageUpload(file)
      setNewMenuItem(prev => ({ ...prev, image: base64Image }))
      toast.success('Image uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploadingMenuItem(false)
    }
  }

  const handleMenuItemDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingMenuItem(true)
  }

  const handleMenuItemDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingMenuItem(false)
  }

  const handleMenuItemDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleEditingItemImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingEditItem(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    try {
      const base64Image = await processImageUpload(file)
      setEditingItemData(prev => prev ? ({ ...prev, image: base64Image }) : null)
      toast.success('Image uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    }
  }

  const handleEditingItemDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingEditItem(true)
  }

  const handleEditingItemDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingEditItem(false)
  }

  const handleEditingItemDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
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
      setGoogleApiKey((current) => trimmedApiKey)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (!database.hasWriteAccess) {
      toast.error('Database not configured. Please set up database first.', { 
        duration: 5000,
        action: {
          label: 'Go to Database',
          onClick: () => setActiveTab('database')
        }
      })
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const result = await importFromGoogleSheets(spreadsheetId, database.restaurants || [], trimmedApiKey)
      
      console.log('Import result:', result)
      console.log('Errors array:', result.errors)

      const hasChanges = result.addedCount > 0 || result.updatedCount > 0

      if (hasChanges) {
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
                        Google Sheets API Key
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Create API key at{' '}
                        <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
                          console.cloud.google.com
                        </a>
                        {' '}→ APIs & Services → Credentials → Create Credentials → API Key
                      </p>
                      <p className="text-xs text-destructive mt-2">
                        ⚠️ Enable "Google Sheets API" in your project before using the key
                      </p>
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
                      {googleApiKey && googleApiKey === apiKeyInput && (
                        <p className="text-xs text-accent-foreground font-medium flex items-center gap-1">
                          <Check size={14} weight="bold" />
                          API key saved
                        </p>
                      )}
                    </div>

                    <Card className="p-4 bg-muted/30 border-accent/20">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        <strong className="text-foreground">Sheet Structure:</strong>
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Each sheet = one restaurant (sheet name = restaurant name)</li>
                        <li>First row can be headers (skipped automatically)</li>
                        <li>Column A: Item Name (required)</li>
                        <li>Column B: Description (optional)</li>
                        <li>Column C: Price (required)</li>
                        <li>Column D: Category (optional)</li>
                        <li>Column E: Weight in grams (optional)</li>
                        <li>Column F: Image URL (optional)</li>
                      </ul>
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
                        ⚠️ Spreadsheet must be shared as "Anyone with the link can view"
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'restaurants' | 'database' | 'translations')} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
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
                      <Label htmlFor="coverImage">Cover Image</Label>
                      <div className="space-y-3">
                        <input
                          ref={coverImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageInputChange}
                          className="hidden"
                        />
                        {!formData.coverImage ? (
                          <div
                            onClick={() => coverImageInputRef.current?.click()}
                            onDrop={handleCoverImageDrop}
                            onDragOver={handleCoverImageDragOver}
                            onDragEnter={handleCoverImageDragEnter}
                            onDragLeave={handleCoverImageDragLeave}
                            className={`relative border-2 border-dashed rounded-sm p-6 transition-colors cursor-pointer ${
                              isDraggingCover 
                                ? 'border-accent bg-accent/10' 
                                : 'border-border hover:border-accent hover:bg-accent/5'
                            } ${isUploadingCover ? 'pointer-events-none opacity-75' : ''}`}
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              {isUploadingCover ? (
                                <>
                                  <SpinnerGap size={32} className="animate-spin text-accent" />
                                  <p className="text-sm text-muted-foreground">Uploading...</p>
                                </>
                              ) : (
                                <>
                                  <UploadSimple size={32} className="text-muted-foreground" />
                                  <p className="text-sm font-medium text-foreground">
                                    Drag and drop image here or click to browse
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    JPG, PNG, WebP, or GIF (max 5MB)
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-sm overflow-hidden border border-border">
                            <img 
                              src={formData.coverImage} 
                              alt="Cover preview" 
                              className="w-full h-48 object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                              className="absolute top-2 right-2"
                            >
                              <Trash size={16} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
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
                        <Label htmlFor="minimumOrderAmount">Minimum Order Amount (د.إ)</Label>
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
                        <Label htmlFor="chefServicePrice">Chef Service Price (د.إ)</Label>
                        <Input
                          id="chefServicePrice"
                          type="number"
                          value={formData.chefServicePrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, chefServicePrice: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="waiterServicePrice">Waiter Service Price (د.إ per waiter)</Label>
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
                        <div className="md:col-span-2 space-y-2">
                          {!newMenuItem.image ? (
                            <div
                              onDrop={handleMenuItemImageDrop}
                              onDragOver={handleMenuItemDragOver}
                              onDragEnter={handleMenuItemDragEnter}
                              onDragLeave={handleMenuItemDragLeave}
                              className={`relative border-2 border-dashed rounded-sm p-4 transition-colors cursor-pointer ${
                                isDraggingMenuItem 
                                  ? 'border-accent bg-accent/10' 
                                  : 'border-border hover:border-accent hover:bg-accent/5'
                              } ${isUploadingMenuItem ? 'pointer-events-none opacity-75' : ''}`}
                            >
                              <div className="flex items-center justify-center gap-3">
                                {isUploadingMenuItem ? (
                                  <>
                                    <SpinnerGap size={24} className="animate-spin text-accent" />
                                    <p className="text-xs text-muted-foreground">Uploading...</p>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon size={24} className="text-muted-foreground" />
                                    <div>
                                      <p className="text-xs font-medium text-foreground">
                                        Drag and drop image
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        JPG, PNG, WebP, GIF (max 5MB)
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="relative rounded-sm overflow-hidden border border-border">
                              <img 
                                src={newMenuItem.image} 
                                alt="Menu item preview" 
                                className="w-full h-32 object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setNewMenuItem(prev => ({ ...prev, image: '' }))}
                                className="absolute top-2 right-2"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
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
                                  <Label className="text-xs">Image</Label>
                                  {!editingItemData.image ? (
                                    <div
                                      onDrop={handleEditingItemImageDrop}
                                      onDragOver={handleEditingItemDragOver}
                                      onDragEnter={handleEditingItemDragEnter}
                                      onDragLeave={handleEditingItemDragLeave}
                                      className={`relative border-2 border-dashed rounded-sm p-4 transition-colors cursor-pointer ${
                                        isDraggingEditItem 
                                          ? 'border-accent bg-accent/10' 
                                          : 'border-border hover:border-accent hover:bg-accent/5'
                                      }`}
                                    >
                                      <div className="flex items-center justify-center gap-3">
                                        <ImageIcon size={24} className="text-muted-foreground" />
                                        <div>
                                          <p className="text-xs font-medium text-foreground">
                                            Drag and drop image
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            JPG, PNG, WebP, GIF (max 5MB)
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative rounded-sm overflow-hidden border border-border">
                                      <img 
                                        src={editingItemData.image} 
                                        alt="Menu item preview" 
                                        className="w-full h-32 object-cover"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setEditingItemData(prev => prev ? ({ ...prev, image: '' }) : null)}
                                        className="absolute top-2 right-2"
                                      >
                                        <Trash size={14} />
                                      </Button>
                                    </div>
                                  )}
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
                              <div className="flex gap-3 flex-1 min-w-0">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded-sm border border-border flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.category}</p>
                                  <div className="flex gap-2 items-center text-sm font-medium">
                                    {item.weight && (
                                      <span className="text-muted-foreground">{item.weight} g</span>
                                    )}
                                    <span className="text-accent">{formatCurrency(item.price)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
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
                hasWriteAccess={database.hasWriteAccess}
              />
              
              {database.isConfigured && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Refresh Database</p>
                        <p className="text-sm text-muted-foreground">Load latest data from cloud</p>
                      </div>
                      <Button 
                        onClick={async () => {
                          try {
                            const loadingToast = toast.loading('Refreshing database...')
                            await database.refresh()
                            toast.dismiss(loadingToast)
                            toast.success('Database refreshed successfully!')
                          } catch (error: any) {
                            toast.error(error.message || 'Failed to refresh database')
                          }
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        <ArrowsClockwise size={16} className="mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="translations" className="mt-0">
            <TranslationsEditor />
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
