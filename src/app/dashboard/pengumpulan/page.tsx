'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TugasGuru, Submission } from '@/types';
import { formatDateTimeWIB, formatFileSize, cn } from '@/lib/utils';
import { IconPengumpulan, IconDownload, IconNilai, IconClock, IconFile } from '@/components/icons/DiampuIcons';

export default function PengumpulanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tugasList, setTugasList] = useState<TugasGuru[]>([]);
  const [selectedTugas, setSelectedTugas] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'PENGAJAR') {
        router.push('/dashboard');
        return;
      }
      fetchTugas();
    }
  }, [status, session?.user?.role, router]);

  const fetchTugas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tugas/guru');
      if (res.ok) {
        setTugasList(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (tugasId: string) => {
    try {
      setLoadingSubs(true);
      setError('');
      setSubmissions([]);
      const res = await fetch(`/api/submissions?assignmentId=${tugasId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memuat pengumpulan tugas.');
        return;
      }
      setSubmissions(data);
    } catch {
      setError('Terjadi kesalahan saat memuat data.');
    } finally {
      setLoadingSubs(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconPengumpulan size={28} className="text-primary-500" />
          Pengumpulan Tugas
        </h1>
        <p className="text-gray-600 mt-2">
          Lihat dan nilai tugas yang dikumpulkan siswa dari semua kelas yang Anda ampu.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tugas">
          Pilih Tugas
        </label>
        <select
          id="tugas"
          value={selectedTugas}
          onChange={(e) => {
            setSelectedTugas(e.target.value);
            if (e.target.value) fetchSubmissions(e.target.value);
          }}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">-- Pilih tugas --</option>
          {tugasList.map((t) => (
            <option key={t.id} value={t.id}>
              [{t.kelas?.nama}] {t.judul} ({t.jumlahSubmission} pengumpulan)
            </option>
          ))}
        </select>

        {selectedTugas && (() => {
          const t = tugasList.find((x) => x.id === selectedTugas);
          if (!t) return null;
          const deadlineDate = t.deadline ? new Date(t.deadline) : null;
          const isClosed = deadlineDate ? Date.now() >= deadlineDate.getTime() : false;
          return (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <IconClock size={14} />
                {deadlineDate ? formatDateTimeWIB(deadlineDate) : 'Tanpa batas waktu'}
              </span>
              {deadlineDate && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    isClosed
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-green-700 bg-green-50 border-green-200'
                  )}
                >
                  {isClosed ? 'DITUTUP' : 'AKTIF'}
                </span>
              )}
              <span className="text-gray-500">
                {t.jumlahSubmission} dikumpulkan, {t.jumlahDinilai} dinilai
              </span>
            </div>
          );
        })()}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 border border-red-200">
          {error}
        </div>
      )}

      {selectedTugas && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loadingSubs ? (
            <p className="p-6 text-gray-500">Memuat pengumpulan...</p>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center">
              <IconPengumpulan size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pengumpulan</h3>
              <p className="text-gray-500">Belum ada siswa yang mengumpulkan tugas ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <SubmissionRow key={sub.id} submission={sub} onGraded={() => fetchSubmissions(selectedTugas)} />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedTugas && (
        <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center">
          <IconPengumpulan size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Pilih tugas terlebih dahulu</h3>
          <p className="text-gray-500">
            Daftar siswa yang mengumpulkan tugas akan tampil setelah Anda memilih tugas.
          </p>
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission, onGraded }: { submission: Submission; onGraded: () => void }) {
  const [score, setScore] = useState<string>(submission.score !== null ? String(submission.score) : '');
  const [feedback, setFeedback] = useState<string>(submission.feedback || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(submission.score === null);

  const handleSave = async () => {
    const parsed = Number(score);
    if (score === '' || Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setSaveError('Nilai harus berupa angka bulat antara 0 sampai 100.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaved(false);

    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: parsed, feedback }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Gagal menyimpan nilai.');
        return;
      }

      setSaved(true);
      setIsEditing(false);
      onGraded();
    } catch {
      setSaveError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel =
    submission.status === 'DINILAI'
      ? 'Dinilai'
      : submission.status === 'TERLAMBAT'
      ? 'Terlambat'
      : 'Sudah dikumpulkan';

  const statusColor =
    submission.status === 'DINILAI'
      ? 'text-blue-700 bg-blue-50 border-blue-200'
      : submission.status === 'TERLAMBAT'
      ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
      : 'text-green-700 bg-green-50 border-green-200';

  return (
    <div className="p-5">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{submission.student?.nama || 'Siswa'}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">{submission.student?.email}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="text-xs text-gray-500">
              Dikumpulkan: {formatDateTimeWIB(submission.submittedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 min-w-0 flex-wrap">
            <IconFile size={16} className="text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-800 truncate">{submission.fileName}</span>
            <span className="text-xs text-gray-500">({formatFileSize(submission.fileSize)})</span>
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 border border-gray-200 px-2 py-1 rounded-md"
            >
              Lihat File
            </a>
            <a
              href={submission.fileUrl}
              download
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded-md"
            >
              <IconDownload size={12} />
              Download
            </a>
          </div>
        </div>

        <div className="lg:w-72 shrink-0">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => {
                    setScore(e.target.value);
                    setSaveError('');
                    setSaved(false);
                  }}
                  placeholder="Nilai 0-100"
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:bg-primary-300 whitespace-nowrap"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback (opsional)"
                rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <IconNilai size={16} className="text-blue-600" />
                <span className="font-bold text-blue-700 text-lg">{submission.score}</span>
                <span className="text-gray-500 text-xs">/ 100</span>
              </p>
              {submission.feedback && (
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-2">
                  {submission.feedback}
                </p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                Ubah Nilai
              </button>
            </div>
          )}
          {saved && <p className="text-xs text-green-600 mt-1">Nilai tersimpan.</p>}
        </div>
      </div>
    </div>
  );
}