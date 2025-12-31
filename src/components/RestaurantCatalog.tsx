import { useDatabase } from '@/hooks/use-database'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLanguage } from '@/hooks/use-language'
import { t } from '@/lib/i18n'
import type { Restaurant } from '@/lib/types'
import RestaurantCard from './RestaurantCard'
import heroVideo from '@/assets/video/41347-429396488_medium.mp4'

interface RestaurantCatalogProps {
  onRestaurantSelect: (id: string) => void
}

export default function RestaurantCatalog({ onRestaurantSelect }: RestaurantCatalogProps) {
  const { restaurants, isLoading } = useDatabase()
  const isMobile = useIsMobile()
  const { language } = useLanguage()

  const visibleRestaurants = (restaurants || []).filter(r => !r.isHidden)

  console.log('🔍 RestaurantCatalog render:', {
    isLoading,
    totalRestaurants: restaurants?.length,
    visibleRestaurants: visibleRestaurants.length,
    language
  })

  return (
    <main className="pt-14 sm:pt-20">
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] overflow-hidden flex items-center justify-center">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-card tracking-wide leading-tight mb-4 sm:mb-6 whitespace-pre-line">
            {t('catalog.heroTitle', language)}
          </h1>
          <p className="font-body text-base sm:text-lg md:text-xl text-card/90 tracking-wide font-light px-4">
            {t('catalog.heroSubtitle', language)}
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-24 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-16 sm:py-24">
            <p className="font-heading text-xl sm:text-2xl text-muted-foreground mb-2">
              {t('common.loading', language)}
            </p>
          </div>
        ) : !visibleRestaurants || visibleRestaurants.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <p className="font-heading text-xl sm:text-2xl text-muted-foreground mb-2">
              {t('catalog.noRestaurants', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {visibleRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isWide={!isMobile && index % 3 === 0}
                onClick={() => onRestaurantSelect(restaurant.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
