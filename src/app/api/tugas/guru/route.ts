import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/serverAuth'

/**
 * GET /api/tugas/guru
 * Daftar semua tugas dari kelas yang diampu pengajar,
 * beserta jumlah submission dan jumlah yang sudah dinilai.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || auth.role !== 'PENGAJAR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tugasList = await prisma.tugas.findMany({
      where: {
        kelas: {
          pengajarId: auth.userId,
        },
      },
      include: {
        kelas: {
          select: { id: true, nama: true, mataPelajaran: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Hitung jumlah submission yang sudah dinilai
    const withGraded = await Promise.all(
      tugasList.map(async (t) => {
        const graded = await prisma.submission.count({
          where: { assignmentId: t.id, status: 'DINILAI' },
        })
        return {
          id: t.id,
          judul: t.judul,
          deskripsi: t.deskripsi,
          deadline: t.deadline,
          createdAt: t.createdAt,
          kelas: t.kelas,
          jumlahSubmission: t._count.submissions,
          jumlahDinilai: graded,
        }
      })
    )

    return NextResponse.json(withGraded)
  } catch (error) {
    console.error('Error in GET /api/tugas/guru:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}