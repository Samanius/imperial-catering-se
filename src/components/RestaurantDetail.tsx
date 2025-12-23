import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Restaurant } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import VisualMenu from './VisualMenu'
import TastingMenu from './TastingMenu'

interface RestaurantDetailProps {
  restaurantId: string
}

export default function RestaurantDetail({ restaurantId }: RestaurantDetailProps) {
  const [restaurants = []] = useKV<Restaurant[]>('restaurants', [])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isMobile = useIsMobile()
  
  const restaurant = restaurants.find(r => r.id === restaurantId)

  if (!restaurant) {
    return (
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 text-center px-4">
        <p className="font-heading text-xl sm:text-2xl text-muted-foreground">
          Restaurant not found
        </p>
      </div>
    )
  }

  const galleryImages = [restaurant.coverImage, ...restaurant.galleryImages].filter(Boolean)

  return (
    <main className="pt-14 sm:pt-20">
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
        {galleryImages.length > 0 && (
          <>
            <img
              src={galleryImages[currentImageIndex]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            {galleryImages.length > 1 && (
              <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-accent w-8'
                        : 'bg-card/50 hover:bg-card/70 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="px-4 sm:px-6 py-10 sm:py-12 md:py-16 max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4 tracking-wide px-4">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="font-body text-base sm:text-lg text-muted-foreground italic px-4">
              {restaurant.tagline}
            </p>
          )}
        </div>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-12 sm:mb-16">
          <p className="font-body text-sm sm:text-base leading-relaxed text-foreground/90 px-2 first-letter:text-4xl sm:first-letter:text-5xl md:first-letter:text-6xl first-letter:font-heading first-letter:font-semibold first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:leading-none first-letter:text-accent first-letter:mt-1">
            {restaurant.story}
          </p>
        </div>
      </section>

      {restaurant.menuType === 'visual' && restaurant.menuItems && (
        <section className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24">
          <VisualMenu 
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            menuItems={restaurant.menuItems}
            categories={restaurant.categories || []}
          />
        </section>
      )}

      {restaurant.menuType === 'tasting' && (
        <section className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24">
          <TastingMenu 
            restaurantName={restaurant.name}
            description={restaurant.tastingMenuDescription || ''}
            menuItems={restaurant.menuItems || []}
          />
        </section>
      )}

      {restaurant.menuType === 'both' && (
        <section className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24 max-w-7xl mx-auto">
          <Tabs defaultValue="alacarte" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 sm:mb-12 bg-muted/50 h-auto p-1">
              <TabsTrigger 
                value="alacarte"
                className="font-body text-xs sm:text-sm tracking-wider data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-accent py-3 px-2"
              >
                À la Carte
              </TabsTrigger>
              <TabsTrigger 
                value="tasting"
                className="font-body text-xs sm:text-sm tracking-wider data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-accent py-3 px-2"
              >
                {isMobile ? "Tasting Menu" : "Chef's Tasting Menu"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alacarte">
              {restaurant.menuItems && (
                <VisualMenu 
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                  menuItems={restaurant.menuItems}
                  categories={restaurant.categories || []}
                />
              )}
            </TabsContent>

            <TabsContent value="tasting">
              <TastingMenu 
                restaurantName={restaurant.name}
                description={restaurant.tastingMenuDescription || ''}
                menuItems={restaurant.menuItems || []}
              />
            </TabsContent>
          </Tabs>
        </section>
      )}
    </main>
  )
}
