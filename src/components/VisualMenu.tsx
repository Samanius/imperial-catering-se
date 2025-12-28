import { useState } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'
import { useCart } from '@/hooks/use-cart'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { MenuItem } from '@/lib/types'
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
  const { addToCart, updateQuantity, getItemQuantity } = useCart()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const handleAddToCart = (menuItem: MenuItem) => {
    addToCart(restaurantId, restaurantName, menuItem)
    toast.success('Added to cart', {
      description: menuItem.name,
      duration: 2000,
    })
  }

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    updateQuantity(restaurantId, menuItemId, delta)
  }

  const categorizedItems = categories.length > 0
    ? categories.map(category => ({
        category,
        items: menuItems.filter(item => item.category === category)
      }))
    : [{ category: 'Menu', items: menuItems }]

  return (
    <div className="space-y-12 sm:space-y-16 max-w-7xl mx-auto">
      {categorizedItems.map(({ category, items }) => (
        <div key={category}>
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center tracking-wide">
            {category}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {items.map((item) => {
              const quantity = getItemQuantity(restaurantId, item.id)
              const isHovered = hoveredItem === item.id

              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border-border hover:shadow-md transition-all duration-300 flex flex-col"
                  onMouseEnter={() => !isMobile && setHoveredItem(item.id)}
                  onMouseLeave={() => !isMobile && setHoveredItem(null)}
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

                  <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-heading text-lg sm:text-xl font-semibold flex-1">
                        {item.name}
                      </h3>
                      <span className="font-body text-base sm:text-lg font-medium text-muted-foreground flex-shrink-0">
                        ${item.price}
                      </span>
                    </div>

                    {item.weight && (
                      <p className="font-body text-xs sm:text-sm text-accent-foreground mb-1">
                        {item.weight} g
                      </p>
                    )}

                    {item.description && (
                      <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      {quantity === 0 ? (
                        <div
                          className={`transition-opacity duration-300 ${
                            isMobile || isHovered ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <Button
                            onClick={() => handleAddToCart(item)}
                            variant="outline"
                            size="sm"
                            className="w-full border-accent text-accent-foreground hover:bg-accent/10 h-10 sm:h-9 text-sm"
                          >
                            <Plus size={18} weight="bold" className="mr-2 sm:hidden" />
                            <Plus size={16} weight="bold" className="mr-2 hidden sm:block" />
                            Add
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-accent/10 rounded-sm px-3 py-2.5 sm:py-2">
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 hover:bg-accent/20"
                          >
                            <Minus size={18} weight="bold" className="sm:hidden" />
                            <Minus size={16} weight="bold" className="hidden sm:block" />
                          </Button>
                          <span className="font-body font-medium text-lg">
                            {quantity}
                          </span>
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 hover:bg-accent/20"
                          >
                            <Plus size={18} weight="bold" className="sm:hidden" />
                            <Plus size={16} weight="bold" className="hidden sm:block" />
                          </Button>
                        </div>
                      )}
                    </div>
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
