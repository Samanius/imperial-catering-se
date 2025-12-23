export interface BackupEntry {
  timestamp: number
  date: string
  action: 'create' | 'update' | 'delete'
  entityType: 'restaurant'
  entityId: string
  entityName: string
  data: any
  previousData?: any
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
    
    const backupEntry: BackupEntry = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      action,
      entityType,
      entityId,
      entityName,
      data: JSON.parse(JSON.stringify(data)),
      previousData: previousData ? JSON.parse(JSON.stringify(previousData)) : undefined
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
