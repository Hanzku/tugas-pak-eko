'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function BuatKelasPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [nama, setNama] = useState('')
  const [mataPelajaran, setMataPelajaran] = useState('')
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025')
  const [deskripsi, setDeskripsi] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'PENGAJAR') {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Dibatasi</h2>
        <p className="text-gray-600 mb-6">Halaman ini hanya dapat diakses oleh Pengajar yang telah masuk.</p>
        <Link href="/login" className="bg-primary-500 text-white px-5 py-2.5 rounded-md hover:bg-primary-600 transition-colors">
          Masuk Sekarang
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          mataPelajaran,
          tahunAjaran,
          deskripsi,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal membuat kelas')
      }

      const newKelas = await res.json()
      router.push(`/kelas/${newKelas.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat kelas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/kelas" className="text-sm text-primary-500 hover:underline mb-2 inline-block">
          &larr; Kembali ke Daftar Kelas
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Buat Kelas Baru</h1>
        <p className="text-gray-600 text-sm mt-1">
          Tambahkan kelas baru yang Anda ampu untuk mengelola materi, gambar, tugas, dan pengumuman.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nama">
              Nama Kelas <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Contoh: Kelas 10-A Matematika Wajib"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mataPelajaran">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                id="mataPelajaran"
                type="text"
                required
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="Contoh: Matematika"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tahunAjaran">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <input
                id="tahunAjaran"
                type="text"
                required
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="Contoh: 2024/2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deskripsi">
              Deskripsi Kelas (Opsional)
            </label>
            <textarea
              id="deskripsi"
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Penjelasan ringkas tentang silabus atau tujuan pembelajaran kelas ini..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link
              href="/kelas"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
