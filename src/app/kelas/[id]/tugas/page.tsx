'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { Kelas, Tugas } from '@/types';
import { formatDateTime, formatDate } from '@/lib/utils';
import { Plus, FileText, Calendar, Clock, Download } from 'lucide-react';

export default function TugasPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const isPengajar = session?.user?.role === 'PENGAJAR';
  
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kelasRes, tugasRes] = await Promise.all([
          fetch(`/api/kelas/${params.id}`),
          fetch(`/api/tugas?kelasId=${params.id}`)
        ]);
        
        if (kelasRes.ok) {
          const kelasData = await kelasRes.json();
          setKelas(kelasData);
        }
        
        if (tugasRes.ok) {
          const tugasData = await tugasRes.json();
          setTugasList(tugasData);
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
    if (!judul || !deadline) return;
    
    setCreating(true);
    const formData = new FormData();
    formData.append('kelasId', params.id);
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('deadline', new Date(deadline).toISOString());
    if (file) {
      formData.append('file', file);
    }
    
    try {
      const res = await fetch('/api/tugas', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const newTugas = await res.json();
        setTugasList([newTugas, ...tugasList].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
        setJudul('');
        setDeskripsi('');
        setDeadline('');
        setFile(null);
      }
    } catch (error) {
      console.error("Error creating tugas:", error);
    } finally {
      setCreating(false);
    }
  };

  const getDeadlineStatus = (deadlineDate: Date) => {
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { color: 'text-red-600 bg-red-50 border-red-200', text: 'Sudah lewat', isPast: true };
    if (days <= 3) return { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', text: `Sisa ${days} hari`, isPast: false };
    return { color: 'text-green-700 bg-green-50 border-green-200', text: `Tersisa ${days} hari`, isPast: false };
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="tugas" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tugas - {kelas?.nama || 'Memuat...'}</h1>
          </div>

          {isPengajar && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Buat Tugas Baru
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                    <input
                      type="text"
                      required
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Contoh: Tugas 1: Praktikum Biologi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Deadline)</label>
                    <input
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tugas</label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Jelaskan detail tugas yang harus dikerjakan"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (Opsional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !judul || !deadline}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 font-medium"
                >
                  {creating ? 'Menyimpan...' : 'Buat Tugas'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {tugasList.length > 0 ? (
              tugasList.map((tugas) => {
                const deadlineDate = tugas.deadline ? new Date(tugas.deadline) : null;
                const status = deadlineDate ? getDeadlineStatus(deadlineDate) : { color: 'text-gray-600 bg-gray-50 border-gray-200', text: 'Tanpa batas waktu', isPast: false };
                
                return (
                  <div key={tugas.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${status.isPast ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-600'}`}>
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{tugas.judul}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Tenggat: {deadlineDate ? formatDateTime(deadlineDate) : 'Tanpa batas'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-gray-50">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-4 line-clamp-3">{tugas.deskripsi}</p>
                      
                      {tugas.fileUrl && (
                        <a 
                          href={tugas.fileUrl} 
                          download
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm"
                        >
                          <Download size={16} />
                          {tugas.fileName || 'Unduh Lampiran'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada tugas</h3>
                <p className="text-gray-500">Tugas yang diberikan akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
