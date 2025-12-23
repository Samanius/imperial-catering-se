import { useKV } from '@github/spark/hooks'
import { useCallback, useMemo, useState, useEffect } from 'react'
import type { CartItem, MenuItem } from '@/lib/types'

export function useCart() {
  const [cartItems, setCartItems] = useKV<CartItem[]>('cart-items', [])
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [cartItems])

  const safeCartItems = useMemo(() => {
    return Array.isArray(cartItems) ? cartItems : []
  }, [cartItems, updateTrigger])

  const addToCart = useCallback((
    restaurantId: string,
    restaurantName: string,
    menuItem: MenuItem
  ) => {
    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const existingItem = safeArray.find(
        item => item.restaurantId === restaurantId && item.menuItem.id === menuItem.id
      )

      if (existingItem) {
        return safeArray.map(item =>
          item.restaurantId === restaurantId && item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...safeArray, { restaurantId, restaurantName, menuItem, quantity: 1 }]
    })
  }, [setCartItems])

  const updateQuantity = useCallback((
    restaurantId: string,
    menuItemId: string,
    delta: number
  ) => {
    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      return safeArray.map(item => {
        if (item.restaurantId === restaurantId && item.menuItem.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }, [setCartItems])

  const removeItem = useCallback((restaurantId: string, menuItemId: string) => {
    setCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      return safeArray.filter(
        item => !(item.restaurantId === restaurantId && item.menuItem.id === menuItemId)
      )
    })
  }, [setCartItems])

  const itemQuantities = useMemo(() => {
    const quantities: Record<string, number> = {}
    safeCartItems.forEach(item => {
      const key = `${item.restaurantId}-${item.menuItem.id}`
      quantities[key] = item.quantity
    })
    return quantities
  }, [safeCartItems, updateTrigger])

  const getItemQuantity = useCallback((restaurantId: string, menuItemId: string) => {
    const item = safeCartItems.find(
      item => item.restaurantId === restaurantId && item.menuItem.id === menuItemId
    )
    return item ? item.quantity : 0
  }, [safeCartItems])

  const totalItems = useMemo(() => {
    return safeCartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [safeCartItems, updateTrigger])

  const totalPrice = useMemo(() => {
    return safeCartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  }, [safeCartItems, updateTrigger])

  const groupedByRestaurant = useMemo(() => {
    return safeCartItems.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        }
      }
      acc[item.restaurantId].items.push(item)
      return acc
    }, {} as Record<string, { restaurantName: string; items: CartItem[] }>)
  }, [safeCartItems, updateTrigger])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [setCartItems])

  return {
    cartItems: safeCartItems,
    addToCart,
    updateQuantity,
    removeItem,
    getItemQuantity,
    itemQuantities,
    totalItems,
    totalPrice,
    groupedByRestaurant,
    clearCart
  }
}
