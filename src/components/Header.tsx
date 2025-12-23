import { ShoppingBag, UserCircle, ArrowLeft } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useKV } from '@github/spark/hooks'
import type { CartItem } from '@/lib/types'

interface HeaderProps {
  onAdminClick: () => void
  onLogoClick: () => void
  onCartClick: () => void
  showBackButton?: boolean
  onBackClick?: () => void
}

export default function Header({ 
  onAdminClick, 
  onLogoClick, 
  onCartClick,
  showBackButton,
  onBackClick 
}: HeaderProps) {
  const [cartItems = []] = useKV<CartItem[]>('cart-items', [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onBackClick}
                className="hover:bg-accent/10"
              >
                <ArrowLeft size={20} weight="regular" />
              </Button>
            )}
          </div>

          <button 
            onClick={onLogoClick}
            className="absolute left-1/2 -translate-x-1/2 text-center hover:opacity-70 transition-opacity"
          >
            <div className="font-heading text-2xl font-semibold tracking-wider">
              MERIDIEN
            </div>
            <div className="font-body text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
              Curated Dining for the High Seas
            </div>
          </button>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCartClick}
              className="relative hover:bg-accent/10"
            >
              <ShoppingBag size={22} weight="regular" />
              {cartItems.length > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs"
                >
                  {cartItems.length}
                </Badge>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={onAdminClick}
              className="hover:bg-accent/10"
            >
              <UserCircle size={22} weight="regular" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
