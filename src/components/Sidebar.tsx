'use client'

import Link from 'next/link';
import { IconMateri, IconGaleri, IconTugas, IconPengumuman, IconKelas } from './icons/DiampuIcons';

interface SidebarProps {
  kelasId: string;
  activeTab: string;
}

export default function Sidebar({ kelasId, activeTab }: SidebarProps) {
  const tabs = [
    { id: 'info', label: 'Informasi', href: `/kelas/${kelasId}`, icon: <IconKelas size={18} /> },
    { id: 'materi', label: 'Materi', href: `/kelas/${kelasId}/materi`, icon: <IconMateri size={18} /> },
    { id: 'galeri', label: 'Galeri', href: `/kelas/${kelasId}/galeri`, icon: <IconGaleri size={18} /> },
    { id: 'tugas', label: 'Tugas', href: `/kelas/${kelasId}/tugas`, icon: <IconTugas size={18} /> },
    { id: 'pengumuman', label: 'Pengumuman', href: `/kelas/${kelasId}/pengumuman`, icon: <IconPengumuman size={18} /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-gray-200 min-h-[calc(100vh-4rem)] bg-white py-6">
        <nav className="flex flex-col space-y-1 px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2.5 ${
                activeTab === tab.id
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#1e3a5f]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Horizontal Tab Bar */}
      <div className="lg:hidden w-full overflow-x-auto bg-white border-b border-gray-200 sticky top-16 z-40">
        <nav className="flex px-4 py-2 space-x-2 min-w-max">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-1.5">{tab.icon}{tab.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export { Sidebar };
