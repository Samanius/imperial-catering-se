import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardProps {
  restaurant: Restaurant
  isWide?: boolean
  onClick: () => void
}

export default function RestaurantCard({ restaurant, isWide, onClick }: RestaurantCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

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
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="font-heading text-3xl sm:text-4xl text-muted-foreground opacity-20">
              {restaurant.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60" />
      </div>

      <div className="p-5 sm:p-6 md:p-8">
        <h3 className="font-heading text-2xl sm:text-3xl font-semibold mb-2 tracking-wide">
          {restaurant.name}
        </h3>
        
        {restaurant.tagline && (
          <p className="font-body text-sm text-muted-foreground italic mb-3 sm:mb-4">
            {restaurant.tagline}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.tags.map((tag, index) => (
            <span
              key={index}
              className="font-body text-xs tracking-wider text-muted-foreground uppercase"
            >
              {tag}
              {index < restaurant.tags.length - 1 && ' •'}
            </span>
          ))}
        </div>

        <div
          className={`transition-opacity duration-300 ${
            isMobile || isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            variant="outline"
            className="w-full border-accent text-accent-foreground hover:bg-accent/10 font-body tracking-wider h-11 sm:h-10 text-base sm:text-sm"
          >
            Explore Menu
          </Button>
        </div>
      </div>
    </Card>
  )
}
