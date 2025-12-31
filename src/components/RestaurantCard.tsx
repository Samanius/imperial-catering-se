import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLanguage } from '@/hooks/use-language'
import { formatCurrency, getLocalizedText, getLocalizedArray } from '@/lib/utils'
import { t } from '@/lib/i18n'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardProps {
  restaurant: Restaurant
  isWide?: boolean
  onClick: () => void
}

export default function RestaurantCard({ restaurant, isWide, onClick }: RestaurantCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()
  const { language } = useLanguage()

  const name = getLocalizedText(restaurant, 'name', language)
  const tagline = getLocalizedText(restaurant, 'tagline', language)
  const tags = getLocalizedArray(restaurant, 'tags', language)

  console.log('🔍 RestaurantCard render:', { 
    restaurantName: restaurant.name, 
    language, 
    localizedName: name,
    hasCoverImage: !!restaurant.coverImage 
  })

  useEffect(() => {
    if (restaurant.coverImage) {
      console.log(`🖼️ Restaurant "${restaurant.name}" has cover image: ${restaurant.coverImage.substring(0, 50)}... (${restaurant.coverImage.length} chars)`)
    } else {
      console.warn(`⚠️ Restaurant "${restaurant.name}" has NO cover image`)
    }
  }, [restaurant])

  return (
    <Card
      className={`group relative overflow-hidden border-border hover:shadow-lg transition-all duration-500 cursor-pointer ${
        isWide && !isMobile ? 'lg:col-span-2' : ''
      }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="font-heading text-3xl sm:text-4xl text-muted-foreground opacity-20">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60" />
      </div>

      <div className="p-5 sm:p-6 md:p-8">
        <h3 className="font-heading text-2xl sm:text-3xl font-semibold mb-2 tracking-wide">
          {name}
        </h3>
        
        {tagline && (
          <p className="font-body text-sm text-muted-foreground italic mb-3 sm:mb-4">
            {tagline}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="font-body text-xs tracking-wider text-muted-foreground uppercase"
            >
              {tag}
              {index < tags.length - 1 && ' •'}
            </span>
          ))}
        </div>

        {(restaurant.minimumOrderAmount || restaurant.orderDeadlineHours) && (
          <div className="mb-4 space-y-1">
            {restaurant.minimumOrderAmount && (
              <p className="font-body text-xs text-muted-foreground">
                {t('restaurant.minimumOrder', language)}: {formatCurrency(restaurant.minimumOrderAmount)}
              </p>
            )}
            {restaurant.orderDeadlineHours && (
              <p className="font-body text-xs text-muted-foreground">
                {t('restaurant.orderDeadline', language, { hours: restaurant.orderDeadlineHours.toString() })}
              </p>
            )}
          </div>
        )}

        {(restaurant.chefServicePrice || restaurant.waiterServicePrice) && (
          <div className="mb-4">
            <p className="font-body text-xs text-accent font-medium">
              {restaurant.chefServicePrice && restaurant.waiterServicePrice
                ? t('restaurant.chefAndWaiterAvailable', language)
                : restaurant.chefServicePrice
                ? t('restaurant.chefServiceAvailable', language)
                : t('restaurant.waiterServiceAvailable', language)}
            </p>
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ${
            isMobile || isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            variant="outline"
            className="w-full border-accent text-accent-foreground hover:bg-accent/10 font-body tracking-wider h-11 sm:h-10 text-base sm:text-sm"
          >
            {t('restaurant.exploreMenu', language)}
          </Button>
        </div>
      </div>
    </Card>
  )
}
