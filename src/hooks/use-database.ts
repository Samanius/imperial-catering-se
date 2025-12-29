import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/database'
import type { Restaurant } from '@/lib/types'

export function useDatabase() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [hasWriteAccess, setHasWriteAccess] = useState(false)

  useEffect(() => {
    setIsConfigured(db.hasCredentials())
    setHasWriteAccess(db.hasWriteAccess())
    loadRestaurants()
  }, [])

  const loadRestaurants = useCallback(async () => {
    if (!db.hasCredentials()) {
      setIsLoading(false)
      setRestaurants([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await db.getRestaurants()
      setRestaurants(data)
    } catch (err: any) {
      console.error('Failed to load restaurants:', err)
      setError(err.message || 'Failed to load restaurants')
      setRestaurants([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addRestaurant = useCallback(async (restaurant: Restaurant) => {
    try {
      await db.addRestaurant(restaurant)
      await loadRestaurants()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add restaurant')
    }
  }, [loadRestaurants])

  const updateRestaurant = useCallback(async (restaurant: Restaurant) => {
    try {
      await db.updateRestaurant(restaurant)
      await loadRestaurants()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update restaurant')
    }
  }, [loadRestaurants])

  const deleteRestaurant = useCallback(async (id: string) => {
    try {
      await db.deleteRestaurant(id)
      await loadRestaurants()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete restaurant')
    }
  }, [loadRestaurants])

  const saveRestaurants = useCallback(async (restaurants: Restaurant[]) => {
    try {
      await db.saveRestaurants(restaurants)
      await loadRestaurants()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save restaurants')
    }
  }, [loadRestaurants])

  const configureDatabase = useCallback(async (gistId: string, githubToken: string) => {
    try {
      db.setCredentials(gistId, githubToken)
      setIsConfigured(true)
      setHasWriteAccess(true)
      await loadRestaurants()
      return true
    } catch (err: any) {
      setIsConfigured(false)
      setHasWriteAccess(false)
      throw new Error(err.message || 'Failed to configure database')
    }
  }, [loadRestaurants])

  const createDatabase = useCallback(async (githubToken: string) => {
    try {
      db.setCredentials('', githubToken)
      const result = await db.createDatabase()
      db.setCredentials(result.gistId, githubToken)
      setIsConfigured(true)
      setHasWriteAccess(true)
      await loadRestaurants()
      return result
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create database')
    }
  }, [loadRestaurants])

  const testConnection = useCallback(async () => {
    try {
      return await db.testConnection()
    } catch {
      return false
    }
  }, [])

  const refresh = useCallback(() => {
    db.clearCache()
    loadRestaurants()
  }, [loadRestaurants])

  return {
    restaurants,
    isLoading,
    error,
    isConfigured,
    hasWriteAccess,
    loadRestaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    saveRestaurants,
    configureDatabase,
    createDatabase,
    testConnection,
    refresh
  }
}
