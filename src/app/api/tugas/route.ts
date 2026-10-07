import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { saveFile } from '@/lib/storage'
import { getAuth } from '@/lib/serverAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')

    if (!kelasId) {
      return NextResponse.json({ error: 'kelasId is required' }, { status: 400 })
    }

    const tugas = await prisma.tugas.findMany({
      where: { kelasId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tugas)
  } catch (error) {
    console.error('Error in GET /api/tugas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || auth.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized: Hanya Pengajar yang dapat membuat tugas' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const kelasId = formData.get('kelasId') as string
      const judul = formData.get('judul') as string
      const deskripsi = (formData.get('deskripsi') as string) || ''
      const deadline = formData.get('deadline') as string | null
      const file = formData.get('file') as File | null

      if (!kelasId || !judul) {
        return NextResponse.json({ error: 'kelasId dan judul tugas wajib diisi' }, { status: 400 })
      }

      // Authorization: guru hanya boleh membuat tugas di kelas yang diampunya
      const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } })
      if (!kelas || kelas.pengajarId !== auth.userId) {
        return NextResponse.json({ error: 'Forbidden: Ini bukan kelas yang Anda ampu' }, { status: 403 })
      }

      let fileUrl: string | null = null
      let fileName: string | null = null

      if (file && file.size > 0) {
        const saved = await saveFile(file)
        fileUrl = saved.url
        fileName = saved.fileName
      }

      const newTugas = await prisma.tugas.create({
        data: {
          judul,
          deskripsi,
          deadline: deadline ? new Date(deadline) : null,
          fileUrl,
          fileName,
          kelasId
        }
      })

      return NextResponse.json(newTugas, { status: 201 })
    } else {
      const body = await request.json()
      const { judul, deskripsi, deadline, fileUrl, fileName, kelasId } = body

      if (!judul || !kelasId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } })
      if (!kelas || kelas.pengajarId !== auth.userId) {
        return NextResponse.json({ error: 'Forbidden: Ini bukan kelas yang Anda ampu' }, { status: 403 })
      }

      const newTugas = await prisma.tugas.create({
        data: {
          judul,
          deskripsi: deskripsi || '',
          deadline: deadline ? new Date(deadline) : null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          kelasId
        }
      })

      return NextResponse.json(newTugas, { status: 201 })
    }
  } catch (error) {
    console.error('Error in POST /api/tugas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
