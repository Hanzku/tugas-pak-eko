'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { Kelas, Pengumuman } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Plus, Bell, AlertCircle } from 'lucide-react';

export default function PengumumanPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const isPengajar = session?.user?.role === 'PENGAJAR';
  
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [penting, setPenting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kelasRes, pengumumanRes] = await Promise.all([
          fetch(`/api/kelas/${params.id}`),
          fetch(`/api/pengumuman?kelasId=${params.id}`)
        ]);
        
        if (kelasRes.ok) {
          const kelasData = await kelasRes.json();
          setKelas(kelasData);
        }
        
        if (pengumumanRes.ok) {
          const pengumumanData = await pengumumanRes.json();
          setPengumumanList(pengumumanData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isi) return;
    
    setCreating(true);
    const data = {
      kelasId: params.id,
      judul,
      isi,
      penting
    };
    
    try {
      const res = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const newPengumuman = await res.json();
        setPengumumanList([newPengumuman, ...pengumumanList]);
        setJudul('');
        setIsi('');
        setPenting(false);
      }
    } catch (error) {
      console.error("Error creating pengumuman:", error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="pengumuman" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-900">Pengumuman - {kelas?.nama || 'Memuat...'}</h1>
          </div>

          {isPengajar && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Buat Pengumuman Baru
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Contoh: Perubahan Jadwal Kuliah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pengumuman</label>
                  <textarea
                    value={isi}
                    onChange={(e) => setIsi(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tulis detail pengumuman di sini..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="penting-checkbox"
                    type="checkbox"
                    checked={penting}
                    onChange={(e) => setPenting(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="penting-checkbox" className="ml-2 text-sm font-medium text-gray-900">
                    Tandai sebagai Penting
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={creating || !judul || !isi}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 font-medium"
                >
                  {creating ? 'Menerbitkan...' : 'Terbitkan Pengumuman'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {pengumumanList.length > 0 ? (
              pengumumanList.map((pengumuman) => (
                <div 
                  key={pengumuman.id} 
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${pengumuman.penting ? 'border-l-4 border-l-red-500 border-t-gray-200 border-r-gray-200 border-b-gray-200' : 'border-gray-200'}`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                        {pengumuman.penting && <AlertCircle size={18} className="text-red-500" />}
                        {pengumuman.judul}
                      </h3>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(new Date(pengumuman.createdAt))}
                      </span>
                    </div>
                    {pengumuman.penting && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mb-3 font-medium">
                        Penting
                      </span>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{pengumuman.isi}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pengumuman</h3>
                <p className="text-gray-500">Pengumuman dari pengajar akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
