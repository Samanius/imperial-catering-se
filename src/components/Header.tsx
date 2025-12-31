import { ShoppingBag, UserCircle, ArrowLeft } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useLanguage } from '@/hooks/use-language'
import { t } from '@/lib/i18n'

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
  const { totalItems } = useCart()
  const { language, toggleLanguage } = useLanguage()

  console.log('🔍 Header render - language:', language, 'totalItems:', totalItems)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onBackClick}
                className="hover:bg-accent/10 h-10 w-10 sm:h-9 sm:w-9 flex-shrink-0"
              >
                <ArrowLeft size={20} weight="regular" className="sm:hidden" />
                <ArrowLeft size={20} weight="regular" className="hidden sm:block" />
              </Button>
            )}
          </div>

          <button 
            onClick={onLogoClick}
            className="text-center hover:opacity-70 transition-opacity flex-shrink min-w-0"
          >
            <div className="font-heading text-lg sm:text-2xl font-semibold tracking-wider whitespace-nowrap">
              {t('header.title', language)}
            </div>
            <div className="font-body text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground uppercase mt-0.5 hidden sm:block">
              {t('header.subtitle', language)}
            </div>
          </button>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button
              onClick={toggleLanguage}
              className="font-body text-sm hover:text-accent transition-colors px-2 py-1"
              title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
            >
              {language === 'en' ? 'Русский' : 'English'}
            </button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={onCartClick}
              className="relative hover:bg-accent/10 h-10 w-10 sm:h-9 sm:w-9"
            >
              <ShoppingBag size={24} weight="regular" className="sm:hidden" />
              <ShoppingBag size={22} weight="regular" className="hidden sm:block" />
              {totalItems > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs font-medium"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={onAdminClick}
              className="hover:bg-accent/10 h-10 w-10 sm:h-9 sm:w-9"
            >
              <UserCircle size={24} weight="regular" className="sm:hidden" />
              <UserCircle size={22} weight="regular" className="hidden sm:block" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
