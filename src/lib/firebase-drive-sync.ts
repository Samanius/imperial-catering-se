interface FirebaseConfig {
  apiKey: string
  projectId: string
  storageBucket: string
}

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webContentLink?: string
  thumbnailLink?: string
}

export class FirebaseDriveSync {
  private firebaseConfig: FirebaseConfig | null = null
  private googleApiKey: string | null = null

  constructor(firebaseConfig?: FirebaseConfig, googleApiKey?: string) {
    if (firebaseConfig) {
      this.firebaseConfig = firebaseConfig
    }
    if (googleApiKey) {
      this.googleApiKey = googleApiKey
    }
  }

  setFirebaseConfig(config: FirebaseConfig) {
    this.firebaseConfig = config
  }

  setGoogleApiKey(apiKey: string) {
    this.googleApiKey = apiKey
  }

  extractDriveFolderId(url: string): string | null {
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{25,})$/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  async listDriveFiles(folderId: string): Promise<GoogleDriveFile[]> {
    if (!this.googleApiKey) {
      throw new Error('Google API Key not configured')
    }

    const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed=false`)
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webContentLink,thumbnailLink)&key=${this.googleApiKey}`

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(`Failed to list Drive files: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('Error listing Drive files:', error)
      throw error
    }
  }

  async downloadDriveFile(fileId: string): Promise<Blob> {
    if (!this.googleApiKey) {
      throw new Error('Google API Key not configured')
    }

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.googleApiKey}`

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Error downloading Drive file:', error)
      throw error
    }
  }

  async uploadToFirebase(blob: Blob, path: string, fileName: string): Promise<string> {
    if (!this.firebaseConfig) {
      throw new Error('Firebase config not set')
    }

    const { apiKey, storageBucket } = this.firebaseConfig

    const fullPath = `${path}/${fileName}`
    const url = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?uploadType=media&name=${encodeURIComponent(fullPath)}`

    try {
      const uploadResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'image/jpeg',
        },
        body: blob,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json().catch(() => ({}))
        throw new Error(`Failed to upload to Firebase: ${error.error?.message || uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()
      const token = await this.getOrCreateDownloadToken(fullPath)
      
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fullPath)}?alt=media&token=${token}`
      
      return downloadUrl
    } catch (error) {
      console.error('Error uploading to Firebase:', error)
      throw error
    }
  }

  private async getOrCreateDownloadToken(path: string): Promise<string> {
    if (!this.firebaseConfig) {
      throw new Error('Firebase config not set')
    }

    const { apiKey, storageBucket } = this.firebaseConfig
    
    const metadataUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(path)}`
    
    try {
      const response = await fetch(metadataUrl)
      const data = await response.json()
      
      if (data.downloadTokens) {
        return data.downloadTokens.split(',')[0]
      }
      
      const newToken = this.generateToken()
      
      const updateUrl = `${metadataUrl}?alt=media`
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            firebaseStorageDownloadTokens: newToken
          }
        })
      })
      
      return newToken
    } catch (error) {
      console.error('Error managing download token:', error)
      return this.generateToken()
    }
  }

  private generateToken(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async syncDriveToFirebase(
    driveFolderId: string, 
    firebasePath: string,
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<{ success: string[]; failed: Array<{ name: string; error: string }> }> {
    const files = await this.listDriveFiles(driveFolderId)
    const results = {
      success: [] as string[],
      failed: [] as Array<{ name: string; error: string }>
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (onProgress) {
        onProgress(i + 1, files.length, file.name)
      }

      try {
        const blob = await this.downloadDriveFile(file.id)
        
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        
        const firebaseUrl = await this.uploadToFirebase(blob, firebasePath, sanitizedFileName)
        
        results.success.push(firebaseUrl)
        
        console.log(`✓ Uploaded: ${file.name} → ${firebaseUrl}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.failed.push({
          name: file.name,
          error: errorMessage
        })
        console.error(`✗ Failed to sync ${file.name}:`, errorMessage)
      }
    }

    return results
  }
}

export function createFirebaseDriveSync(
  firebaseApiKey: string,
  firebaseProjectId: string,
  firebaseStorageBucket: string,
  googleApiKey: string
): FirebaseDriveSync {
  return new FirebaseDriveSync(
    {
      apiKey: firebaseApiKey,
      projectId: firebaseProjectId,
      storageBucket: firebaseStorageBucket
    },
    googleApiKey
  )
}
