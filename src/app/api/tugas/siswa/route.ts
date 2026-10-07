import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { TugasSiswa } from '@/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siswaId = session.user.id;

    const kelasSiswa = await prisma.kelas.findMany({
      where: {
        OR: [
          { siswa: { some: { id: siswaId } } },
          { tugas: { some: { submissions: { some: { studentId: siswaId } } } } },
        ],
      },
      select: { id: true },
    });

    const kelasIds = kelasSiswa.map((k) => k.id);

    if (kelasIds.length === 0) {
      return NextResponse.json([]);
    }

    const tugasList = await prisma.tugas.findMany({
      where: { kelasId: { in: kelasIds } },
      include: {
        kelas: { select: { id: true, nama: true } },
        submissions: {
          where: { studentId: siswaId },
          select: { submittedAt: true, status: true, score: true, feedback: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result: TugasSiswa[] = tugasList.map((t) => {
      const sub = t.submissions[0];
      return {
        tugasId: t.id,
        kelasId: t.kelas.id,
        kelasNama: t.kelas.nama,
        judul: t.judul,
        deadline: t.deadline ? t.deadline.toISOString() : null,
        submittedAt: sub ? sub.submittedAt.toISOString() : null,
        status: (sub?.status as TugasSiswa['status']) ?? null,
        score: sub ? sub.score : null,
        feedback: sub ? sub.feedback : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/tugas/siswa:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}