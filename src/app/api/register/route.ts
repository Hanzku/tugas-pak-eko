import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, email, password, konfirmasiPassword, role } = body

    // Validasi field wajib
    if (!nama || !email || !password || !konfirmasiPassword) {
      return NextResponse.json(
        { error: 'Nama, email, password, dan konfirmasi password wajib diisi.' },
        { status: 400 }
      )
    }

    if (typeof nama !== 'string' || nama.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama wajib diisi (minimal 2 karakter).' },
        { status: 400 }
      )
    }

    // Normalisasi email: trim + lowercase agar tidak terjadi duplikat User@Gmail.com vs user@gmail.com
    const normalizedEmail = String(email).trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      )
    }

    if (password !== konfirmasiPassword) {
      return NextResponse.json(
        { error: 'Password dan konfirmasi password tidak sama.' },
        { status: 400 }
      )
    }

    // Role hanya boleh PENGAJAR atau SISWA
    const normalizedRole = role === 'PENGAJAR' ? 'PENGAJAR' : 'SISWA'

    // Pengecekan email di server/database (bukan hanya frontend)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain atau masuk ke akun Anda.' },
        { status: 409 }
      )
    }

    // Hash password sebelum disimpan (tidak pernah plaintext)
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: 'Registrasi berhasil. Silakan masuk.', user: newUser },
      { status: 201 }
    )
  } catch (error: any) {
    // Tangani race condition / unique constraint violation dari database
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain atau masuk ke akun Anda.' },
        { status: 409 }
      )
    }
    console.error('Error in POST /api/register:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}