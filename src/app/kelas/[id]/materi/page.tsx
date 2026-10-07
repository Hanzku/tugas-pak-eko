'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { formatFileSize, formatDate } from '@/lib/utils';
import { Materi, Kelas } from '@/types';
import { Download, Plus, File as FileIcon } from 'lucide-react';

export default function MateriPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const isPengajar = session?.user?.role === 'PENGAJAR';
  
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kelasRes, materiRes] = await Promise.all([
          fetch(`/api/kelas/${params.id}`),
          fetch(`/api/materi?kelasId=${params.id}`)
        ]);
        
        if (kelasRes.ok) {
          const kelasData = await kelasRes.json();
          setKelas(kelasData);
        }
        
        if (materiRes.ok) {
          const materiData = await materiRes.json();
          setMateriList(materiData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !judul) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('kelasId', params.id);
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/materi', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const newMateri = await res.json();
        setMateriList([newMateri, ...materiList]);
        setJudul('');
        setDeskripsi('');
        setFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="materi" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-900">Materi - {kelas?.nama || 'Memuat...'}</h1>
          </div>

          {isPengajar && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Upload Materi Baru
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Contoh: Bab 1 Pendahuluan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Penjelasan singkat tentang materi"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Dokumen</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !file || !judul}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 font-medium"
                >
                  {uploading ? 'Mengupload...' : 'Upload Materi'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {materiList.length > 0 ? (
              materiList.map((materi) => (
                <div key={materi.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg mt-0.5">
                      <FileIcon size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{materi.judul}</h3>
                      {materi.deskripsi && <p className="text-gray-600 text-sm mt-1">{materi.deskripsi}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FileIcon size={12} /> {materi.fileName}</span>
                        <span>{formatFileSize(materi.fileSize || 0)}</span>
                        <span>Diunggah: {formatDate(materi.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={materi.fileUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium transition-colors whitespace-nowrap"
                  >
                    <Download size={18} />
                    Unduh
                  </a>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada materi</h3>
                <p className="text-gray-500">Materi yang diunggah akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
