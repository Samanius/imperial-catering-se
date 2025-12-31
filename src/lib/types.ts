export type MenuType = 'visual' | 'tasting' | 'both'

export interface MenuItem {
  id: string
  name: string
  name_ru?: string
  description: string
  description_ru?: string
  price: number
  image?: string
  category: string
  category_ru?: string
  weight?: number
}

export interface Restaurant {
  id: string
  name: string
  name_ru?: string
  tagline: string
  tagline_ru?: string
  tags: string[]
  tags_ru?: string[]
  description: string
  description_ru?: string
  story: string
  story_ru?: string
  menuType: MenuType
  coverImage: string
  galleryImages: string[]
  menuItems?: MenuItem[]
  tastingMenuDescription?: string
  tastingMenuDescription_ru?: string
  categories?: string[]
  categories_ru?: string[]
  minimumOrderAmount?: number
  orderDeadlineHours?: number
  chefServicePrice?: number
  waiterServicePrice?: number
  isHidden?: boolean
}

export interface CartItem {
  restaurantId: string
  restaurantName: string
  menuItem: MenuItem
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
  services?: {
    restaurantId: string
    restaurantName: string
    chefService?: boolean
    waiterCount?: number
    chefServicePrice?: number
    waiterServicePrice?: number
  }[]
}
