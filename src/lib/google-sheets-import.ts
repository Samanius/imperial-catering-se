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

    console.log('Processing sheets:', sheetsData.map(s => s.sheetName))
    console.log('Existing restaurants:', existingRestaurants.map(r => r.name))

    for (const sheet of sheetsData) {
      const restaurantName = sheet.sheetName.trim()
      
      console.log(`\n=== Processing sheet: "${restaurantName}" ===`)
      
      if (!restaurantName) {
        console.log('Sheet name is empty, skipping')
        errors.push('Found sheet with empty name, skipping')
        continue
      }

      const existingRestaurant = existingRestaurants.find(
        r => r.name.toLowerCase() === restaurantName.toLowerCase()
      )

      console.log('Existing restaurant found:', existingRestaurant ? `Yes (${existingRestaurant.name})` : 'No')

      const menuItems: MenuItem[] = []
      
      console.log(`Processing ${sheet.rows.length} rows`)
      
      let startIndex = 0
      if (sheet.rows.length > 0 && sheet.rows[0].length > 0) {
        const firstCell = sheet.rows[0][0]?.trim().toLowerCase()
        if (firstCell === 'item name' || firstCell === 'name' || firstCell === 'item') {
          console.log('First row appears to be a header, skipping it')
          startIndex = 1
        }
      }
      
      for (let i = startIndex; i < sheet.rows.length; i++) {
        const row = sheet.rows[i]
        
        if (!row || row.length === 0) {
          console.log(`Row ${i}: Empty row, skipping`)
          continue
        }
        
        if (row.length < 3) {
          console.log(`Row ${i}: Not enough columns (${row.length}), skipping`)
          continue
        }

        const itemName = row[0]?.toString().trim() || ''
        const description = row[1]?.toString().trim() || ''
        const priceStr = row[2]?.toString().trim() || ''
        const category = row[3]?.toString().trim() || ''
        const weightStr = row[4]?.toString().trim() || ''
        let imageUrl = ''
        
        try {
          imageUrl = row[5]?.toString().trim() || ''
          if (imageUrl && !imageUrl.startsWith('http')) {
            console.log(`Row ${i}: Image URL doesn't start with http, clearing it`)
            imageUrl = ''
          }
        } catch (e) {
          console.log(`Row ${i}: Could not parse image URL, setting to empty`)
          imageUrl = ''
        }

        if (!itemName || !priceStr) {
          console.log(`Row ${i}: Missing name or price, skipping`)
          continue
        }

        const cleanPriceStr = priceStr.replace(/[^\d.-]/g, '')
        const price = parseFloat(cleanPriceStr)
        if (isNaN(price) || price <= 0) {
          console.log(`Row ${i}: Invalid price "${priceStr}" (cleaned: "${cleanPriceStr}"), skipping`)
          continue
        }

        const cleanWeightStr = weightStr ? weightStr.replace(/[^\d.-]/g, '') : ''
        const weight = cleanWeightStr ? parseFloat(cleanWeightStr) : undefined
        const finalWeight = weight && !isNaN(weight) && weight > 0 ? weight : undefined

        const menuItem: MenuItem = {
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          name: itemName,
          description: description || '',
          price: price,
          category: category || 'Uncategorized',
          weight: finalWeight,
          image: imageUrl || ''
        }

        console.log(`Row ${i}: Added item "${itemName}" - $${price} ${finalWeight ? `(${finalWeight}g)` : ''}`)
        menuItems.push(menuItem)
      }

      console.log(`Total menu items parsed: ${menuItems.length}`)

      if (menuItems.length === 0) {
        console.log(`No valid menu items found for "${restaurantName}"`)
        errors.push(`Restaurant "${restaurantName}" has no valid menu items (check that rows have Item Name and Price)`)
        continue
      }

      if (existingRestaurant) {
        console.log(`Restaurant "${restaurantName}" exists, checking for updates and new items`)
        
        const existingItemsMap = new Map(
          (existingRestaurant.menuItems || []).map(item => [item.name.toLowerCase().trim(), item])
        )
        
        console.log('Existing item names:', Array.from(existingItemsMap.keys()))
        
        const updatedMenuItems: MenuItem[] = []
        const newItems: string[] = []
        const updatedItems: string[] = []
        let hasChanges = false
        
        for (const importedItem of menuItems) {
          const itemKey = importedItem.name.toLowerCase().trim()
          const existingItem = existingItemsMap.get(itemKey)
          
          if (existingItem) {
            const priceChanged = existingItem.price !== importedItem.price
            const descChanged = (existingItem.description || '') !== (importedItem.description || '')
            const categoryChanged = existingItem.category !== importedItem.category
            const weightChanged = (existingItem.weight || undefined) !== (importedItem.weight || undefined)
            const imageChanged = (existingItem.image || '') !== (importedItem.image || '')
            
            if (priceChanged || descChanged || categoryChanged || weightChanged || imageChanged) {
              console.log(`Item "${importedItem.name}" has changes:`, {
                price: priceChanged ? `${existingItem.price} → ${importedItem.price}` : 'same',
                description: descChanged ? 'changed' : 'same',
                category: categoryChanged ? `${existingItem.category} → ${importedItem.category}` : 'same',
                weight: weightChanged ? `${existingItem.weight} → ${importedItem.weight}` : 'same',
                image: imageChanged ? 'changed' : 'same'
              })
              
              updatedMenuItems.push({
                ...existingItem,
                price: importedItem.price,
                description: importedItem.description,
                category: importedItem.category,
                weight: importedItem.weight,
                image: importedItem.image
              })
              updatedItems.push(importedItem.name)
              hasChanges = true
            } else {
              updatedMenuItems.push(existingItem)
            }
            
            existingItemsMap.delete(itemKey)
          } else {
            console.log(`New item found: "${importedItem.name}"`)
            updatedMenuItems.push(importedItem)
            newItems.push(importedItem.name)
            hasChanges = true
          }
        }
        
        for (const [, remainingItem] of existingItemsMap) {
          console.log(`Keeping existing item not in sheet: "${remainingItem.name}"`)
          updatedMenuItems.push(remainingItem)
        }

        console.log(`Summary: ${newItems.length} new items, ${updatedItems.length} updated items`)

        if (hasChanges) {
          const allCategories = Array.from(new Set(updatedMenuItems.map(item => item.category)))
          
          const updatedRestaurant: Restaurant = {
            ...existingRestaurant,
            menuItems: updatedMenuItems,
            categories: allCategories
          }
          
          updatedRestaurants.push(updatedRestaurant)
          itemsAddedCount += newItems.length
          
          const changeSummary: string[] = []
          if (newItems.length > 0) changeSummary.push(`${newItems.length} new`)
          if (updatedItems.length > 0) changeSummary.push(`${updatedItems.length} updated`)
          
          console.log(`Updated restaurant "${restaurantName}": ${changeSummary.join(', ')}`)
          
          await createBackup('update', 'restaurant', updatedRestaurant.id, updatedRestaurant.name, updatedRestaurant, existingRestaurant)
        } else {
          console.log(`No changes for "${restaurantName}" - all items are identical`)
          errors.push(`Restaurant "${restaurantName}": No changes detected - all menu items are identical`)
        }
      } else {
        console.log(`Creating new restaurant "${restaurantName}" with ${menuItems.length} items`)
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
        itemsAddedCount += menuItems.length
        
        console.log(`New restaurant added: "${restaurantName}"`)
        
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
    
    console.log('New restaurants:', newRestaurants.map(r => ({ name: r.name, items: r.menuItems?.length })))
    console.log('Updated restaurants:', updatedRestaurants.map(r => ({ name: r.name, items: r.menuItems?.length })))

    return {
      newRestaurants,
      updatedRestaurants,
      addedCount: newRestaurants.length,
      updatedCount: updatedRestaurants.length,
      itemsAddedCount,
      errors
    }
  } catch (error) {
    console.error('Import error:', error)
    errors.push(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { newRestaurants, updatedRestaurants, addedCount: 0, updatedCount: 0, itemsAddedCount: 0, errors }
  }
}

async function fetchAllSheets(spreadsheetId: string): Promise<SheetData[]> {
  const apiKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU01cwTBgwng4'
  
  const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
  
  console.log('Fetching spreadsheet metadata...')
  const metadataResponse = await fetch(metadataUrl)
  
  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text()
    console.error('Metadata fetch error:', errorText)
    throw new Error(`Failed to fetch spreadsheet metadata: ${metadataResponse.statusText}. ${errorText}`)
  }
  
  const metadata = await metadataResponse.json()
  const sheets = metadata.sheets || []
  
  console.log(`Found ${sheets.length} sheet(s) in spreadsheet`)
  
  const sheetsData: SheetData[] = []
  
  for (const sheet of sheets) {
    const sheetName = sheet.properties.title
    
    console.log(`Fetching data for sheet: "${sheetName}"`)
    
    const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}&valueRenderOption=FORMATTED_VALUE`
    
    try {
      const valuesResponse = await fetch(valuesUrl)
      
      if (!valuesResponse.ok) {
        const errorText = await valuesResponse.text()
        console.error(`Failed to fetch sheet "${sheetName}":`, valuesResponse.statusText, errorText)
        continue
      }
      
      const valuesData = await valuesResponse.json()
      const rows: string[][] = valuesData.values || []
      
      console.log(`Sheet "${sheetName}": ${rows.length} rows fetched`)
      
      sheetsData.push({
        sheetName,
        rows
      })
    } catch (error) {
      console.error(`Error fetching sheet "${sheetName}":`, error)
      continue
    }
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
