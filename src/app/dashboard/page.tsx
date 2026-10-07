'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClassCard } from '@/components/ClassCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { IconPengumpulan, IconTugas, IconMateri, IconPengumuman, IconKelas } from '@/components/icons/DiampuIcons'
import { TugasSiswa } from '@/types'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kelas, setKelas] = useState([])
  const [stats, setStats] = useState({ kelas: 0, materi: 0, tugas: 0, pengumuman: 0 })
  const [tugasSaya, setTugasSaya] = useState<TugasSiswa[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const resKelas = await fetch('/api/kelas')
      if (resKelas.ok) {
        const data = await resKelas.json()
        setKelas(data)
        
        if (session?.user?.role === 'PENGAJAR') {
            const count = data.length;
            const materiCount = data.reduce((acc: number, curr: any) => acc + (curr._count?.materi || 0), 0)
            const tugasCount = data.reduce((acc: number, curr: any) => acc + (curr._count?.tugas || 0), 0)
            const pengumumanCount = data.reduce((acc: number, curr: any) => acc + (curr._count?.pengumuman || 0), 0)
            setStats({
                kelas: count,
                materi: materiCount,
                tugas: tugasCount,
                pengumuman: pengumumanCount
            })
        }
      }

      if (session?.user?.role === 'SISWA') {
        const resTugas = await fetch('/api/tugas/siswa')
        if (resTugas.ok) {
          setTugasSaya(await resTugas.json())
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner text="Memuat dashboard..." />
      </div>
    )
  }

  if (!session) return null

  const isPengajar = session.user.role === 'PENGAJAR'
  const isSiswa = session.user.role === 'SISWA'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang, <span className="font-semibold">{session.user.name}</span>
        </p>
      </div>

      {isPengajar && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center text-primary-500 mb-1"><IconKelas size={22} /></div>
            <p className="text-sm text-gray-500 font-medium">Jumlah Kelas</p>
            <p className="text-3xl font-bold text-primary-500 mt-1">{stats.kelas}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center text-green-600 mb-1"><IconMateri size={22} /></div>
            <p className="text-sm text-gray-500 font-medium">Total Materi</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.materi}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center text-yellow-600 mb-1"><IconTugas size={22} /></div>
            <p className="text-sm text-gray-500 font-medium">Total Tugas</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.tugas}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center text-blue-600 mb-1"><IconPengumuman size={22} /></div>
            <p className="text-sm text-gray-500 font-medium">Pengumuman</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.pengumuman}</p>
          </div>
        </div>
      )}

      {isSiswa && tugasSaya.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Tugas Saya</h2>
          <div className="space-y-3">
            {tugasSaya.map((t) => (
              <div key={t.tugasId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{t.judul}</p>
                  <p className="text-xs text-gray-500">{t.kelasNama}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.submittedAt ? (
                    <>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium border',
                          t.status === 'DINILAI'
                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                            : t.status === 'TERLAMBAT'
                            ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                            : 'text-green-700 bg-green-50 border-green-200'
                        )}
                      >
                        {t.status === 'DINILAI' ? 'Dinilai' : t.status === 'TERLAMBAT' ? 'Terlambat' : 'Terkumpul'}
                      </span>
                      {t.score !== null && t.score !== undefined && (
                        <span className="text-sm font-bold text-blue-700">{t.score}/100</span>
                      )}
                    </>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border text-gray-600 bg-gray-50 border-gray-200">
                      Belum dikumpulkan
                    </span>
                  )}
                  <Link
                    href={`/kelas/${t.kelasId}/tugas`}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Buka
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPengajar && (
        <Link
          href="/dashboard/pengumpulan"
          className="flex items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-10 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
              <IconPengumpulan size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Pengumpulan Tugas</p>
              <p className="text-sm text-gray-500">Lihat dan nilai tugas yang dikumpulkan siswa</p>
            </div>
          </div>
          <span className="text-primary-500 font-medium">&rarr;</span>
        </Link>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isPengajar ? 'Kelas yang Diampu' : 'Semua Kelas'}
          </h2>
          {isPengajar && (
            <Link 
              href="/kelas/baru" 
              className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              + Buat Kelas Baru
            </Link>
          )}
        </div>

        {kelas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kelas.map((k: any) => (
              <ClassCard key={k.id} kelas={k} />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Tidak ada kelas" 
            message={isPengajar ? "Anda belum membuat kelas apapun." : "Belum ada kelas yang tersedia."} 
          />
        )}
      </div>
    </div>
  )
}
