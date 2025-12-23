import { useKV } from '@github/spark/hooks'
import { useIsMobile } from '@/hooks/use-mobile'
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
  const isMobile = useIsMobile()

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
        const weight = item.menuItem.weight ? ` (${item.menuItem.weight} g)` : ''
        message += `• ${item.quantity}x ${item.menuItem.name}${weight} - $${(item.menuItem.price * item.quantity).toFixed(2)}%0A`
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
      <DrawerContent className={`${isMobile ? 'h-[95vh]' : 'h-[90vh]'} flex flex-col`}>
        <DrawerHeader className="border-b border-border px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-heading text-xl sm:text-2xl">
              Your Selection
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent/10 h-9 w-9"
            >
              <X size={22} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
            </Button>
          </div>
        </DrawerHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 sm:p-8">
            <div>
              <p className="font-heading text-xl sm:text-2xl text-muted-foreground mb-2">
                Your Voyage Begins Here
              </p>
              <p className="font-body text-sm text-muted-foreground px-4">
                Select items from our curated restaurants
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                  {Object.entries(groupedByRestaurant).map(([restaurantId, { restaurantName, items }]) => (
                    <div key={restaurantId}>
                      <h3 className="font-heading text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                        {restaurantName}
                      </h3>
                      
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.menuItem.id} className="flex gap-3 sm:gap-4">
                            {item.menuItem.image && (
                              <img
                                src={item.menuItem.image}
                                alt={item.menuItem.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-sm flex-shrink-0"
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <h4 className="font-body font-medium text-sm sm:text-base line-clamp-2 flex-1">
                                  {item.menuItem.name}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.restaurantId, item.menuItem.id)}
                                  className="h-7 w-7 sm:h-6 sm:w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                                >
                                  <X size={16} className="sm:hidden" />
                                  <X size={14} className="hidden sm:block" />
                                </Button>
                              </div>
                              {item.menuItem.weight && (
                                <p className="font-body text-xs text-muted-foreground mb-2">
                                  {item.menuItem.weight} g
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-muted rounded-sm">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(item.restaurantId, item.menuItem.id, -1)}
                                    className="h-8 w-8 sm:h-7 sm:w-7"
                                  >
                                    <Minus size={14} weight="bold" className="sm:hidden" />
                                    <Minus size={12} weight="bold" className="hidden sm:block" />
                                  </Button>
                                  <span className="font-body text-sm w-8 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(item.restaurantId, item.menuItem.id, 1)}
                                    className="h-8 w-8 sm:h-7 sm:w-7"
                                  >
                                    <Plus size={14} weight="bold" className="sm:hidden" />
                                    <Plus size={12} weight="bold" className="hidden sm:block" />
                                  </Button>
                                </div>
                                
                                <span className="font-body text-sm sm:text-base font-medium flex-shrink-0">
                                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="mt-5 sm:mt-6" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="border-t border-border p-4 sm:p-6 space-y-4 bg-background flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="font-heading text-lg sm:text-xl">Total</span>
                <span className="font-heading text-xl sm:text-2xl font-semibold">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleSendOrder}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body tracking-wider h-12 sm:h-12 text-base active:scale-[0.98] transition-transform"
              >
                <WhatsappLogo size={26} weight="fill" className="mr-2 sm:hidden" />
                <WhatsappLogo size={24} weight="fill" className="mr-2 hidden sm:block" />
                Send Order via WhatsApp
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
