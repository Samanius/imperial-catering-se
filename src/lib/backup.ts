export interface ChangeDetail {
  field: string
  oldValue: any
  newValue: any
  changeType: 'added' | 'modified' | 'removed'
}

export interface BackupEntry {
  timestamp: number
  date: string
  action: 'create' | 'update' | 'delete'
  entityType: 'restaurant'
  entityId: string
  entityName: string
  data: any
  previousData?: any
  changes?: ChangeDetail[]
  changesSummary?: string
}

function detectChanges(oldData: any, newData: any): ChangeDetail[] {
  const changes: ChangeDetail[] = []
  
  if (!oldData) return []
  
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
  
  allKeys.forEach(key => {
    const oldValue = oldData[key]
    const newValue = newData[key]
    
    if (oldValue === undefined && newValue !== undefined) {
      changes.push({
        field: key,
        oldValue: null,
        newValue: newValue,
        changeType: 'added'
      })
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: null,
        changeType: 'removed'
      })
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (key === 'menuItems') {
          const oldItems = oldValue.length
          const newItems = newValue.length
          if (oldItems !== newItems) {
            changes.push({
              field: 'menuItems',
              oldValue: `${oldItems} items`,
              newValue: `${newItems} items`,
              changeType: 'modified'
            })
          } else {
            changes.push({
              field: 'menuItems',
              oldValue: 'modified',
              newValue: 'modified',
              changeType: 'modified'
            })
          }
        } else {
          changes.push({
            field: key,
            oldValue: oldValue,
            newValue: newValue,
            changeType: 'modified'
          })
        }
      } else {
        changes.push({
          field: key,
          oldValue: oldValue,
          newValue: newValue,
          changeType: 'modified'
        })
      }
    }
  })
  
  return changes
}

function generateChangesSummary(action: string, changes: ChangeDetail[], entityName: string): string {
  if (action === 'create') {
    return `Restaurant "${entityName}" created`
  }
  
  if (action === 'delete') {
    return `Restaurant "${entityName}" deleted`
  }
  
  if (changes.length === 0) {
    return 'No changes detected'
  }
  
  const summaryParts: string[] = []
  
  changes.forEach(change => {
    if (change.changeType === 'added') {
      summaryParts.push(`Added ${change.field}`)
    } else if (change.changeType === 'removed') {
      summaryParts.push(`Removed ${change.field}`)
    } else if (change.changeType === 'modified') {
      if (change.field === 'menuItems') {
        summaryParts.push(`Menu items updated (${change.newValue})`)
      } else {
        summaryParts.push(`Modified ${change.field}`)
      }
    }
  })
  
  return summaryParts.join(', ')
}

export async function createBackup(
  action: 'create' | 'update' | 'delete',
  entityType: 'restaurant',
  entityId: string,
  entityName: string,
  data: any,
  previousData?: any
): Promise<void> {
  try {
    const backups = await window.spark.kv.get<BackupEntry[]>('admin-backups') || []
    
    const changes = action === 'update' && previousData ? detectChanges(previousData, data) : []
    const changesSummary = generateChangesSummary(action, changes, entityName)
    
    const backupEntry: BackupEntry = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      action,
      entityType,
      entityId,
      entityName,
      data: JSON.parse(JSON.stringify(data)),
      previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : undefined,
      changes: changes.length > 0 ? changes : undefined,
      changesSummary
    }
    
    backups.push(backupEntry)
    
    await window.spark.kv.set('admin-backups', backups)
    
    console.log(`✅ Backup created: ${action} ${entityType} "${entityName}" at ${backupEntry.date}`)
  } catch (error) {
    console.error('❌ Failed to create backup:', error)
  }
}

export async function getBackups(): Promise<BackupEntry[]> {
  try {
    return await window.spark.kv.get<BackupEntry[]>('admin-backups') || []
  } catch (error) {
    console.error('❌ Failed to get backups:', error)
    return []
  }
}

export async function exportBackupsAsJSON(): Promise<string> {
  const backups = await getBackups()
  return JSON.stringify(backups, null, 2)
}

export async function getLatestBackupForEntity(entityId: string): Promise<BackupEntry | undefined> {
  const backups = await getBackups()
  return backups
    .filter(b => b.entityId === entityId)
    .sort((a, b) => b.timestamp - a.timestamp)[0]
}

export async function restoreFromBackup(backupEntry: BackupEntry): Promise<any> {
  return JSON.parse(JSON.stringify(backupEntry.data))
}

export async function clearOldBackups(daysToKeep: number = 30): Promise<void> {
  try {
    const backups = await getBackups()
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    
    const filteredBackups = backups.filter(b => b.timestamp > cutoffTime)
    
    await window.spark.kv.set('admin-backups', filteredBackups)
    
    console.log(`✅ Cleared backups older than ${daysToKeep} days`)
  } catch (error) {
    console.error('❌ Failed to clear old backups:', error)
  }
}
