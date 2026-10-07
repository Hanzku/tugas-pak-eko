import { put, del } from '@vercel/blob'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface SavedFile {
  url: string
  fileName: string
  fileSize: number
}

export async function saveFile(file: File, directory: string = 'uploads'): Promise<SavedFile> {
  const safeDir = directory.replace(/[^a-zA-Z0-9\/_-]/g, '')
  const uniqueFilename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${safeDir}/${uniqueFilename}`, file, {
      access: 'public',
    })
    return {
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
    }
  } else {
    const uploadDir = path.join(process.cwd(), 'public', safeDir)
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    return {
      url: `/uploads/${uniqueFilename}`,
      fileName: file.name,
      fileSize: file.size,
    }
  }
}

export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    if (fileUrl.startsWith('http') && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(fileUrl)
      return true
    } else if (fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(fileUrl)
      const filePath = path.join(process.cwd(), 'public/uploads', filename)
      await unlink(filePath).catch(() => {})
      return true
    }
    return false
  } catch (err) {
    console.error('Error deleting file:', err)
    return false
  }
}
