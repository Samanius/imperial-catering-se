import { useKV } from '@github/spark/hooks'
import type { Restaurant } from '@/lib/types'
import RestaurantCard from './RestaurantCard'

interface RestaurantCatalogProps {
  onRestaurantSelect: (id: string) => void
}

export default function RestaurantCatalog({ onRestaurantSelect }: RestaurantCatalogProps) {
  const [restaurants = []] = useKV<Restaurant[]>('restaurants', [])

  return (
    <main className="pt-20">
      <section className="relative h-[85vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-background" />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.25_0.05_250),transparent_50%)]" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="font-heading text-6xl md:text-7xl font-semibold text-card tracking-wide leading-tight mb-6">
            Exquisite Dining.
            <br />
            Delivered to Deck.
          </h1>
          <p className="font-body text-lg md:text-xl text-card/90 tracking-wide font-light">
            Curated gastronomy from the world's finest establishments
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        {restaurants.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-heading text-2xl text-muted-foreground mb-2">
              Curated Experiences Arriving Soon
            </p>
            <p className="font-body text-sm text-muted-foreground tracking-wide">
              Our collection is being carefully assembled
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isWide={index % 3 === 0}
                onClick={() => onRestaurantSelect(restaurant.id)}
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          align-items: start;
        }
        
        @media (min-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </main>
  )
}
