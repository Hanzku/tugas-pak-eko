import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import { Book, Image as ImageIcon, FileText, Bell } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function KelasInfoPage({ params }: { params: { id: string } }) {
  const kelas = await prisma.kelas.findUnique({
    where: { id: params.id },
    include: {
      pengajar: true,
      _count: {
        select: {
          materi: true,
          gambar: true,
          tugas: true,
          pengumuman: true,
        }
      },
      pengumuman: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      }
    }
  });

  if (!kelas) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="info" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{kelas.nama}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {kelas.mataPelajaran}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    TA {kelas.tahunAjaran}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{kelas.deskripsi}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-w-[200px]">
                <p className="text-sm text-gray-500 mb-1">Pengajar</p>
                <p className="font-medium text-gray-900 mb-3">{kelas.pengajar?.nama}</p>
                <p className="text-sm text-gray-500 mb-1">Kode Kelas</p>
                <p className="font-mono text-lg font-bold text-primary-600">{kelas.kode}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Book size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Materi</p>
                <p className="text-xl font-bold text-gray-900">{kelas._count?.materi || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <ImageIcon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Galeri</p>
                <p className="text-xl font-bold text-gray-900">{kelas._count?.gambar || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tugas</p>
                <p className="text-xl font-bold text-gray-900">{kelas._count?.tugas || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pengumuman</p>
                <p className="text-xl font-bold text-gray-900">{kelas._count?.pengumuman || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-primary-500" />
              Pengumuman Terbaru
            </h2>
            
            {kelas.pengumuman && kelas.pengumuman.length > 0 ? (
              <div className="space-y-4">
                {kelas.pengumuman.map(p => (
                  <div key={p.id} className={`p-4 rounded-lg border ${p.penting ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{p.judul}</h3>
                      <span className="text-xs text-gray-500">{formatDate(p.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{p.isi}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada pengumuman.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
