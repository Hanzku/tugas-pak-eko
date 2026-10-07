import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface ServerSession {
  userId: string
  role: string
  email: string
  nama: string
}

/**
 * Ambil session yang sudah divalidasi dari server (NextAuth JWT).
 * Role dan userId diambil dari token yang diterbitkan server, bukan dari frontend.
 */
export async function getAuth(): Promise<ServerSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.role) return null
  return {
    userId: session.user.id as string,
    role: session.user.role as string,
    email: (session.user.email as string) || '',
    nama: (session.user.name as string) || '',
  }
}

export function isPengajar(auth: ServerSession | null): boolean {
  return auth?.role === 'PENGAJAR'
}