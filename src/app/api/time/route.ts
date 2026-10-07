import { NextResponse } from 'next/server'
import { getServerNow } from '@/lib/time'

/**
 * GET /api/time
 * Mengembalikan waktu server/database agar client tidak bergantung
 * pada jam komputer pengguna untuk menampilkan status deadline.
 */
export async function GET() {
  const now = await getServerNow()
  return NextResponse.json({ now: now.toISOString() })
}