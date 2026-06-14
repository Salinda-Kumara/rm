import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function saveUploadedFile(file: File, subfolder: string): Promise<string> {
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  const finalDir = path.resolve(uploadDir, subfolder)
  
  // Ensure directory exists
  await fs.mkdir(finalDir, { recursive: true })
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.')
  }
  
  // Validate file size (5MB limit)
  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error('File size exceeds the 5MB limit.')
  }
  
  // Generate unique filename
  const extension = path.extname(file.name) || `.${file.type.split('/')[1]}`
  const filename = `${uuidv4()}${extension}`
  const filepath = path.join(finalDir, filename)
  
  // Write file
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filepath, buffer)
  
  // Return the path string (relative to uploads folder)
  // E.g., "payment_slips/some-uuid.png"
  return `${subfolder}/${filename}`
}
