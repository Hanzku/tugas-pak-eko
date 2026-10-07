'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { DiampuLogo } from './icons/DiampuIcons';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary-500">
            <DiampuLogo size={30} />
            <span>DIAMPU</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary-500 font-medium">Beranda</Link>
            <Link href="/kelas" className="text-gray-700 hover:text-primary-500 font-medium">Kelas</Link>
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-800">{session.user?.name}</span>
                <span className="text-xs text-primary-500 font-medium px-2 py-0.5 bg-primary-50 rounded-full inline-block">{session.user?.role}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-red-600 font-medium border border-gray-300 rounded px-3 py-1.5 hover:border-red-600 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-500 font-medium px-3 py-2 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-2">
          <div className="flex flex-col px-4 space-y-2">
            <Link href="/" className="text-gray-700 hover:text-primary-500 font-medium py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
            <Link href="/kelas" className="text-gray-700 hover:text-primary-500 font-medium py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Kelas</Link>
            
            {session ? (
              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{session.user?.name}</div>
                    <div className="text-xs text-primary-500 font-medium">{session.user?.role}</div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  href="/login"
                  className="text-center text-gray-700 hover:text-primary-500 font-medium px-4 py-2 border border-gray-200 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-center px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export { Navbar };
