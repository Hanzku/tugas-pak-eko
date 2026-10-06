'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ClassCard } from '@/components/ClassCard'
import { EmptyState } from '@/components/EmptyState'
import { SearchBar } from '@/components/SearchBar'
import { FilterDropdown } from '@/components/FilterDropdown'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function KelasPage() {
  const { data: session } = useSession()
  const [kelas, setKelas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  useEffect(() => {
    fetchKelas()
  }, [searchQuery, filterSubject])

  const fetchKelas = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      if (searchQuery) queryParams.append('q', searchQuery)
      if (filterSubject) queryParams.append('mapel', filterSubject)
      
      const res = await fetch(`/api/kelas?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setKelas(data)
      }
    } catch (error) {
      console.error('Error fetching kelas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isPengajar = session?.user?.role === 'PENGAJAR'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Daftar Kelas</h1>
          <p className="text-gray-600 mt-2">Temukan dan ikuti kelas yang tersedia</p>
        </div>
        
        {isPengajar && (
          <Link 
            href="/kelas/baru" 
            className="bg-primary-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm whitespace-nowrap"
          >
            + Buat Kelas
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Cari nama kelas atau kode..." 
          />
        </div>
        <div className="sm:w-64">
          <FilterDropdown 
            value={filterSubject} 
            onChange={setFilterSubject}
            options={[
              { value: '', label: 'Semua Mata Pelajaran' },
              { value: 'Matematika', label: 'Matematika' },
              { value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
              { value: 'Fisika', label: 'Fisika' },
              { value: 'Biologi', label: 'Biologi' },
              { value: 'Pemrograman', label: 'Pemrograman' }
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner text="Memuat kelas..." />
        </div>
      ) : kelas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelas.map((k: any) => (
            <ClassCard key={k.id} kelas={k} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState 
            title="Kelas tidak ditemukan" 
            message="Tidak ada kelas yang sesuai dengan pencarian atau filter Anda." 
          />
        </div>
      )}
    </div>
  )
}
