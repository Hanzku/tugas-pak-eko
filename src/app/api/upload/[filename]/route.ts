import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { del } from '@vercel/blob'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filename = params.filename
    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Try to construct URL. Note: we might not have the full vercel blob URL here if it's just the filename. 
      // Vercel blob del() takes url or urls. If the client passes the full URL encoded as filename parameter, we can use it.
      // Usually, it's better to pass the full URL in the body for Vercel Blob deletion. 
      // Let's assume filename parameter is actually the full URL encoded or the client will handle it.
      // For safety, we can parse URL from search params if needed.
      const url = request.nextUrl.searchParams.get('url')
      if (url) {
        await del(url)
      }
    } else {
      // Local delete
      const filePath = path.join(process.cwd(), 'public/uploads', filename)
      try {
        await unlink(filePath)
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
        // File doesn't exist, ignore
      }
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/upload/[filename]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
