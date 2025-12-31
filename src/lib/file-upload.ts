export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }
    
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      let width = img.width
      let height = img.height
      
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = (height * maxWidth) / width
          width = maxWidth
        } else {
          width = (width * maxWidth) / height
          height = maxWidth
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`Image compressed: ${file.size} bytes → ${blob.size} bytes (${Math.round(blob.size / file.size * 100)}%)`)
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
    
    img.src = objectUrl
  })
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as string'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload JPG, PNG, WebP, or GIF images.'
  }
  
  if (file.size > maxSize) {
    return 'File is too large. Maximum size is 5MB.'
  }
  
  return null
}

export async function processImageUpload(file: File, maxWidth: number = 800, quality: number = 0.75): Promise<string> {
  const error = validateImageFile(file)
  if (error) {
    throw new Error(error)
  }
  
  const compressedBlob = await compressImage(file, maxWidth, quality)
  const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })
  
  const base64 = await convertImageToBase64(compressedFile)
  console.log(`Base64 image size: ${base64.length} characters (${Math.round(base64.length / 1024)} KB)`)
  
  if (base64.length > 500000) {
    console.warn('⚠️ Image is large (>500KB as base64). Consider further compression.')
  }
  
  return base64
}
