import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useIsMobile } from '@/hooks/use-mobile'
import type { MenuItem } from '@/lib/types'
import { WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TastingMenuProps {
  restaurantName: string
  description: string
  menuItems: MenuItem[]
}

export default function TastingMenu({ restaurantName, description, menuItems }: TastingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const isMobile = useIsMobile()

  const handleConciergeOrder = () => {
    if (!orderMessage.trim()) {
      toast.error('Please enter your order details')
      return
    }

    const whatsappNumber = '971528355939'
    const message = `*MERIDIEN YACHT CATERING*%0A*Concierge Order*%0A%0A*Restaurant:* ${restaurantName}%0A*Request:* ${encodeURIComponent(orderMessage)}`
    
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    setIsOpen(false)
    setOrderMessage('')
    toast.success('Opening WhatsApp...')
  }

  const categorizedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="linen-texture bg-card border border-accent/20 shadow-lg rounded-sm p-6 sm:p-10 md:p-12 lg:p-16">
        {description && (
          <div className="text-center mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-accent/30">
            <p className="font-body text-sm sm:text-base leading-relaxed text-foreground/80 italic">
              {description}
            </p>
          </div>
        )}

        {Object.entries(categorizedItems).map(([category, items], index) => (
          <div key={category} className="mb-8 sm:mb-10">
            <div className="text-center mb-5 sm:mb-6">
              <h3 className="font-heading text-xl sm:text-2xl font-semibold tracking-wider uppercase relative inline-block">
                <span className="relative z-10 px-3 sm:px-4 bg-card">{category}</span>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/40 -translate-y-1/2" />
              </h3>
            </div>

            <div className="space-y-5 sm:space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-base sm:text-lg font-medium mb-1">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="font-body text-sm sm:text-base text-muted-foreground whitespace-nowrap flex-shrink-0 ml-2 sm:ml-4">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>

            {index < Object.entries(categorizedItems).length - 1 && (
              <div className="mt-7 sm:mt-8 h-px bg-accent/20" />
            )}
          </div>
        ))}

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-accent/30 text-center">
          <p className="font-heading text-xs sm:text-sm italic text-muted-foreground">
            Chef's signature
          </p>
        </div>
      </div>

      <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-8 left-1/2 -translate-x-1/2'} z-40`}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size={isMobile ? "default" : "lg"}
              className={`${isMobile ? 'w-full h-12 text-base' : ''} bg-accent text-accent-foreground hover:bg-accent/90 font-body tracking-wider shadow-xl active:scale-[0.98] transition-transform`}
            >
              Concierge Order
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl sm:text-2xl">
                Concierge Service
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="order-message" className="font-body text-sm">
                  Describe your dining experience
                </Label>
                <Textarea
                  id="order-message"
                  placeholder="I would like the Tasting Menu for 4 guests on Friday evening..."
                  value={orderMessage}
                  onChange={(e) => setOrderMessage(e.target.value)}
                  rows={isMobile ? 5 : 6}
                  className="font-body resize-none text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground font-body">
                  Our concierge will personally arrange your experience
                </p>
              </div>

              <Button
                onClick={handleConciergeOrder}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body tracking-wider h-11 sm:h-10 text-sm sm:text-base active:scale-[0.98] transition-transform"
              >
                <WhatsappLogo size={22} weight="fill" className="mr-2 sm:hidden" />
                <WhatsappLogo size={20} weight="fill" className="mr-2 hidden sm:block" />
                Send via WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
