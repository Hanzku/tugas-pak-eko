import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuth } from '@/lib/serverAuth'
import { saveFile } from '@/lib/storage'
import { getServerNow } from '@/lib/time'

// Format file yang diizinkan untuk submission tugas
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.jpg', '.jpeg', '.png']
const MAX_SUBMISSION_SIZE = 20 * 1024 * 1024 // 20MB

function getExtension(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : ''
}

/**
 * GET /api/submissions?assignmentId=xxx
 * - Siswa: hanya submission miliknya sendiri
 * - Pengajar: semua submission untuk tugas di kelas yang diampunya
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })
    }

    const assignment = await prisma.tugas.findUnique({
      where: { id: assignmentId },
      include: { kelas: true },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 })
    }

    const isOwnerTeacher = assignment.kelas.pengajarId === auth.userId

    if (auth.role === 'PENGAJAR' && !isOwnerTeacher) {
      return NextResponse.json({ error: 'Forbidden: Ini bukan kelas yang Anda ampu' }, { status: 403 })
    }

    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        // Siswa hanya boleh melihat submission miliknya sendiri
        ...(auth.role === 'SISWA' ? { studentId: auth.userId } : {}),
      },
      include: {
        student: {
          select: { id: true, nama: true, email: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error in GET /api/submissions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/submissions
 * Siswa mengumpulkan / merevisi tugas.
 * Deadline ditegakkan di server menggunakan waktu database.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (auth.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Hanya siswa yang dapat mengumpulkan tugas.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const assignmentId = formData.get('assignmentId') as string
    const file = formData.get('file') as File | null

    if (!assignmentId || !file || file.size === 0) {
      return NextResponse.json(
        { error: 'Tugas dan file wajib dipilih.' },
        { status: 400 }
      )
    }

    // Validasi format file di server
    const ext = getExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Format file tidak didukung. Format yang diizinkan: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validasi ukuran file di server
    if (file.size > MAX_SUBMISSION_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 20MB.' },
        { status: 400 }
      )
    }

    const assignment = await prisma.tugas.findUnique({
      where: { id: assignmentId },
      include: { kelas: true },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 })
    }

    // === PENEGAKAN DEADLINE DI SERVER ===
    // Waktu diambil dari database, bukan dari jam komputer siswa.
    const now = await getServerNow()
    if (assignment.deadline && now.getTime() >= new Date(assignment.deadline).getTime()) {
      return NextResponse.json(
        { error: 'Waktu pengumpulan tugas sudah berakhir.' },
        { status: 403 }
      )
    }

    // Upload file ke storage dengan struktur rapi
    const saved = await saveFile(file, `assignments/${assignmentId}/submissions/${auth.userId}`)

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: auth.userId,
        },
      },
      update: {
        fileUrl: saved.url,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: now,
        status: 'DIKUMPULKAN',
        score: null,
        feedback: null,
        gradedAt: null,
        gradedById: null,
      },
      create: {
        assignmentId,
        studentId: auth.userId,
        fileUrl: saved.url,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: now,
        status: 'DIKUMPULKAN',
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/submissions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}