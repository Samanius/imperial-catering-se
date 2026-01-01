import { useCallback, useMemo } from 'react'
import { useApp } from '@/state/AppProvider'
import type { CartItem, MenuItem } from '@/lib/types'

export function useCart() {
  const { cart, setCart } = useApp()

  const safeCartItems = useMemo(() => {
    const items = Array.isArray(cart) ? cart : []
    return items.filter(item => {
      return item?.menuItem?.id && item?.restaurantId && item?.quantity > 0
    })
  }, [cart])

  const addToCart = useCallback((
    restaurantId: string,
    restaurantName: string,
    menuItem: MenuItem
  ) => {
    if (!menuItem?.id) {
      console.error('❌ Menu item is missing or has no ID:', menuItem)
      return
    }

    setCart((current) => {
      const safeArray = Array.isArray(current) ? current : []
      
      const existingItem = safeArray.find(
        item => item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
      )

      if (existingItem) {
        return safeArray.map(item =>
          item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...safeArray, { restaurantId, restaurantName, menuItem, quantity: 1 }]
    })
  }, [setCart])

  const updateQuantity = useCallback((
    restaurantId: string,
    menuItemId: string,
    delta: number
  ) => {
    setCart((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.map(item => {
        if (item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
      
      return updated
    })
  }, [setCart])

  const removeItem = useCallback((restaurantId: string, menuItemId: string) => {
    setCart((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.filter(
        item => !(item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId)
      )
      
      return updated
    })
  }, [setCart])

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
    setCart([])
  }, [setCart])

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
