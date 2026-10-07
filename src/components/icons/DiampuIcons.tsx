import React from 'react'

interface IconProps {
  size?: number
  className?: string
}

function baseProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }
}

/** Logo DIAMPU: perisai dengan buku terbuka - simbol perlindungan & ilmu */
export function DiampuLogo({ size = 32, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-label="Logo DIAMPU"
      role="img"
    >
      {/* Perisai */}
      <path
        d="M24 4 L40 9 V22 C40 33.5 33 40.5 24 44 C15 40.5 8 33.5 8 22 V9 Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M24 4 L40 9 V22 C40 33.5 33 40.5 24 44 C15 40.5 8 33.5 8 22 V9 Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Buku terbuka */}
      <path
        d="M24 15 C21.5 13.2 18.5 12.6 14.5 13.2 V30 C18.5 29.4 21.5 30 24 31.8 C26.5 30 29.5 29.4 33.5 30 V13.2 C29.5 12.6 26.5 13.2 24 15 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 15 V31.8"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Garis teks kiri dan kanan */}
      <path d="M17 18.5 H21" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 22.5 H21" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 18.5 H31" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M27 22.5 H31" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Ikon Dashboard */
export function IconDashboard({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="3" width="7.5" height="9" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
      <rect x="3" y="15" width="7.5" height="6" rx="1.5" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5" />
    </svg>
  )
}

/** Ikon Kelas */
export function IconKelas({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 7.5 L12 3 L21 7.5 L12 12 Z" />
      <path d="M6 10.5 V16 C6 16 8 18 12 18 C16 18 18 16 18 16 V10.5" />
      <path d="M21 8 V14" />
    </svg>
  )
}

/** Ikon Materi (buku) */
export function IconMateri({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 5 C4 4 5 3 6 3 H11 C12 3 13 4 13 5 V21 C13 20 12 19 11 19 H6 C5 19 4 20 4 21 Z" />
      <path d="M20 5 C20 4 19 3 18 3 H13 V21 C13 20 14 19 15 19 H20 C21 19 22 20 22 21 V7 C22 6 21 5 20 5 Z" />
    </svg>
  )
}

/** Ikon Tugas (dokumen dengan garis) */
export function IconTugas({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M14 3 H6 C4.9 3 4 3.9 4 5 V19 C4 20.1 4.9 21 6 21 H18 C19.1 21 20 20.1 20 19 V9 Z" />
      <path d="M14 3 V9 H20" />
      <path d="M8 13 H16" />
      <path d="M8 17 H13" />
    </svg>
  )
}

/** Ikon Pengumpulan (kotak keluar masuk) */
export function IconPengumpulan({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M21 15 V19 C21 20.1 20.1 21 19 21 H5 C3.9 21 3 20.1 3 19 V15" />
      <path d="M7 9 L12 14 L17 9" />
      <path d="M12 3 V14" />
    </svg>
  )
}

/** Ikon Pengumuman (megaphone sederhana) */
export function IconPengumuman({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 10 V14 C3 15.1 3.9 16 5 16 H7 L15 20 V4 L7 8 H5 C3.9 8 3 8.9 3 10 Z" />
      <path d="M18.5 9.5 C19.6 10.6 19.6 13.4 18.5 14.5" />
    </svg>
  )
}

/** Ikon Pengaturan */
export function IconPengaturan({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15 C19.8 14 20 13 20 12 C20 11 19.8 10 19.4 9 L21.5 7.4 L19.6 4.6 L17.2 5.8 C16.4 5.2 15.5 4.7 14.5 4.4 L14.2 1.8 H9.8 L9.5 4.4 C8.5 4.7 7.6 5.2 6.8 5.8 L4.4 4.6 L2.5 7.4 L4.6 9 C4.2 10 4 11 4 12 C4 13 4.2 14 4.6 15 L2.5 16.6 L4.4 19.4 L6.8 18.2 C7.6 18.8 8.5 19.3 9.5 19.6 L9.8 22.2 H14.2 L14.5 19.6 C15.5 19.3 16.4 18.8 17.2 18.2 L19.6 19.4 L21.5 16.6 Z" />
    </svg>
  )
}

/** Ikon Profil */
export function IconProfil({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 C4 16.6 7.6 14 12 14 C16.4 14 20 16.6 20 21" />
    </svg>
  )
}

/** Ikon Upload */
export function IconUpload({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M21 15 V19 C21 20.1 20.1 21 19 21 H5 C3.9 21 3 20.1 3 19 V15" />
      <path d="M7 8 L12 3 L17 8" />
      <path d="M12 3 V15" />
    </svg>
  )
}

/** Ikon Download */
export function IconDownload({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M21 15 V19 C21 20.1 20.1 21 19 21 H5 C3.9 21 3 20.1 3 19 V15" />
      <path d="M7 10 L12 15 L17 10" />
      <path d="M12 15 V3" />
    </svg>
  )
}

/** Ikon Galeri */
export function IconGaleri({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 15.5 L16 11 L5 19.5" />
    </svg>
  )
}

/** Ikon berkas umum (menggantikan emoji file) */
export function IconFile({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M14 3 H6 C4.9 3 4 3.9 4 5 V19 C4 20.1 4.9 21 6 21 H18 C19.1 21 20 20.1 20 19 V9 Z" />
      <path d="M14 3 V9 H20" />
    </svg>
  )
}

/** Ikon centang untuk status berhasil */
export function IconCheck({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M20 6 L9 17 L4 12" />
    </svg>
  )
}

/** Ikon jam untuk deadline */
export function IconClock({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 V12 L15.5 14" />
    </svg>
  )
}

/** Ikon nilai/penilaian */
export function IconNilai({ size = 20, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 16 L12.5 5.5 L16 16" />
      <path d="M10.2 13 H14.8" />
    </svg>
  )
}