'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { Kelas, Gambar } from '@/types';
import { Plus, X, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function GaleriPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const isPengajar = session?.user?.role === 'PENGAJAR';
  
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [gambarList, setGambarList] = useState<Gambar[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kelasRes, gambarRes] = await Promise.all([
          fetch(`/api/kelas/${params.id}`),
          fetch(`/api/gambar?kelasId=${params.id}`)
        ]);
        
        if (kelasRes.ok) {
          const kelasData = await kelasRes.json();
          setKelas(kelasData);
        }
        
        if (gambarRes.ok) {
          const gambarData = await gambarRes.json();
          setGambarList(gambarData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

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
      const res = await fetch('/api/gambar', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const newGambar = await res.json();
        setGambarList([newGambar, ...gambarList]);
        setJudul('');
        setDeskripsi('');
        setFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus gambar ini?')) return;
    try {
      const res = await fetch(`/api/gambar/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGambarList(gambarList.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="galeri" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Galeri - {kelas?.nama || 'Memuat...'}</h1>
          </div>

          {isPengajar && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Upload Gambar Baru
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Gambar</label>
                      <input
                        type="text"
                        required
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Contoh: Kegiatan Praktikum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                      <textarea
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Keterangan singkat tentang gambar"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Gambar (Max 5MB)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-full min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-900 bg-white/80 px-2 py-1 rounded mb-2">{file?.name}</span>
                            <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-sm text-red-600 bg-white/80 px-2 py-1 rounded">Ganti File</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                              <span>Pilih file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleFileSelect} required />
                            </label>
                            <p className="pl-1">atau tarik dan lepas</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, WEBP</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={uploading || !file || !judul}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 font-medium"
                >
                  {uploading ? 'Mengupload...' : 'Upload Gambar'}
                </button>
              </form>
            </div>
          )}

          {gambarList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gambarList.map((gambar, idx) => (
                <div 
                  key={gambar.id} 
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={gambar.imageUrl}
                      alt={gambar.judul}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white w-8 h-8" />
                    </div>
                    {isPengajar && (
                      <button 
                        onClick={(e) => handleDelete(gambar.id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate" title={gambar.judul}>{gambar.judul}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada galeri</h3>
              <p className="text-gray-500">Gambar yang diunggah akan tampil di sini.</p>
            </div>
          )}

          {/* Lightbox Modal */}
          {lightboxIndex !== null && gambarList[lightboxIndex] && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
              <button 
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X size={32} />
              </button>
              
              <div className="relative max-w-5xl w-full flex flex-col items-center">
                <img 
                  src={gambarList[lightboxIndex].imageUrl} 
                  alt={gambarList[lightboxIndex].judul}
                  className="max-h-[80vh] object-contain mb-4"
                />
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{gambarList[lightboxIndex].judul}</h3>
                  {gambarList[lightboxIndex].deskripsi && (
                    <p className="mt-2 text-white/80">{gambarList[lightboxIndex].deskripsi}</p>
                  )}
                </div>

                {gambarList.length > 1 && (
                  <>
                    <button 
                      className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + gambarList.length) % gambarList.length); }}
                    >
                      <ChevronLeft size={36} />
                    </button>
                    <button 
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % gambarList.length); }}
                    >
                      <ChevronRight size={36} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
