import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
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
  
  const restaurant = restaurants.find(r => r.id === restaurantId)

  if (!restaurant) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p className="font-heading text-2xl text-muted-foreground">
          Restaurant not found
        </p>
      </div>
    )
  }

  const galleryImages = [restaurant.coverImage, ...restaurant.galleryImages].filter(Boolean)

  return (
    <main className="pt-20">
      <section className="relative h-[70vh] overflow-hidden">
        {galleryImages.length > 0 && (
          <>
            <img
              src={galleryImages[currentImageIndex]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            {galleryImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-accent w-8'
                        : 'bg-card/50 hover:bg-card/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-semibold mb-4 tracking-wide">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="font-body text-lg text-muted-foreground italic">
              {restaurant.tagline}
            </p>
          )}
        </div>

        <div className="prose prose-lg max-w-none mb-16">
          <p className="font-body text-base leading-relaxed text-foreground/90 first-letter:text-6xl first-letter:font-heading first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-accent">
            {restaurant.story}
          </p>
        </div>
      </section>

      {restaurant.menuType === 'visual' && restaurant.menuItems && (
        <section className="container mx-auto px-6 pb-24">
          <VisualMenu 
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            menuItems={restaurant.menuItems}
            categories={restaurant.categories || []}
          />
        </section>
      )}

      {restaurant.menuType === 'tasting' && (
        <section className="container mx-auto px-6 pb-24">
          <TastingMenu 
            restaurantName={restaurant.name}
            description={restaurant.tastingMenuDescription || ''}
            menuItems={restaurant.menuItems || []}
          />
        </section>
      )}

      {restaurant.menuType === 'both' && (
        <section className="container mx-auto px-6 pb-24">
          <Tabs defaultValue="alacarte" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 bg-muted/50">
              <TabsTrigger 
                value="alacarte"
                className="font-body tracking-wider data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-accent"
              >
                À la Carte
              </TabsTrigger>
              <TabsTrigger 
                value="tasting"
                className="font-body tracking-wider data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-accent"
              >
                Chef's Tasting Menu
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
