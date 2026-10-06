'use client'

import Link from 'next/link';

interface SidebarProps {
  kelasId: string;
  activeTab: string;
}

export default function Sidebar({ kelasId, activeTab }: SidebarProps) {
  const tabs = [
    { id: 'informasi', label: 'Informasi', href: `/kelas/${kelasId}` },
    { id: 'materi', label: 'Materi', href: `/kelas/${kelasId}/materi` },
    { id: 'galeri', label: 'Galeri', href: `/kelas/${kelasId}/galeri` },
    { id: 'tugas', label: 'Tugas', href: `/kelas/${kelasId}/tugas` },
    { id: 'pengumuman', label: 'Pengumuman', href: `/kelas/${kelasId}/pengumuman` },
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
              className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-[#1e3a5f]'
              }`}
            >
              {tab.label}
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
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export { Sidebar };
