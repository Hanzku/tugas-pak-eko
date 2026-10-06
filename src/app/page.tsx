import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ClassCard from '@/components/ClassCard'
import EmptyState from '@/components/EmptyState'

export const dynamic = 'force-dynamic';

export default async function Home() {
  const latestKelas = await prisma.kelas.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      pengajar: {
        select: { nama: true }
      },
      _count: {
        select: { materi: true, tugas: true }
      }
    }
  })

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">DIAMPU</h1>
          <p className="text-xl md:text-2xl mb-6">Ruang Digital Kelas yang Diampu</p>
          <p className="max-w-2xl mx-auto mb-10 text-primary-50">
            Platform digital terintegrasi untuk mengelola kelas, materi pembelajaran, tugas, dan komunikasi antara pengajar dan siswa dengan mudah dan efisien.
          </p>
          <Link href="/kelas" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-md shadow hover:bg-gray-100 transition-colors">
            Lihat Kelas
          </Link>
        </div>
      </section>

      {/* Fitur Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">Fitur Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">Materi Pembelajaran</h3>
              <p className="text-gray-600">Akses materi pembelajaran kapan saja dan di mana saja</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Tugas & Penilaian</h3>
              <p className="text-gray-600">Kelola tugas dan pantau perkembangan siswa</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-lg font-semibold mb-2">Pengumuman</h3>
              <p className="text-gray-600">Informasi terbaru langsung dari pengajar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kelas Terbaru Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Kelas Terbaru</h2>
            <Link href="/kelas" className="text-primary-600 hover:underline font-medium">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          {latestKelas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestKelas.map(kelas => (
                <ClassCard key={kelas.id} kelas={kelas} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Belum ada kelas" 
              description="Belum ada kelas yang terdaftar di platform ini." 
            />
          )}
        </div>
      </section>
    </div>
  )
}
