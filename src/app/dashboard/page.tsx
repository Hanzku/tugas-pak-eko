'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClassCard } from '@/components/ClassCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kelas, setKelas] = useState([])
  const [stats, setStats] = useState({ kelas: 0, materi: 0, tugas: 0, pengumuman: 0 })
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
            setStats({
                kelas: count,
                materi: materiCount,
                tugas: tugasCount,
                pengumuman: count * 2 // mock for demo
            })
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
            <p className="text-sm text-gray-500 font-medium">Jumlah Kelas</p>
            <p className="text-3xl font-bold text-primary-500 mt-1">{stats.kelas}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-sm text-gray-500 font-medium">Total Materi</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.materi}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-sm text-gray-500 font-medium">Total Tugas</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.tugas}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-sm text-gray-500 font-medium">Pengumuman</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.pengumuman}</p>
          </div>
        </div>
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
