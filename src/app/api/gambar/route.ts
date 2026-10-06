import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveFile } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')

    if (!kelasId) {
      return NextResponse.json({ error: 'kelasId is required' }, { status: 400 })
    }

    const gambar = await prisma.gambar.findMany({
      where: { kelasId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(gambar)
  } catch (error) {
    console.error('Error in GET /api/gambar:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized: Hanya Pengajar yang dapat mengunggah gambar' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const kelasId = formData.get('kelasId') as string
      const judul = formData.get('judul') as string
      const deskripsi = (formData.get('deskripsi') as string) || ''
      const file = formData.get('file') as File | null

      if (!kelasId || !judul || !file) {
        return NextResponse.json({ error: 'kelasId, judul, dan file gambar wajib diisi' }, { status: 400 })
      }

      const saved = await saveFile(file)

      const newGambar = await prisma.gambar.create({
        data: {
          judul,
          deskripsi: deskripsi || null,
          imageUrl: saved.url,
          fileName: saved.fileName,
          fileSize: saved.fileSize,
          kelasId
        }
      })

      return NextResponse.json(newGambar, { status: 201 })
    } else {
      const body = await request.json()
      const { judul, deskripsi, imageUrl, fileName, fileSize, kelasId } = body

      if (!judul || !imageUrl || !fileName || !fileSize || !kelasId) {
        return NextResponse.json({ error: 'Data gambar tidak lengkap' }, { status: 400 })
      }

      const newGambar = await prisma.gambar.create({
        data: {
          judul,
          deskripsi: deskripsi || null,
          imageUrl,
          fileName,
          fileSize,
          kelasId
        }
      })

      return NextResponse.json(newGambar, { status: 201 })
    }
  } catch (error) {
    console.error('Error in POST /api/gambar:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
