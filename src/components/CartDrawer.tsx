import { useKV } from '@github/spark/hooks'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { X, Plus, Minus, WhatsappLogo } from '@phosphor-icons/react'
import type { CartItem } from '@/lib/types'
import { toast } from 'sonner'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems = [], setCartItems] = useKV<CartItem[]>('cart-items', [])

  const updateQuantity = (restaurantId: string, menuItemId: string, delta: number) => {
    setCartItems((current = []) => {
      return current.map(item => {
        if (item.restaurantId === restaurantId && item.menuItem.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeItem = (restaurantId: string, menuItemId: string) => {
    setCartItems((current = []) => {
      return current.filter(
        item => !(item.restaurantId === restaurantId && item.menuItem.id === menuItemId)
      )
    })
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  }

  const groupedByRestaurant = cartItems.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      }
    }
    acc[item.restaurantId].items.push(item)
    return acc
  }, {} as Record<string, { restaurantName: string; items: CartItem[] }>)

  const handleSendOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    let message = '*MERIDIEN YACHT CATERING*%0A*Order Summary*%0A%0A'

    Object.values(groupedByRestaurant).forEach(({ restaurantName, items }) => {
      message += `*${restaurantName}*%0A`
      items.forEach(item => {
        message += `• ${item.quantity}x ${item.menuItem.name} - $${(item.menuItem.price * item.quantity).toFixed(2)}%0A`
      })
      message += '%0A'
    })

    message += `*Total: $${calculateTotal().toFixed(2)}*`

    const whatsappNumber = '971528355939'
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    
    toast.success('Opening WhatsApp...')
  }

  const total = calculateTotal()

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-heading text-2xl">
              Your Selection
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent/10"
            >
              <X size={20} />
            </Button>
          </div>
        </DrawerHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <p className="font-heading text-2xl text-muted-foreground mb-2">
                Your Voyage Begins Here
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Select items from our curated restaurants
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {Object.entries(groupedByRestaurant).map(([restaurantId, { restaurantName, items }]) => (
                  <div key={restaurantId}>
                    <h3 className="font-heading text-xl font-semibold mb-4">
                      {restaurantName}
                    </h3>
                    
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.menuItem.id} className="flex gap-4">
                          {item.menuItem.image && (
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              className="w-20 h-20 object-cover rounded-sm"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-body font-medium text-sm truncate">
                                {item.menuItem.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.restaurantId, item.menuItem.id)}
                                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0 ml-2"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-muted rounded-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateQuantity(item.restaurantId, item.menuItem.id, -1)}
                                  className="h-7 w-7"
                                >
                                  <Minus size={12} weight="bold" />
                                </Button>
                                <span className="font-body text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateQuantity(item.restaurantId, item.menuItem.id, 1)}
                                  className="h-7 w-7"
                                >
                                  <Plus size={12} weight="bold" />
                                </Button>
                              </div>
                              
                              <span className="font-body text-sm font-medium">
                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="mt-6" />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-heading text-xl">Total</span>
                <span className="font-heading text-2xl font-semibold">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleSendOrder}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body tracking-wider h-12 text-base"
              >
                <WhatsappLogo size={24} weight="fill" className="mr-2" />
                Send Order via WhatsApp
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
