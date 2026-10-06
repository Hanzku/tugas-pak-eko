import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {

    const kelas = await prisma.kelas.findUnique({
      where: { id: params.id },
      include: {
        pengajar: {
          select: { id: true, nama: true, email: true }
        },
        _count: {
          select: { materi: true, gambar: true, tugas: true, pengumuman: true }
        },
        pengumuman: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!kelas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(kelas)
  } catch (error) {
    console.error('Error in GET /api/kelas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingKelas = await prisma.kelas.findUnique({
      where: { id: params.id }
    })

    if (!existingKelas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (existingKelas.pengajarId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { nama, deskripsi, mataPelajaran, tahunAjaran } = body

    const updatedKelas = await prisma.kelas.update({
      where: { id: params.id },
      data: {
        nama: nama ?? existingKelas.nama,
        deskripsi: deskripsi ?? existingKelas.deskripsi,
        mataPelajaran: mataPelajaran ?? existingKelas.mataPelajaran,
        tahunAjaran: tahunAjaran ?? existingKelas.tahunAjaran,
      }
    })

    return NextResponse.json(updatedKelas)
  } catch (error) {
    console.error('Error in PUT /api/kelas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingKelas = await prisma.kelas.findUnique({
      where: { id: params.id }
    })

    if (!existingKelas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (existingKelas.pengajarId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.kelas.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/kelas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
