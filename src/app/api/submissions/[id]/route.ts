import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/serverAuth'

/**
 * GET /api/submissions/[id]
 * Siswa hanya boleh melihat submission miliknya sendiri.
 * Pengajar hanya boleh melihat submission dari kelas yang diampunya.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        student: { select: { id: true, nama: true, email: true } },
        assignment: { include: { kelas: true } },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
    }

    if (auth.role === 'SISWA' && submission.studentId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (auth.role === 'PENGAJAR' && submission.assignment.kelas.pengajarId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden: Ini bukan kelas yang Anda ampu' }, { status: 403 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error in GET /api/submissions/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * PUT /api/submissions/[id]
 * Guru memberikan nilai dan feedback. Validasi nilai 0-100.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'PENGAJAR') {
      return NextResponse.json(
        { error: 'Hanya pengajar yang dapat memberikan nilai.' },
        { status: 403 }
      )
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: { include: { kelas: true } },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
    }

    // Authorization: guru hanya boleh menilai submission dari kelasnya sendiri
    if (submission.assignment.kelas.pengajarId !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden: Ini bukan kelas yang Anda ampu' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { score, feedback } = body

    // Validasi nilai 0-100
    const parsedScore = Number(score)
    if (score === null || score === undefined || Number.isNaN(parsedScore) || !Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      return NextResponse.json(
        { error: 'Nilai harus berupa angka bulat antara 0 sampai 100.' },
        { status: 400 }
      )
    }

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        score: parsedScore,
        feedback: typeof feedback === 'string' ? feedback.trim() : null,
        status: 'DINILAI',
        gradedAt: new Date(),
        gradedById: auth.userId,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error in PUT /api/submissions/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}