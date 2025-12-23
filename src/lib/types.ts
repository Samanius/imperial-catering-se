export type MenuType = 'visual' | 'tasting' | 'both'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  weight?: number
}

export interface Restaurant {
  id: string
  name: string
  tagline: string
  tags: string[]
  description: string
  story: string
  menuType: MenuType
  coverImage: string
  galleryImages: string[]
  menuItems?: MenuItem[]
  tastingMenuDescription?: string
  categories?: string[]
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
}
