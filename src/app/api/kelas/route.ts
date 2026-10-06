import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function generateKode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const mapel = searchParams.get('mapel')

    const where: any = {}
    if (q) {
      where.OR = [
        { nama: { contains: q } },
        { deskripsi: { contains: q } },
      ]
    }
    if (mapel) {
      where.mataPelajaran = mapel
    }

    const kelas = await prisma.kelas.findMany({
      where,
      include: {
        pengajar: {
          select: { id: true, nama: true, email: true }
        },
        _count: {
          select: { materi: true, gambar: true, tugas: true, pengumuman: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(kelas)
  } catch (error) {
    console.error('Error in GET /api/kelas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nama, deskripsi, mataPelajaran, tahunAjaran } = body

    if (!nama || !mataPelajaran || !tahunAjaran) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const kode = generateKode()

    const newKelas = await prisma.kelas.create({
      data: {
        nama,
        deskripsi,
        mataPelajaran,
        tahunAjaran,
        kode,
        pengajarId: session.user.id
      }
    })

    return NextResponse.json(newKelas, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/kelas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
