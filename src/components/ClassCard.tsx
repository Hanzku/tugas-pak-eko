import Link from 'next/link';
import { IconMateri, IconTugas } from './icons/DiampuIcons';

interface ClassCardProps {
  kelas: any; // Type from @/types ideally, using any here to prevent TS errors if type is complex
}

export default function ClassCard({ kelas }: ClassCardProps) {
  // Destructure safely, assuming relations might be _count
  const materiCount = kelas._count?.materi || 0;
  const tugasCount = kelas._count?.tugas || 0;
  
  return (
    <Link href={`/kelas/${kelas.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-lg p-5 h-full transition-all duration-200 hover:shadow-md hover:border-primary-200 flex flex-col">
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 bg-blue-50 text-primary-600 text-xs font-semibold rounded-md border border-blue-100 mb-2">
            {kelas.mataPelajaran}
          </span>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 line-clamp-1">
            {kelas.nama}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {kelas.deskripsi || "Tidak ada deskripsi."}
        </p>
        
        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs text-gray-500">
              <span className="block font-medium text-gray-700">{kelas.pengajar?.nama || 'Pengajar Tidak Diketahui'}</span>
              <span className="block">{kelas.tahunAjaran}</span>
            </div>
            
            <div className="flex space-x-3 text-xs text-gray-500 font-medium">
              <span className="flex items-center" title="Materi">
                <IconMateri size={14} className="mr-1" /> {materiCount}
              </span>
              <span className="flex items-center" title="Tugas">
                <IconTugas size={14} className="mr-1" /> {tugasCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { ClassCard };
