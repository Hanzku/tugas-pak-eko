import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DIAMPU - Ruang Digital Kelas yang Diampu',
  description: 'Platform digital untuk mengelola kelas yang diampu oleh pengajar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-700 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow min-h-[calc(100vh-8rem)]">
            {children}
          </main>
          <footer className="bg-gray-200 py-6 text-center text-gray-600 mt-auto border-t border-gray-300">
            <p>DIAMPU &copy; 2024 - Ruang Digital Kelas yang Diampu</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
