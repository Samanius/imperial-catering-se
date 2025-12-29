import type { Restaurant } from './types'

const GIST_ID_KEY = 'imperial-gist-id'
const GITHUB_TOKEN_KEY = 'imperial-github-token'
const DATA_FILENAME = 'imperial-restaurants.json'
const DEFAULT_GIST_ID = '4bbee0ab79fb8dc84b54d5bf12b7110b'

export interface DatabaseData {
  restaurants: Restaurant[]
  lastUpdated: number
  version: number
}

class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class Database {
  private gistId: string | null = null
  private githubToken: string | null = null
  private cache: DatabaseData | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_TTL = 5000

  constructor() {
    if (typeof window !== 'undefined') {
      this.gistId = localStorage.getItem(GIST_ID_KEY) || DEFAULT_GIST_ID
      this.githubToken = localStorage.getItem(GITHUB_TOKEN_KEY)
    } else {
      this.gistId = DEFAULT_GIST_ID
    }
  }

  public setCredentials(gistId: string, githubToken: string): void {
    this.gistId = gistId
    this.githubToken = githubToken
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(GIST_ID_KEY, gistId)
      localStorage.setItem(GITHUB_TOKEN_KEY, githubToken)
    }
  }

  public getCredentials(): { gistId: string | null; githubToken: string | null } {
    return {
      gistId: this.gistId,
      githubToken: this.githubToken
    }
  }

  public hasCredentials(): boolean {
    return !!this.gistId
  }

  public hasWriteAccess(): boolean {
    return !!(this.gistId && this.githubToken)
  }

  private async fetchGist(): Promise<any> {
    if (!this.gistId) {
      throw new DatabaseError('Database not configured. Please set up GitHub credentials in Admin Panel.', 'NO_CREDENTIALS')
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }

    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`
    }

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      headers
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new DatabaseError('Database not found. Please check your Gist ID.', 'GIST_NOT_FOUND')
      }
      if (response.status === 401) {
        throw new DatabaseError('Invalid GitHub token. Please check your credentials.', 'INVALID_TOKEN')
      }
      throw new DatabaseError(`Failed to fetch database: ${response.statusText}`, 'FETCH_ERROR')
    }

    return response.json()
  }

  private async updateGist(data: DatabaseData): Promise<void> {
    if (!this.gistId) {
      throw new DatabaseError('Database not configured. Please set up Gist ID.', 'NO_GIST_ID')
    }

    if (!this.githubToken) {
      throw new DatabaseError('GitHub token required for write operations. Please configure in Admin Panel.', 'NO_TOKEN')
    }

    const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [DATA_FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new DatabaseError('Invalid GitHub token. Please check your credentials.', 'INVALID_TOKEN')
      }
      if (response.status === 404) {
        throw new DatabaseError('Database not found. Please check your Gist ID.', 'GIST_NOT_FOUND')
      }
      throw new DatabaseError(`Failed to update database: ${response.statusText}`, 'UPDATE_ERROR')
    }

    this.cache = data
    this.cacheExpiry = Date.now() + this.CACHE_TTL
  }

  public async createDatabase(): Promise<{ gistId: string; url: string }> {
    if (!this.githubToken) {
      throw new DatabaseError('GitHub token required to create database', 'NO_TOKEN')
    }

    const initialData: DatabaseData = {
      restaurants: [],
      lastUpdated: Date.now(),
      version: 1
    }

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Imperial Delicious Menu - Restaurant Database',
        public: true,
        files: {
          [DATA_FILENAME]: {
            content: JSON.stringify(initialData, null, 2)
          }
        }
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new DatabaseError('Invalid GitHub token', 'INVALID_TOKEN')
      }
      throw new DatabaseError(`Failed to create database: ${response.statusText}`, 'CREATE_ERROR')
    }

    const gist = await response.json()
    this.gistId = gist.id
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(GIST_ID_KEY, gist.id)
    }

    return {
      gistId: gist.id,
      url: gist.html_url
    }
  }

  public async getData(): Promise<DatabaseData> {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache
    }

    try {
      const gist = await this.fetchGist()
      const file = gist.files[DATA_FILENAME]
      
      if (!file) {
        throw new DatabaseError('Database file not found in Gist', 'FILE_NOT_FOUND')
      }

      const data: DatabaseData = JSON.parse(file.content)
      this.cache = data
      this.cacheExpiry = Date.now() + this.CACHE_TTL
      
      return data
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to read database: ${error instanceof Error ? error.message : 'Unknown error'}`, 'READ_ERROR')
    }
  }

  public async getRestaurants(): Promise<Restaurant[]> {
    const data = await this.getData()
    return data.restaurants || []
  }

  public async saveRestaurants(restaurants: Restaurant[]): Promise<void> {
    const currentData = await this.getData()
    
    const newData: DatabaseData = {
      restaurants,
      lastUpdated: Date.now(),
      version: (currentData.version || 0) + 1
    }

    await this.updateGist(newData)
  }

  public async addRestaurant(restaurant: Restaurant): Promise<void> {
    const restaurants = await this.getRestaurants()
    const exists = restaurants.some(r => r.id === restaurant.id)
    
    if (exists) {
      throw new DatabaseError('Restaurant with this ID already exists', 'DUPLICATE_ID')
    }

    restaurants.push(restaurant)
    await this.saveRestaurants(restaurants)
  }

  public async updateRestaurant(restaurant: Restaurant): Promise<void> {
    const restaurants = await this.getRestaurants()
    const index = restaurants.findIndex(r => r.id === restaurant.id)
    
    if (index === -1) {
      throw new DatabaseError('Restaurant not found', 'NOT_FOUND')
    }

    restaurants[index] = restaurant
    await this.saveRestaurants(restaurants)
  }

  public async deleteRestaurant(id: string): Promise<void> {
    const restaurants = await this.getRestaurants()
    const filtered = restaurants.filter(r => r.id !== id)
    
    if (filtered.length === restaurants.length) {
      throw new DatabaseError('Restaurant not found', 'NOT_FOUND')
    }

    await this.saveRestaurants(filtered)
  }

  public clearCache(): void {
    this.cache = null
    this.cacheExpiry = 0
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.getData()
      return true
    } catch {
      return false
    }
  }
}

export const db = new Database()
