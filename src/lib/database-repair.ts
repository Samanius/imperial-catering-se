import type { DatabaseData } from './database'

export interface RepairReport {
  success: boolean
  errors: string[]
  fixed: string[]
  originalSize: number
  repairedSize: number
}

export async function repairDatabase(gistId: string, githubToken: string): Promise<RepairReport> {
  const report: RepairReport = {
    success: false,
    errors: [],
    fixed: [],
    originalSize: 0,
    repairedSize: 0
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      report.errors.push(`Failed to fetch Gist: ${response.statusText}`)
      return report
    }

    const gist = await response.json()
    const file = gist.files['imperial-restaurants.json']
    
    if (!file) {
      report.errors.push('Database file not found in Gist')
      return report
    }

    const content = file.content
    report.originalSize = content.length

    let data: DatabaseData

    try {
      data = JSON.parse(content)
      report.fixed.push('✓ JSON is valid - no structural errors found')
    } catch (parseError) {
      report.errors.push(`JSON Parse Error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`)
      
      const errorMatch = parseError instanceof Error ? 
        parseError.message.match(/position (\d+)/) : null
      
      if (errorMatch) {
        const position = parseInt(errorMatch[1], 10)
        const start = Math.max(0, position - 100)
        const end = Math.min(content.length, position + 100)
        const snippet = content.substring(start, end)
        
        report.errors.push(`Error location: "${snippet}"`)
      }

      let repairedContent = content
      
      repairedContent = repairedContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      
      repairedContent = repairedContent.replace(/([^\\])"([^",:}\]]*)"(?=[,}\]])/g, '$1\\"$2\\"')
      
      repairedContent = repairedContent.replace(/,(\s*[}\]])/g, '$1')
      
      try {
        data = JSON.parse(repairedContent)
        report.fixed.push('✓ Repaired control characters')
        report.fixed.push('✓ Repaired unescaped quotes')
        report.fixed.push('✓ Removed trailing commas')
      } catch (secondError) {
        report.errors.push('Unable to automatically repair JSON. Manual intervention required.')
        return report
      }
    }

    if (!data.restaurants || !Array.isArray(data.restaurants)) {
      data.restaurants = []
      report.fixed.push('✓ Fixed missing or invalid restaurants array')
    }

    data.restaurants = data.restaurants.map((restaurant, index) => {
      if (!restaurant.id) {
        restaurant.id = `repaired-${Date.now()}-${index}`
        report.fixed.push(`✓ Generated missing ID for restaurant: ${restaurant.name || 'Unnamed'}`)
      }

      if (!restaurant.name) {
        restaurant.name = `Restaurant ${index + 1}`
        report.fixed.push(`✓ Generated missing name for restaurant ${restaurant.id}`)
      }

      restaurant.name = sanitizeString(restaurant.name)
      restaurant.description = sanitizeString(restaurant.description || '')
      restaurant.description_ru = restaurant.description_ru ? sanitizeString(restaurant.description_ru) : undefined
      restaurant.story = sanitizeString(restaurant.story || '')
      restaurant.tagline = sanitizeString(restaurant.tagline || '')

      if (restaurant.coverImage && !restaurant.coverImage.startsWith('http')) {
        report.errors.push(`Invalid cover image URL for ${restaurant.name}: ${restaurant.coverImage.substring(0, 50)}...`)
        restaurant.coverImage = ''
      }

      if (!restaurant.menuItems || !Array.isArray(restaurant.menuItems)) {
        restaurant.menuItems = []
        report.fixed.push(`✓ Fixed missing menu items for: ${restaurant.name}`)
      }

      restaurant.menuItems = restaurant.menuItems.filter(item => {
        if (!item.name || !item.price || item.price <= 0) {
          report.errors.push(`Removed invalid menu item from ${restaurant.name}: ${item.name || 'unnamed'}`)
          return false
        }
        return true
      })

      restaurant.menuItems = restaurant.menuItems.map((item, itemIndex) => {
        if (!item.id) {
          item.id = `item-${Date.now()}-${index}-${itemIndex}`
          report.fixed.push(`✓ Generated ID for menu item: ${item.name}`)
        }

        item.name = sanitizeString(item.name)
        item.name_ru = item.name_ru ? sanitizeString(item.name_ru) : undefined
        item.description = sanitizeString(item.description || '')
        item.description_ru = item.description_ru ? sanitizeString(item.description_ru) : undefined
        item.category = sanitizeString(item.category || 'Uncategorized')
        item.category_ru = item.category_ru ? sanitizeString(item.category_ru) : undefined

        if (item.image && !item.image.startsWith('http')) {
          report.errors.push(`Invalid image URL for ${item.name}: ${item.image.substring(0, 50)}...`)
          item.image = ''
        }

        return item
      })

      return restaurant
    })

    if (!data.version || typeof data.version !== 'number') {
      data.version = 1
      report.fixed.push('✓ Fixed missing version number')
    }

    if (!data.lastUpdated || typeof data.lastUpdated !== 'number') {
      data.lastUpdated = Date.now()
      report.fixed.push('✓ Fixed missing lastUpdated timestamp')
    }

    const repairedJson = JSON.stringify(data, null, 2)
    report.repairedSize = repairedJson.length

    try {
      JSON.parse(repairedJson)
    } catch (verifyError) {
      report.errors.push('Repaired data is still invalid!')
      return report
    }

    const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'imperial-restaurants.json': {
            content: repairedJson
          }
        }
      })
    })

    if (!updateResponse.ok) {
      report.errors.push(`Failed to save repaired database: ${updateResponse.statusText}`)
      return report
    }

    report.success = true
    report.fixed.push('✓ Successfully saved repaired database to GitHub Gist')

    return report
  } catch (error) {
    report.errors.push(`Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return report
  }
}

function sanitizeString(str: string): string {
  if (!str) return ''
  
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}
