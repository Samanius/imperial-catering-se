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

  private sanitizeData(data: DatabaseData): DatabaseData {
    const sanitizeString = (str: string | undefined): string | undefined => {
      if (!str) return str
      return str
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/[\u2028\u2029]/g, '')
        .replace(/\r\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\n/g, ' ')
        .trim()
    }

    const sanitizedRestaurants = data.restaurants.map(restaurant => ({
      ...restaurant,
      name: sanitizeString(restaurant.name) || restaurant.name,
      description: sanitizeString(restaurant.description) || restaurant.description,
      description_ru: restaurant.description_ru ? sanitizeString(restaurant.description_ru) : restaurant.description_ru,
      story: sanitizeString(restaurant.story) || restaurant.story,
      tagline: sanitizeString(restaurant.tagline) || restaurant.tagline,
      coverImage: restaurant.coverImage && restaurant.coverImage.length > 2000 
        ? restaurant.coverImage.substring(0, 2000) 
        : restaurant.coverImage,
      menuItems: restaurant.menuItems?.map(item => ({
        ...item,
        name: sanitizeString(item.name) || item.name,
        name_ru: item.name_ru ? sanitizeString(item.name_ru) : item.name_ru,
        description: sanitizeString(item.description) || item.description,
        description_ru: item.description_ru ? sanitizeString(item.description_ru) : item.description_ru,
        category: sanitizeString(item.category) || item.category,
        category_ru: item.category_ru ? sanitizeString(item.category_ru) : item.category_ru,
        image: item.image && item.image.length > 2000 
          ? item.image.substring(0, 2000) 
          : item.image
      }))
    }))

    return {
      ...data,
      restaurants: sanitizedRestaurants
    }
  }

  private async updateGist(data: DatabaseData): Promise<void> {
    if (!this.gistId) {
      throw new DatabaseError('Database not configured. Please set up Gist ID.', 'NO_GIST_ID')
    }

    if (!this.githubToken) {
      throw new DatabaseError('GitHub token required for write operations. Please configure in Admin Panel.', 'NO_TOKEN')
    }

    const sanitizedData = this.sanitizeData(data)

    let jsonContent: string
    try {
      jsonContent = JSON.stringify(sanitizedData, null, 2)
      JSON.parse(jsonContent)
    } catch (err) {
      console.error('JSON serialization failed:', err)
      throw new DatabaseError(
        `Failed to serialize database: Data contains invalid characters.\n\n` +
        `This can happen if text fields contain:\n` +
        `• Unescaped quotes or backslashes\n` +
        `• Special control characters\n` +
        `• Corrupted Unicode characters\n\n` +
        `Please check your data for invalid characters and try again.`,
        'SERIALIZATION_ERROR'
      )
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
            content: jsonContent
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
      if (response.status === 413) {
        throw new DatabaseError(
          'Database size exceeds GitHub Gist limits (max ~25MB).\n\n' +
          'Your database is too large. This can happen if:\n' +
          '• You have too many restaurants or menu items\n' +
          '• Image URLs are extremely long\n' +
          '• Description fields contain very large amounts of text\n\n' +
          'SOLUTIONS:\n' +
          '• Delete some restaurants or menu items\n' +
          '• Use shorter image URLs (e.g., Firebase short URLs)\n' +
          '• Reduce the length of description fields',
          'SIZE_LIMIT_EXCEEDED'
        )
      }
      throw new DatabaseError(`Failed to update database: ${response.statusText}`, 'UPDATE_ERROR')
    }

    this.cache = sanitizedData
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

      let content = file.content
      
      if (!content || content.trim() === '') {
        throw new DatabaseError('Database file is empty', 'EMPTY_FILE')
      }

      let data: DatabaseData
      try {
        data = JSON.parse(content)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Content length:', content.length)
        console.error('First 500 chars:', content.substring(0, 500))
        console.error('Last 500 chars:', content.substring(Math.max(0, content.length - 500)))
        
        const errorPosition = parseError instanceof Error ? 
          parseError.message.match(/position (\d+)/) : null
        const lineMatch = parseError instanceof Error ? 
          parseError.message.match(/line (\d+) column (\d+)/) : null
        
        let locationInfo = ''
        if (errorPosition) {
          const pos = parseInt(errorPosition[1], 10)
          const start = Math.max(0, pos - 50)
          const end = Math.min(content.length, pos + 50)
          const snippet = content.substring(start, end)
          locationInfo = `\nError near: "...${snippet}..."`
        } else if (lineMatch) {
          locationInfo = `\nError at line ${lineMatch[1]}, column ${lineMatch[2]}`
        }
        
        throw new DatabaseError(
          `Failed to read database: ${parseError instanceof Error ? parseError.message : 'Unknown error'}${locationInfo}\n\n` +
          `This usually happens when:\n` +
          `1. The JSON file contains unescaped special characters\n` +
          `2. Very long text fields (descriptions, URLs) are corrupted\n` +
          `3. The file was manually edited and contains syntax errors\n\n` +
          `SOLUTION:\n` +
          `• Try the "Auto-Repair" button in the error dialog\n` +
          `• Check your GitHub Gist for syntax errors\n` +
          `• Look for unescaped quotes or backslashes in text fields\n` +
          `• If repair fails, create a new database and re-import from Google Sheets\n` +
          `• If you recently imported data, the source may have invalid characters`,
          'JSON_PARSE_ERROR'
        )
      }

      if (!data || typeof data !== 'object') {
        throw new DatabaseError('Database file contains invalid data structure', 'INVALID_STRUCTURE')
      }

      if (!Array.isArray(data.restaurants)) {
        data.restaurants = []
      }

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
    const restaurants = data.restaurants || []
    
    console.log(`📥 Loaded ${restaurants.length} restaurants from database`)
    restaurants.forEach((r, idx) => {
      const coverImageInfo = r.coverImage 
        ? `${r.coverImage.substring(0, 30)}... (${r.coverImage.length} chars)`
        : '❌ No image'
      console.log(`  ${idx + 1}. ${r.name} - Cover: ${coverImageInfo}`)
    })
    
    return restaurants
  }

  public async saveRestaurants(restaurants: Restaurant[]): Promise<void> {
    const currentData = await this.getData()
    
    const newData: DatabaseData = {
      restaurants,
      lastUpdated: Date.now(),
      version: (currentData.version || 0) + 1
    }

    console.log(`💾 Saving ${restaurants.length} restaurants to database`)
    restaurants.forEach((r, idx) => {
      const coverImageInfo = r.coverImage 
        ? `${r.coverImage.substring(0, 30)}... (${r.coverImage.length} chars)`
        : 'No image'
      console.log(`  ${idx + 1}. ${r.name} - Cover: ${coverImageInfo}`)
    })

    await this.updateGist(newData)
    console.log('✅ Database updated successfully')
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
