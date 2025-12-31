import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useLanguage } from '@/hooks/use-language'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { formatCurrency } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { Minus, Plus, ChefHat, UsersThree } from '@phosphor-icons/react'
import type { Restaurant, Cart } from '@/lib/types'
import { toast } from 'sonner'

interface ServiceSelectorProps {
  restaurant: Restaurant
}

export default function ServiceSelector({ restaurant }: ServiceSelectorProps) {
  const [cart, setCart] = useKV<Cart>('cart', { items: [], total: 0, services: [] })
  const { language } = useLanguage()
  
  const [chefSelected, setChefSelected] = useState(false)
  const [waiterCount, setWaiterCount] = useState(0)

  useEffect(() => {
    const existingService = cart?.services?.find(s => s.restaurantId === restaurant.id)
    if (existingService) {
      setChefSelected(existingService.chefService || false)
      setWaiterCount(existingService.waiterCount || 0)
    }
  }, [cart?.services, restaurant.id])

  const updateServices = (newChefSelected: boolean, newWaiterCount: number) => {
    setCart((currentCart) => {
      if (!currentCart) {
        currentCart = { items: [], total: 0, services: [] }
      }
      
      const services = currentCart.services || []
      const otherServices = services.filter(s => s.restaurantId !== restaurant.id)
      
      if (!newChefSelected && newWaiterCount === 0) {
        return {
          ...currentCart,
          items: currentCart.items || [],
          total: currentCart.total || 0,
          services: otherServices
        }
      }

      const newService = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        chefService: newChefSelected,
        waiterCount: newWaiterCount,
        chefServicePrice: restaurant.chefServicePrice,
        waiterServicePrice: restaurant.waiterServicePrice
      }

      return {
        ...currentCart,
        items: currentCart.items || [],
        total: currentCart.total || 0,
        services: [...otherServices, newService]
      }
    })
  }

  const handleChefToggle = (checked: boolean) => {
    setChefSelected(checked)
    updateServices(checked, waiterCount)
    if (checked) {
      toast.success(t('common.success', language))
    } else {
      toast.success(t('common.success', language))
    }
  }

  const handleWaiterChange = (delta: number) => {
    const newCount = Math.max(0, waiterCount + delta)
    setWaiterCount(newCount)
    updateServices(chefSelected, newCount)
    
    if (delta > 0) {
      toast.success(t('common.success', language))
    } else if (newCount === 0) {
      toast.success(t('common.success', language))
    } else {
      toast.success(t('common.success', language))
    }
  }

  const getTotalServiceCost = () => {
    let total = 0
    if (chefSelected && restaurant.chefServicePrice) {
      total += restaurant.chefServicePrice
    }
    if (waiterCount > 0 && restaurant.waiterServicePrice) {
      total += waiterCount * restaurant.waiterServicePrice
    }
    return total
  }

  return (
    <Card className="mb-12 sm:mb-16 p-4 sm:p-6 border border-border bg-card/50">
      <h3 className="font-heading text-lg sm:text-xl font-semibold mb-4">
        {t('restaurant.orderInformation', language)}
      </h3>
      
      <div className="space-y-6">
        {(restaurant.minimumOrderAmount || restaurant.orderDeadlineHours) && (
          <div className="space-y-2">
            {restaurant.minimumOrderAmount && (
              <p className="font-body text-sm sm:text-base text-foreground/90">
                <span className="text-muted-foreground">{t('restaurant.minimumOrder', language)}:</span> {formatCurrency(restaurant.minimumOrderAmount)}
              </p>
            )}
            {restaurant.orderDeadlineHours && (
              <p className="font-body text-sm sm:text-base text-foreground/90">
                <span className="text-muted-foreground">{t('restaurant.orderDeadline', language, { hours: restaurant.orderDeadlineHours.toString() })}</span>
              </p>
            )}
          </div>
        )}

        {(restaurant.minimumOrderAmount || restaurant.orderDeadlineHours) && (restaurant.chefServicePrice || restaurant.waiterServicePrice) && (
          <div className="border-t border-border pt-6" />
        )}

        {restaurant.chefServicePrice && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-sm bg-accent/10 text-accent">
                <ChefHat size={24} weight="duotone" />
              </div>
              <div>
                <Label htmlFor="chef-service" className="text-base font-medium cursor-pointer">
                  {t('restaurant.chefService', language)}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(restaurant.chefServicePrice)}
                </p>
              </div>
            </div>
            <Switch
              id="chef-service"
              checked={chefSelected}
              onCheckedChange={handleChefToggle}
            />
          </div>
        )}

        {restaurant.waiterServicePrice && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-sm bg-accent/10 text-accent">
                <UsersThree size={24} weight="duotone" />
              </div>
              <div>
                <Label className="text-base font-medium">
                  {t('restaurant.waiterService', language)}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(restaurant.waiterServicePrice)} {t('services.perWaiter', language)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleWaiterChange(-1)}
                disabled={waiterCount === 0}
                className="h-9 w-9"
              >
                <Minus size={16} weight="bold" />
              </Button>
              
              <div className="min-w-[60px] text-center">
                <span className="text-lg font-semibold">
                  {waiterCount}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleWaiterChange(1)}
                className="h-9 w-9"
              >
                <Plus size={16} weight="bold" />
              </Button>
            </div>
          </div>
        )}

        {getTotalServiceCost() > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-muted-foreground">
                {t('services.totalServiceCost', language)}:
              </span>
              <span className="font-heading text-lg font-semibold">
                {formatCurrency(getTotalServiceCost())}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
