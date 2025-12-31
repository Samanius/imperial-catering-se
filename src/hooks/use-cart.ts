import { useKV } from '@github/spark/hooks'
import { useCallback, useMemo } from 'react'
import type { CartItem, MenuItem } from '@/lib/types'

export function useCart() {
  const [cartItems, setCartItems] = useKV<CartItem[]>('cart-items', [])

  const safeCartItems = useMemo(() => {
    const items = Array.isArray(cartItems) ? cartItems : []
    return items.filter(item => {
      return item?.menuItem?.id && item?.restaurantId && item?.quantity > 0
    })
  }, [cartItems])

  const addToCart = useCallback((
    restaurantId: string,
    restaurantName: string,
    menuItem: MenuItem
  ) => {
    if (!menuItem?.id) {
      console.error('❌ Menu item is missing or has no ID:', menuItem)
      return
    }

    console.log('➕ Adding to cart:', { restaurantId, restaurantName, menuItem })

    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      console.log('📦 Current cart:', safeArray)
      
      const existingItem = safeArray.find(
        item => item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
      )

      if (existingItem) {
        console.log('🔄 Updating existing item quantity')
        const updated = safeArray.map(item =>
          item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        console.log('✅ Updated cart:', updated)
        return updated
      }

      console.log('🆕 Adding new item to cart')
      const updated = [...safeArray, { restaurantId, restaurantName, menuItem, quantity: 1 }]
      console.log('✅ Updated cart:', updated)
      return updated
    })
  }, [setCartItems])

  const updateQuantity = useCallback((
    restaurantId: string,
    menuItemId: string,
    delta: number
  ) => {
    console.log('🔢 Updating quantity:', { restaurantId, menuItemId, delta })
    
    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.map(item => {
        if (item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
      
      console.log('✅ Quantity updated:', updated)
      return updated
    })
  }, [setCartItems])

  const removeItem = useCallback((restaurantId: string, menuItemId: string) => {
    console.log('🗑️ Removing item:', { restaurantId, menuItemId })
    
    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.filter(
        item => !(item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId)
      )
      
      console.log('✅ Item removed, new cart:', updated)
      return updated
    })
  }, [setCartItems])

  const getItemQuantity = useCallback((restaurantId: string, menuItemId: string) => {
    const item = safeCartItems.find(
      item => item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId
    )
    return item ? item.quantity : 0
  }, [safeCartItems])

  const totalItems = useMemo(() => {
    return safeCartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [safeCartItems])

  const totalPrice = useMemo(() => {
    return safeCartItems.reduce((sum, item) => {
      if (item?.menuItem?.price && item?.quantity) {
        return sum + (item.menuItem.price * item.quantity)
      }
      return sum
    }, 0)
  }, [safeCartItems])

  const groupedByRestaurant = useMemo(() => {
    return safeCartItems.reduce((acc, item) => {
      if (!item?.restaurantId || !item?.menuItem) return acc
      
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        }
      }
      acc[item.restaurantId].items.push(item)
      return acc
    }, {} as Record<string, { restaurantName: string; items: CartItem[] }>)
  }, [safeCartItems])

  const clearCart = useCallback(() => {
    console.log('🧹 Clearing cart')
    setCartItems([])
  }, [setCartItems])

  return {
    cartItems: safeCartItems,
    addToCart,
    updateQuantity,
    removeItem,
    getItemQuantity,
    totalItems,
    totalPrice,
    groupedByRestaurant,
    clearCart
  }
}
