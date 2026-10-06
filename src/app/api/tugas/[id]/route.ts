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

    const tugas = await prisma.tugas.findUnique({
      where: { id: params.id }
    })

    if (!tugas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(tugas)
  } catch (error) {
    console.error('Error in GET /api/tugas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingTugas = await prisma.tugas.findUnique({
      where: { id: params.id }
    })

    if (!existingTugas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { judul, deskripsi, deadline, fileUrl, fileName } = body

    const updatedTugas = await prisma.tugas.update({
      where: { id: params.id },
      data: {
        judul: judul ?? existingTugas.judul,
        deskripsi: deskripsi ?? existingTugas.deskripsi,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existingTugas.deadline,
        fileUrl: fileUrl ?? existingTugas.fileUrl,
        fileName: fileName ?? existingTugas.fileName,
      }
    })

    return NextResponse.json(updatedTugas)
  } catch (error) {
    console.error('Error in PUT /api/tugas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tugas = await prisma.tugas.findUnique({
      where: { id: params.id }
    })

    if (!tugas) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.tugas.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/tugas/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
