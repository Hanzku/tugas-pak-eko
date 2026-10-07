import { prisma } from './prisma'

/**
 * Sumber waktu utama server.
 * Deadline harus dievaluasi dengan waktu database (PostgreSQL), bukan jam komputer klien.
 * Saat database tidak dapat dihubungi, fallback ke waktu server (bukan klien).
 */
export async function getServerNow(): Promise<Date> {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`
    if (result && result[0]?.now) {
      return new Date(result[0].now)
    }
  } catch {
    // fallback ke waktu server
  }
  return new Date()
}

/**
 * Cek apakah deadline tugas sudah terlewat berdasarkan waktu server/database.
 */
export async function isDeadlinePassed(deadline: Date | null | undefined): Promise<boolean> {
  if (!deadline) return false
  const now = await getServerNow()
  return now.getTime() >= new Date(deadline).getTime()
}