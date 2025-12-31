import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/database'
import type { Restaurant } from '@/lib/types'

export function useDatabase() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [hasWriteAccess, setHasWriteAccess] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const loadRestaurants = useCallback(async () => {
    const configured = db.hasCredentials()
    const writeAccess = db.hasWriteAccess()
    
    setIsConfigured(configured)
    setHasWriteAccess(writeAccess)
    
    if (!configured) {
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
  }, [refreshTrigger])

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  const addRestaurant = useCallback(async (restaurant: Restaurant) => {
    try {
      await db.addRestaurant(restaurant)
      setRefreshTrigger(prev => prev + 1)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add restaurant')
    }
  }, [])

  const updateRestaurant = useCallback(async (restaurant: Restaurant) => {
    try {
      await db.updateRestaurant(restaurant)
      setRefreshTrigger(prev => prev + 1)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update restaurant')
    }
  }, [])

  const deleteRestaurant = useCallback(async (id: string) => {
    try {
      await db.deleteRestaurant(id)
      setRefreshTrigger(prev => prev + 1)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete restaurant')
    }
  }, [])

  const saveRestaurants = useCallback(async (restaurants: Restaurant[]) => {
    try {
      await db.saveRestaurants(restaurants)
      setRefreshTrigger(prev => prev + 1)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save restaurants')
    }
  }, [])

  const configureDatabase = useCallback(async (gistId: string, githubToken: string) => {
    try {
      db.setCredentials(gistId, githubToken)
      setIsConfigured(true)
      setHasWriteAccess(true)
      setRefreshTrigger(prev => prev + 1)
      return true
    } catch (err: any) {
      setIsConfigured(false)
      setHasWriteAccess(false)
      throw new Error(err.message || 'Failed to configure database')
    }
  }, [])

  const createDatabase = useCallback(async (githubToken: string) => {
    try {
      db.setCredentials('', githubToken)
      const result = await db.createDatabase()
      db.setCredentials(result.gistId, githubToken)
      setIsConfigured(true)
      setHasWriteAccess(true)
      setRefreshTrigger(prev => prev + 1)
      return result
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create database')
    }
  }, [])

  const testConnection = useCallback(async () => {
    try {
      return await db.testConnection()
    } catch {
      return false
    }
  }, [])

  const refresh = useCallback(() => {
    db.clearCache()
    setRefreshTrigger(prev => prev + 1)
  }, [])

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
