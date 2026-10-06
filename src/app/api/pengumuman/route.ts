import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')

    if (!kelasId) {
      return NextResponse.json({ error: 'kelasId is required' }, { status: 400 })
    }

    const pengumuman = await prisma.pengumuman.findMany({
      where: { kelasId },
      orderBy: [
        { penting: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(pengumuman)
  } catch (error) {
    console.error('Error in GET /api/pengumuman:', error)
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
    const { judul, isi, penting, kelasId } = body

    if (!judul || !isi || !kelasId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPengumuman = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        penting: penting ?? false,
        kelasId
      }
    })

    return NextResponse.json(newPengumuman, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pengumuman:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
