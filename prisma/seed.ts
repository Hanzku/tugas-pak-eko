import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.pengumuman.deleteMany()
  await prisma.tugas.deleteMany()
  await prisma.gambar.deleteMany()
  await prisma.materi.deleteMany()
  await prisma.kelas.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const hashedPassword = await bcrypt.hash('diampu123', 10)

  const pengajar = await prisma.user.create({
    data: {
      nama: 'Dr. Ahmad Fauzi',
      email: 'pengajar@diampu.id',
      password: hashedPassword,
      role: 'PENGAJAR',
    },
  })

  const siswa = await prisma.user.create({
    data: {
      nama: 'Siti Nurhaliza',
      email: 'siswa@diampu.id',
      password: hashedPassword,
      role: 'SISWA',
    },
  })

  // Create Kelas
  const kelas1 = await prisma.kelas.create({
    data: {
      nama: 'Kelas 10-A',
      mataPelajaran: 'Matematika',
      tahunAjaran: '2024/2025',
      kode: 'MTK10A',
      deskripsi: 'Kelas Matematika untuk siswa kelas 10 program IPA',
      pengajarId: pengajar.id,
    },
  })

  await prisma.kelas.create({
    data: {
      nama: 'Kelas 11-B',
      mataPelajaran: 'Fisika',
      tahunAjaran: '2024/2025',
      kode: 'FIS11B',
      deskripsi: 'Kelas Fisika untuk siswa kelas 11 program IPA',
      pengajarId: pengajar.id,
    },
  })

  await prisma.kelas.create({
    data: {
      nama: 'Kelas 12-C',
      mataPelajaran: 'Bahasa Indonesia',
      tahunAjaran: '2024/2025',
      kode: 'BIN12C',
      deskripsi: 'Kelas Bahasa Indonesia untuk siswa kelas 12',
      pengajarId: pengajar.id,
    },
  })

  // Create Pengumuman
  await prisma.pengumuman.create({
    data: {
      judul: 'Selamat Datang',
      isi: 'Selamat datang di kelas Matematika. Silakan persiapkan buku dan alat tulis.',
      penting: true,
      kelasId: kelas1.id,
    },
  })

  await prisma.pengumuman.create({
    data: {
      judul: 'Jadwal UTS',
      isi: 'Ujian Tengah Semester akan dilaksanakan pada minggu ke-8. Materi meliputi Bab 1 sampai Bab 4.',
      penting: false,
      kelasId: kelas1.id,
    },
  })

  // Create Tugas
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 7)

  await prisma.tugas.create({
    data: {
      judul: 'Latihan Soal Bab 1',
      deskripsi: 'Kerjakan latihan soal halaman 25-30. Kumpulkan dalam format PDF.',
      deadline: deadline,
      kelasId: kelas1.id,
    },
  })

  // Create Materi
  await prisma.materi.create({
    data: {
      judul: 'Silabus & Kontrak Kuliah Matematika 10',
      deskripsi: 'Dokumen silabus, jadwal materi, dan kriteria penilaian semester ganjil.',
      fileUrl: '/uploads/silabus-matematika.pdf',
      fileName: 'silabus-matematika.pdf',
      fileSize: 320,
      fileType: 'pdf',
      kelasId: kelas1.id,
    },
  })

  // Create Gambar
  await prisma.gambar.create({
    data: {
      judul: 'Foto Kegiatan Praktikum Kelas 10-A',
      deskripsi: 'Dokumentasi praktikum pengukuran dan pengolahan data kelompok.',
      imageUrl: '/uploads/kegiatan-kelas.svg',
      fileName: 'kegiatan-kelas.svg',
      fileSize: 1200,
      kelasId: kelas1.id,
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
