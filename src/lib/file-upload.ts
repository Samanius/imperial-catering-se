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

export async function processImageUpload(file: File): Promise<string> {
  const error = validateImageFile(file)
  if (error) {
    throw new Error(error)
  }
  
  return await convertImageToBase64(file)
}
