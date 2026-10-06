import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'document' // 'image' or 'document'
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Basic size validation
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
    const MAX_DOC_SIZE = 20 * 1024 * 1024 // 20MB
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size is ${maxSize / (1024*1024)}MB` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueFilename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob
      const blob = await put(`uploads/${uniqueFilename}`, file, {
        access: 'public',
      })
      return NextResponse.json({
        url: blob.url,
        fileName: file.name,
        fileSize: file.size
      })
    } else {
      // Use local fs
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      await mkdir(uploadDir, { recursive: true })
      
      const filePath = path.join(uploadDir, uniqueFilename)
      await writeFile(filePath, buffer)
      
      return NextResponse.json({
        url: `/uploads/${uniqueFilename}`,
        fileName: file.name,
        fileSize: file.size
      })
    }
  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
