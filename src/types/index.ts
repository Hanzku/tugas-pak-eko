export type UserRole = 'PENGAJAR' | 'SISWA'

export interface User {
  id: string
  nama: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface TugasSiswa {
  tugasId: string
  kelasId: string
  kelasNama: string
  judul: string
  deadline: string | null
  submittedAt: string | null
  status: 'DIKUMPULKAN' | 'TERLAMBAT' | 'DINILAI' | null
  score: number | null
  feedback: string | null
}

export interface Kelas {
  id: string
  nama: string
  deskripsi: string | null
  mataPelajaran: string
  tahunAjaran: string
  kode: string
  pengajarId: string
  pengajar?: User
  createdAt: Date
  _count?: {
    materi: number
    gambar: number
    tugas: number
    pengumuman: number
  }
}

export interface Materi {
  id: string
  judul: string
  deskripsi: string | null
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  kelasId: string
  createdAt: Date
}

export interface Gambar {
  id: string
  judul: string
  deskripsi: string | null
  imageUrl: string
  fileName: string
  fileSize: number
  kelasId: string
  createdAt: Date
}

export interface Tugas {
  id: string
  judul: string
  deskripsi: string
  deadline: Date | null
  fileUrl: string | null
  fileName: string | null
  kelasId: string
  createdAt: Date
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  fileUrl: string
  fileName: string
  fileSize: number
  submittedAt: string
  status: string // DIKUMPULKAN | TERLAMBAT | DINILAI
  score: number | null
  feedback: string | null
  gradedAt: string | null
  gradedById: string | null
  student?: {
    id: string
    nama: string
    email: string
  }
}

export interface TugasGuru extends Tugas {
  kelas: {
    id: string
    nama: string
    mataPelajaran: string
  }
  jumlahSubmission: number
  jumlahDinilai: number
}

export interface Pengumuman {
  id: string
  judul: string
  isi: string
  penting: boolean
  kelasId: string
  createdAt: Date
}

export interface UploadResult {
  url: string
  fileName: string
  fileSize: number
}
