import { useKV } from '@github/spark/hooks'
import { useCallback, useMemo, useState, useEffect } from 'react'
import type { CartItem, MenuItem } from '@/lib/types'

export function useCart() {
  const [storedCartItems, setStoredCartItems] = useKV<CartItem[]>('cart-items', [])
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (storedCartItems) {
      setCartItems(Array.isArray(storedCartItems) ? storedCartItems : [])
    }
  }, [storedCartItems])

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
      console.error('Menu item is missing or has no ID:', menuItem)
      return
    }

    setStoredCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const existingItem = safeArray.find(
        item => item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
      )

      if (existingItem) {
        const updated = safeArray.map(item =>
          item?.restaurantId === restaurantId && item?.menuItem?.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        setCartItems(updated)
        return updated
      }

      const updated = [...safeArray, { restaurantId, restaurantName, menuItem, quantity: 1 }]
      setCartItems(updated)
      return updated
    })
  }, [setStoredCartItems])

  const updateQuantity = useCallback((
    restaurantId: string,
    menuItemId: string,
    delta: number
  ) => {
    setStoredCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.map(item => {
        if (item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
      setCartItems(updated)
      return updated
    })
  }, [setStoredCartItems])

  const removeItem = useCallback((restaurantId: string, menuItemId: string) => {
    setStoredCartItems((current) => {
      const safeArray = Array.isArray(current) ? current : []
      const updated = safeArray.filter(
        item => !(item?.restaurantId === restaurantId && item?.menuItem?.id === menuItemId)
      )
      setCartItems(updated)
      return updated
    })
  }, [setStoredCartItems])

  const itemQuantities = useMemo(() => {
    const quantities: Record<string, number> = {}
    safeCartItems.forEach(item => {
      if (item?.restaurantId && item?.menuItem?.id) {
        const key = `${item.restaurantId}-${item.menuItem.id}`
        quantities[key] = item.quantity
      }
    })
    return quantities
  }, [safeCartItems])

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
    setCartItems([])
    setStoredCartItems([])
  }, [setStoredCartItems])

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
