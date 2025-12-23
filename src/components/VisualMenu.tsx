import { useState } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { MenuItem, CartItem } from '@/lib/types'
import { toast } from 'sonner'

interface VisualMenuProps {
  restaurantId: string
  restaurantName: string
  menuItems: MenuItem[]
  categories: string[]
}

export default function VisualMenu({ 
  restaurantId, 
  restaurantName, 
  menuItems, 
  categories 
}: VisualMenuProps) {
  const [cartItems = [], setCartItems] = useKV<CartItem[]>('cart-items', [])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const addToCart = (menuItem: MenuItem) => {
    setCartItems((current = []) => {
      const existingItem = current.find(
        item => item.restaurantId === restaurantId && item.menuItem.id === menuItem.id
      )

      if (existingItem) {
        return current.map(item =>
          item.restaurantId === restaurantId && item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { restaurantId, restaurantName, menuItem, quantity: 1 }]
    })
    
    toast.success('Added to cart', {
      description: menuItem.name,
      duration: 2000,
    })
  }

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCartItems((current = []) => {
      const newItems = current.map(item => {
        if (item.restaurantId === restaurantId && item.menuItem.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]

      return newItems
    })
  }

  const getItemQuantity = (menuItemId: string) => {
    const item = cartItems.find(
      item => item.restaurantId === restaurantId && item.menuItem.id === menuItemId
    )
    return item?.quantity || 0
  }

  const categorizedItems = categories.length > 0
    ? categories.map(category => ({
        category,
        items: menuItems.filter(item => item.category === category)
      }))
    : [{ category: 'Menu', items: menuItems }]

  return (
    <div className="space-y-16">
      {categorizedItems.map(({ category, items }) => (
        <div key={category}>
          <h2 className="font-heading text-3xl font-semibold mb-8 text-center tracking-wide">
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const quantity = getItemQuantity(item.id)
              const isHovered = hoveredItem === item.id

              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border-border hover:shadow-md transition-all duration-300"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.image && (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-xl font-semibold">
                        {item.name}
                      </h3>
                      <span className="font-body text-lg font-medium text-muted-foreground ml-4">
                        ${item.price}
                      </span>
                    </div>

                    {item.description && (
                      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                        {item.description}
                      </p>
                    )}

                    {quantity === 0 ? (
                      <div
                        className={`transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Button
                          onClick={() => addToCart(item)}
                          variant="outline"
                          size="sm"
                          className="w-full border-accent text-accent-foreground hover:bg-accent/10"
                        >
                          <Plus size={16} weight="bold" className="mr-2" />
                          Add
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-accent/10 rounded-sm px-3 py-2">
                        <Button
                          onClick={() => updateQuantity(item.id, -1)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-accent/20"
                        >
                          <Minus size={16} weight="bold" />
                        </Button>
                        <span className="font-body font-medium text-lg">
                          {quantity}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.id, 1)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-accent/20"
                        >
                          <Plus size={16} weight="bold" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
