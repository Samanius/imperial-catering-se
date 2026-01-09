import type { Restaurant, MenuItem } from './types'
import { createBackup } from './backup'

interface SheetData {
  sheetName: string
  rows: string[][]
}

export async function importFromGoogleSheets(
  spreadsheetId: string,
  existingRestaurants: Restaurant[],
  apiKey?: string
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
    const sheetsData = await fetchAllSheets(spreadsheetId, apiKey)
    
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
      let restaurantDescription = ''
      let restaurantDescription_ru = ''
      let restaurantPhoto = ''
      
      console.log(`Processing ${sheet.rows.length} rows`)
      
      let startIndex = 0
      if (sheet.rows.length > 0 && sheet.rows[0].length > 0) {
        const firstCell = sheet.rows[0][0]?.trim().toLowerCase()
        if (firstCell === 'item name' || firstCell === 'name' || firstCell === 'item') {
          console.log('First row appears to be a header, skipping it')
          startIndex = 1
        }
      }
      
      const sanitizeMetadataField = (value: any): string => {
        if (!value) return ''
        const str = value.toString().trim()
        return str
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/[\u2028\u2029]/g, '')
          .replace(/\r\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
          .trim()
      }
      
      for (let i = 0; i < Math.min(sheet.rows.length, 3); i++) {
        const row = sheet.rows[i]
        if (!row || row.length === 0) continue
        
        const firstCell = row[0]?.toString().trim().toLowerCase() || ''
        
        if (firstCell === 'restaurant description') {
          const nextRow = sheet.rows[i + 1]
          if (nextRow && nextRow.length > 0) {
            restaurantDescription = sanitizeMetadataField(nextRow[0])
            restaurantDescription_ru = sanitizeMetadataField(nextRow[1])
            console.log('Found restaurant description:', restaurantDescription ? 'EN present' : 'EN empty', restaurantDescription_ru ? ', RU present' : ', RU empty')
          }
          if (startIndex <= i + 1) startIndex = i + 2
        }
        
        if (firstCell === 'restaurant photo') {
          const nextRow = sheet.rows[i + 1]
          if (nextRow && nextRow.length > 0) {
            restaurantPhoto = nextRow[0]?.toString().trim() || ''
            restaurantPhoto = restaurantPhoto
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
              .replace(/[\u2028\u2029]/g, '')
              .replace(/[\r\n\t]/g, '')
            
            if (restaurantPhoto && !restaurantPhoto.startsWith('http')) {
              console.log('Restaurant photo URL invalid, clearing')
              restaurantPhoto = ''
            }
            if (restaurantPhoto && restaurantPhoto.length > 2000) {
              console.log(`Restaurant photo URL too long (${restaurantPhoto.length} chars)`)
              const urlBeforeQuery = restaurantPhoto.split('?')[0]
              if (urlBeforeQuery && urlBeforeQuery.length <= 2000) {
                restaurantPhoto = urlBeforeQuery
                console.log(`Removed query params from restaurant photo, URL now ${restaurantPhoto.length} chars`)
              } else {
                console.log('Even base URL is too long, truncating')
                restaurantPhoto = restaurantPhoto.substring(0, 2000)
              }
            }
            console.log('Found restaurant photo:', restaurantPhoto || '(empty/invalid)')
          }
          if (startIndex <= i + 1) startIndex = i + 2
        }
      }
      
      const rowErrors: string[] = []
      
      console.log('📊 Column Structure:')
      console.log('  A: Item Name (English) - REQUIRED')
      console.log('  B: Description (English) - optional')
      console.log('  C: Price - REQUIRED')
      console.log('  D: Category (English) - optional')
      console.log('  E: Weight (grams) - optional')
      console.log('  F: Image URL - optional')
      console.log('  G: Item Name (Russian) - optional')
      console.log('  H: Description (Russian) - optional')
      console.log('  I: Category (Russian) - optional')
      console.log('')
      
      for (let i = startIndex; i < sheet.rows.length; i++) {
        const row = sheet.rows[i]
        const rowNum = i + 1
        
        if (!row || row.length === 0) {
          console.log(`Row ${rowNum}: Empty row, skipping`)
          continue
        }
        
        if (row.length < 3) {
          console.log(`Row ${rowNum}: Not enough columns (${row.length}), skipping`)
          rowErrors.push(`Row ${rowNum}: Not enough columns (need at least A, B, C)`)
          continue
        }

        const sanitizeField = (value: any): string => {
          if (!value) return ''
          const str = value.toString().trim()
          return str
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/[\u2028\u2029]/g, '')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .trim()
        }
        
        const itemName = sanitizeField(row[0])
        const description = sanitizeField(row[1])
        const priceStr = row[2]?.toString().trim() || ''
        const category = sanitizeField(row[3])
        const weightStr = row[4]?.toString().trim() || ''
        let imageUrl = ''
        
        const itemName_ru = sanitizeField(row[6])
        const description_ru = sanitizeField(row[7])
        const category_ru = sanitizeField(row[8])
        
        console.log(`Row ${rowNum} parsed:`, {
          'A (Name EN)': itemName || '(empty)',
          'B (Desc EN)': description ? description.substring(0, 30) + '...' : '(empty)',
          'C (Price)': priceStr || '(empty)',
          'D (Category EN)': category || '(empty)',
          'E (Weight)': weightStr || '(empty)',
          'G (Name RU)': itemName_ru || '(not provided)',
          'H (Desc RU)': description_ru ? description_ru.substring(0, 30) + '...' : '(not provided)',
          'I (Category RU)': category_ru || '(not provided)'
        })
        
        try {
          imageUrl = row[5]?.toString().trim() || ''
          imageUrl = imageUrl
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/[\u2028\u2029]/g, '')
            .replace(/[\r\n\t]/g, '')
          
          if (imageUrl && !imageUrl.startsWith('http')) {
            console.log(`Row ${rowNum}: Image URL doesn't start with http, clearing it`)
            rowErrors.push(`Row ${rowNum}: Image URL invalid (must start with http:// or https://), skipped image`)
            imageUrl = ''
          }
          
          if (imageUrl && imageUrl.length > 2000) {
            console.log(`Row ${rowNum}: Image URL too long (${imageUrl.length} chars), truncating to first 2000 chars`)
            const urlBeforeQuery = imageUrl.split('?')[0]
            if (urlBeforeQuery && urlBeforeQuery.length <= 2000) {
              imageUrl = urlBeforeQuery
              console.log(`Row ${rowNum}: Removed query params, URL now ${imageUrl.length} chars`)
            } else {
              imageUrl = imageUrl.substring(0, 2000)
            }
          }
        } catch (e) {
          console.log(`Row ${rowNum}: Could not parse image URL, setting to empty`)
          imageUrl = ''
        }

        if (!itemName || !priceStr) {
          console.log(`Row ${rowNum}: Missing name or price, skipping`)
          const missing: string[] = []
          if (!itemName) missing.push('Item Name (Column A)')
          if (!priceStr) missing.push('Price (Column C)')
          rowErrors.push(`Row ${rowNum}: Missing required fields: ${missing.join(', ')}`)
          continue
        }

        const cleanPriceStr = priceStr.replace(/[^\d.-]/g, '')
        const price = parseFloat(cleanPriceStr)
        if (isNaN(price) || price <= 0) {
          console.log(`Row ${rowNum}: Invalid price "${priceStr}" (cleaned: "${cleanPriceStr}"), skipping`)
          rowErrors.push(`Row ${rowNum}: Invalid price "${priceStr}" in Column C (must be a number)`)
          continue
        }

        const cleanWeightStr = weightStr ? weightStr.replace(/[^\d.-]/g, '') : ''
        const weight = cleanWeightStr ? parseFloat(cleanWeightStr) : undefined
        const finalWeight = weight && !isNaN(weight) && weight > 0 ? weight : undefined

        const menuItem: MenuItem = {
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          name: itemName,
          name_ru: itemName_ru || undefined,
          description: description || '',
          description_ru: description_ru || undefined,
          price: price,
          category: category || 'Uncategorized',
          category_ru: category_ru || undefined,
          weight: finalWeight,
          image: imageUrl || ''
        }

        console.log(`Row ${rowNum}: Added item "${itemName}" ${itemName_ru ? `/ "${itemName_ru}"` : ''} - $${price} ${finalWeight ? `(${finalWeight}g)` : ''}`)
        menuItems.push(menuItem)
      }

      console.log(`Total menu items parsed: ${menuItems.length}`)
      
      if (rowErrors.length > 0) {
        console.log(`Found ${rowErrors.length} row errors:`)
        rowErrors.forEach(err => console.log(`  ${err}`))
        errors.push(`Restaurant "${restaurantName}": ${rowErrors.length} row(s) skipped due to errors. See console for details.`)
      }

      if (menuItems.length === 0) {
        console.log(`No valid menu items found for "${restaurantName}"`)
        if (rowErrors.length > 0) {
          errors.push(`Restaurant "${restaurantName}": No valid menu items found. All ${sheet.rows.length - startIndex} rows had errors (see above).`)
        } else {
          errors.push(`Restaurant "${restaurantName}": Sheet is empty or has no data rows with Item Name and Price.`)
        }
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
            const descRuChanged = (existingItem.description_ru || '') !== (importedItem.description_ru || '')
            const categoryChanged = existingItem.category !== importedItem.category
            const categoryRuChanged = (existingItem.category_ru || '') !== (importedItem.category_ru || '')
            const weightChanged = (existingItem.weight || undefined) !== (importedItem.weight || undefined)
            const imageChanged = (existingItem.image || '') !== (importedItem.image || '')
            const nameRuChanged = (existingItem.name_ru || '') !== (importedItem.name_ru || '')
            
            if (priceChanged || descChanged || descRuChanged || categoryChanged || categoryRuChanged || weightChanged || imageChanged || nameRuChanged) {
              console.log(`Item "${importedItem.name}" has changes:`, {
                price: priceChanged ? `${existingItem.price} → ${importedItem.price}` : 'same',
                description: descChanged ? 'changed' : 'same',
                description_ru: descRuChanged ? 'changed' : 'same',
                category: categoryChanged ? `${existingItem.category} → ${importedItem.category}` : 'same',
                category_ru: categoryRuChanged ? 'changed' : 'same',
                weight: weightChanged ? `${existingItem.weight} → ${importedItem.weight}` : 'same',
                image: imageChanged ? 'changed' : 'same',
                name_ru: nameRuChanged ? 'changed' : 'same'
              })
              
              updatedMenuItems.push({
                ...existingItem,
                price: importedItem.price,
                description: importedItem.description,
                description_ru: importedItem.description_ru,
                category: importedItem.category,
                category_ru: importedItem.category_ru,
                weight: importedItem.weight,
                image: importedItem.image,
                name_ru: importedItem.name_ru
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

        const descriptionChanged = restaurantDescription && existingRestaurant.description !== restaurantDescription
        const descriptionRuChanged = restaurantDescription_ru && (existingRestaurant.description_ru || '') !== restaurantDescription_ru
        const photoChanged = restaurantPhoto && existingRestaurant.coverImage !== restaurantPhoto
        
        if (descriptionChanged || descriptionRuChanged || photoChanged) {
          console.log('Restaurant metadata changed:', {
            description: descriptionChanged ? 'updated' : 'same',
            description_ru: descriptionRuChanged ? 'updated' : 'same',
            photo: photoChanged ? 'updated' : 'same'
          })
          hasChanges = true
        }

        if (hasChanges) {
          const allCategories = Array.from(new Set(updatedMenuItems.map(item => item.category)))
          
          const updatedRestaurant: Restaurant = {
            ...existingRestaurant,
            menuItems: updatedMenuItems,
            categories: allCategories,
            ...(descriptionChanged && { description: restaurantDescription }),
            ...(descriptionRuChanged && { description_ru: restaurantDescription_ru }),
            ...(photoChanged && { coverImage: restaurantPhoto })
          }
          
          updatedRestaurants.push(updatedRestaurant)
          itemsAddedCount += newItems.length
          
          const changeSummary: string[] = []
          if (newItems.length > 0) changeSummary.push(`${newItems.length} new`)
          if (updatedItems.length > 0) changeSummary.push(`${updatedItems.length} updated`)
          if (descriptionChanged || descriptionRuChanged) changeSummary.push('description updated')
          if (photoChanged) changeSummary.push('photo updated')
          
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
          description: restaurantDescription || '',
          description_ru: restaurantDescription_ru || undefined,
          story: `Imported from Google Sheets on ${new Date().toLocaleDateString()}`,
          menuType: 'visual',
          coverImage: restaurantPhoto || '',
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
        
        console.log(`New restaurant added: "${restaurantName}" with description: ${restaurantDescription ? 'Yes' : 'No'}, photo: ${restaurantPhoto ? 'Yes' : 'No'}`)
        
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

async function fetchAllSheets(spreadsheetId: string, apiKey?: string): Promise<SheetData[]> {
  if (!apiKey) {
    throw new Error('Google Sheets API key is required. Please enter your API key to import data.')
  }
  
  const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
  
  console.log('Fetching spreadsheet metadata...')
  
  let metadataResponse: Response
  try {
    metadataResponse = await fetch(metadataUrl)
  } catch (fetchError) {
    console.error('Network error during fetch:', fetchError)
    throw new Error(
      `Network error: Unable to connect to Google Sheets API.\n\n` +
      `This could be caused by:\n` +
      `1. No internet connection\n` +
      `2. Browser blocking the request (check console for CORS errors)\n` +
      `3. Google Sheets API is temporarily unavailable\n` +
      `4. Firewall or network restrictions\n\n` +
      `Error details: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}\n\n` +
      `Please check your internet connection and try again.`
    )
  }
  
  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text()
    console.error('Metadata fetch error:', errorText)
    
    let errorData: any
    try {
      errorData = JSON.parse(errorText)
    } catch (e) {
      errorData = null
    }
    
    if (metadataResponse.status === 404) {
      throw new Error(
        `Spreadsheet not found.\n\n` +
        `Please check:\n` +
        `1. The spreadsheet URL is correct\n` +
        `2. The spreadsheet is shared publicly (Anyone with the link can view)\n` +
        `3. The spreadsheet has not been deleted`
      )
    }
    
    if (metadataResponse.status === 403) {
      if (errorData?.error?.message?.includes('Sheets API has not been used') || 
          errorData?.error?.message?.includes('SERVICE_DISABLED')) {
        const activationUrl = errorData?.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.ErrorInfo')?.metadata?.activationUrl
        
        throw new Error(
          `Google Sheets API is not enabled for your API key.\n\n` +
          `REQUIRED ACTION:\n` +
          `1. Visit the activation URL: ${activationUrl || 'Google Cloud Console'}\n` +
          `2. Click "Enable API" button\n` +
          `3. Wait 2-3 minutes for changes to propagate\n` +
          `4. Try importing again\n\n` +
          `Note: This is a one-time setup. After enabling the API, all future imports will work.`
        )
      }
      
      throw new Error(
        `Access denied to Google Sheets.\n\n` +
        `Possible reasons:\n` +
        `1. Google Sheets API is not enabled - visit Google Cloud Console and enable it\n` +
        `2. API key is invalid or expired - check your API key\n` +
        `3. Spreadsheet is not shared publicly - make sure it's set to "Anyone with the link can view"\n\n` +
        `Full error: ${errorData?.error?.message || errorText}`
      )
    }
    
    if (metadataResponse.status === 400) {
      if (errorData?.error?.message?.includes('API key not valid')) {
        throw new Error(
          `Invalid API key.\n\n` +
          `Please check:\n` +
          `1. You copied the complete API key from Google Cloud Console\n` +
          `2. The API key has not been deleted or restricted\n` +
          `3. You're using the correct API key (not a different type of credential)`
        )
      }
      throw new Error(`Invalid request. Please check your Google Sheets URL and API key. ${errorText}`)
    }
    
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
