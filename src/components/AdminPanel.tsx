import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { ArrowLeft, Plus, Trash, Upload, PencilSimple, Check, X } from '@phosphor-icons/react'
import type { Restaurant, MenuItem, MenuType } from '@/lib/types'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [restaurants = [], setRestaurants] = useKV<Restaurant[]>('restaurants', [])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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

  const saveRestaurant = () => {
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
      setRestaurants((current = []) => 
        current.map(r => r.id === restaurant.id ? restaurant : r)
      )
      toast.success('Restaurant updated')
    } else {
      setRestaurants((current = []) => [...current, restaurant])
      toast.success('Restaurant created')
    }

    setIsCreating(false)
    setSelectedRestaurant(null)
  }

  const deleteRestaurant = (id: string) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurants((current = []) => current.filter(r => r.id !== id))
      toast.success('Restaurant deleted')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-heading text-4xl font-semibold">
                Concierge Dashboard
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Manage restaurants and menus
              </p>
            </div>
          </div>
          
          <Button
            onClick={startCreating}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus size={20} weight="bold" className="mr-2" />
            New Restaurant
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-1">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Restaurants
            </h2>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {restaurants.length === 0 ? (
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
                          </p>
                        </div>
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
      </div>
    </div>
  )
}
