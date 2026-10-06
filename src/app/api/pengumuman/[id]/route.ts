import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id: params.id }
    })

    if (!pengumuman) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(pengumuman)
  } catch (error) {
    console.error('Error in GET /api/pengumuman/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id: params.id }
    })

    if (!pengumuman) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.pengumuman.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/pengumuman/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
