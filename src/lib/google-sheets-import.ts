import type { Restaurant, MenuItem } from './types'
import { createBackup } from './backup'

interface SheetData {
  sheetName: string
  rows: string[][]
}

export async function importFromGoogleSheets(
  spreadsheetId: string,
  existingRestaurants: Restaurant[]
): Promise<{ 
  newRestaurants: Restaurant[]
  updatedRestaurants: Restaurant[]
  addedCount: number
  updatedCount: number
  itemsAddedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  const newRestaurants: Restaurant[] = []
  const updatedRestaurants: Restaurant[] = []
  let itemsAddedCount = 0

  try {
    const sheetsData = await fetchAllSheets(spreadsheetId)
    
    if (!sheetsData || sheetsData.length === 0) {
      errors.push('No sheets found in the spreadsheet')
      return { newRestaurants, updatedRestaurants, addedCount: 0, updatedCount: 0, itemsAddedCount: 0, errors }
    }

    for (const sheet of sheetsData) {
      const restaurantName = sheet.sheetName.trim()
      
      if (!restaurantName) {
        errors.push('Found sheet with empty name, skipping')
        continue
      }

      const existingRestaurant = existingRestaurants.find(
        r => r.name.toLowerCase() === restaurantName.toLowerCase()
      )

      const menuItems: MenuItem[] = []
      
      for (let i = 0; i < sheet.rows.length; i++) {
        const row = sheet.rows[i]
        
        if (row.length < 3) {
          continue
        }

        const itemName = row[0]?.trim()
        const description = row[1]?.trim()
        const priceStr = row[2]?.trim()
        const category = row[3]?.trim()
        const weightStr = row[4]?.trim()
        const imageUrl = row[5]?.trim()

        if (!itemName || !priceStr) {
          continue
        }

        const price = parseFloat(priceStr)
        if (isNaN(price)) {
          continue
        }

        const weight = weightStr ? parseFloat(weightStr) : undefined
        const finalWeight = weight && !isNaN(weight) ? weight : undefined

        const menuItem: MenuItem = {
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          name: itemName,
          description: description || '',
          price: price,
          category: category || 'Uncategorized',
          weight: finalWeight,
          image: imageUrl || ''
        }

        menuItems.push(menuItem)
        itemsAddedCount++
      }

      if (menuItems.length === 0) {
        errors.push(`Restaurant "${restaurantName}" has no valid menu items, skipping`)
        continue
      }

      if (existingRestaurant) {
        const existingItemNames = new Set(
          (existingRestaurant.menuItems || []).map(item => item.name.toLowerCase().trim())
        )
        
        const newItemsOnly = menuItems.filter(
          item => !existingItemNames.has(item.name.toLowerCase().trim())
        )

        if (newItemsOnly.length > 0) {
          const updatedMenuItems = [...(existingRestaurant.menuItems || []), ...newItemsOnly]
          
          const allCategories = Array.from(new Set(updatedMenuItems.map(item => item.category)))
          
          const updatedRestaurant: Restaurant = {
            ...existingRestaurant,
            menuItems: updatedMenuItems,
            categories: allCategories
          }
          
          updatedRestaurants.push(updatedRestaurant)
          
          await createBackup('update', 'restaurant', updatedRestaurant.id, updatedRestaurant.name, updatedRestaurant, existingRestaurant)
        } else {
          errors.push(`Restaurant "${restaurantName}" already exists with all ${menuItems.length} menu items - no new items to add`)
        }
      } else {
        const categories = Array.from(new Set(menuItems.map(item => item.category)))

        const newRestaurant: Restaurant = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: restaurantName,
          tagline: '',
          tags: [],
          description: '',
          story: `Imported from Google Sheets on ${new Date().toLocaleDateString()}`,
          menuType: 'visual',
          coverImage: '',
          galleryImages: [],
          menuItems: menuItems,
          tastingMenuDescription: '',
          categories: categories,
          minimumOrderAmount: undefined,
          orderDeadlineHours: undefined,
          chefServicePrice: undefined,
          waiterServicePrice: undefined,
          isHidden: false
        }

        newRestaurants.push(newRestaurant)
        
        await createBackup('create', 'restaurant', newRestaurant.id, newRestaurant.name, newRestaurant)
      }
    }

    console.log('Import completed:', {
      totalSheetsProcessed: sheetsData.length,
      newRestaurants: newRestaurants.length,
      updatedRestaurants: updatedRestaurants.length,
      itemsAddedCount,
      errors: errors.length
    })

    return {
      newRestaurants,
      updatedRestaurants,
      addedCount: newRestaurants.length,
      updatedCount: updatedRestaurants.length,
      itemsAddedCount,
      errors
    }
  } catch (error) {
    errors.push(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { newRestaurants, updatedRestaurants, addedCount: 0, updatedCount: 0, itemsAddedCount: 0, errors }
  }
}

async function fetchAllSheets(spreadsheetId: string): Promise<SheetData[]> {
  const apiKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU01cwTBgwng4'
  
  const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
  
  const metadataResponse = await fetch(metadataUrl)
  
  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch spreadsheet metadata: ${metadataResponse.statusText}`)
  }
  
  const metadata = await metadataResponse.json()
  const sheets = metadata.sheets || []
  
  const sheetsData: SheetData[] = []
  
  for (const sheet of sheets) {
    const sheetName = sheet.properties.title
    const sheetId = sheet.properties.sheetId
    
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`
    
    const valuesResponse = await fetch(valuesUrl)
    
    if (!valuesResponse.ok) {
      console.error(`Failed to fetch sheet "${sheetName}":`, valuesResponse.statusText)
      continue
    }
    
    const valuesData = await valuesResponse.json()
    const rows: string[][] = valuesData.values || []
    
    sheetsData.push({
      sheetName,
      rows
    })
  }
  
  return sheetsData
}

export function extractSpreadsheetId(url: string): string | null {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /^([a-zA-Z0-9-_]+)$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}
