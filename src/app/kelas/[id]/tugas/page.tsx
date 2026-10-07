'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { Kelas, Tugas, Submission } from '@/types';
import { formatDateTimeWIB, formatFileSize, SUBMISSION_EXTENSIONS, MAX_SUBMISSION_SIZE, isValidSubmissionFile } from '@/lib/utils';
import { Plus, Calendar } from 'lucide-react';
import { IconTugas, IconDownload, IconUpload, IconClock, IconNilai, IconFile, IconCheck } from '@/components/icons/DiampuIcons';

export default function TugasPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const isPengajar = session?.user?.role === 'PENGAJAR';

  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);

  // Waktu server sebagai acuan deadline di client (bukan jam komputer siswa)
  const [serverNow, setServerNow] = useState<number>(Date.now());

  // Submission siswa per tugas: { [tugasId]: submission }
  const [mySubmissions, setMySubmissions] = useState<Record<string, Submission>>({});

  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [kelasRes, tugasRes, timeRes] = await Promise.all([
        fetch(`/api/kelas/${params.id}`),
        fetch(`/api/tugas?kelasId=${params.id}`),
        fetch('/api/time'),
      ]);

      if (kelasRes.ok) setKelas(await kelasRes.json());
      if (timeRes.ok) {
        const { now } = await timeRes.json();
        setServerNow(new Date(now).getTime());
      }

      if (tugasRes.ok) {
        const tugasData: Tugas[] = await tugasRes.json();
        setTugasList(tugasData);

        // Ambil submission siswa untuk setiap tugas
        if (session?.user?.role === 'SISWA') {
          const entries = await Promise.all(
            tugasData.map(async (t) => {
              const res = await fetch(`/api/submissions?assignmentId=${t.id}`);
              if (!res.ok) return null;
              const subs: Submission[] = await res.json();
              return subs.length > 0 ? [t.id, subs[0]] as const : null;
            })
          );
          const map: Record<string, Submission> = {};
          entries.forEach((e) => { if (e) map[e[0]] = e[1]; });
          setMySubmissions(map);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, session?.user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !deadline) return;

    setCreating(true);
    const formData = new FormData();
    formData.append('kelasId', params.id);
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('deadline', new Date(deadline).toISOString());
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetch('/api/tugas', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newTugas = await res.json();
        setTugasList([newTugas, ...tugasList]);
        setJudul('');
        setDeskripsi('');
        setDeadline('');
        setFile(null);
      }
    } catch (error) {
      console.error('Error creating tugas:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-6">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:flex lg:gap-6">
        <Sidebar kelasId={params.id} activeTab="tugas" />
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tugas - {kelas?.nama || 'Memuat...'}</h1>
            {isPengajar && (
              <a
                href="/dashboard/pengumpulan"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 md:mt-0"
              >
                Lihat Pengumpulan Tugas
              </a>
            )}
          </div>

          {isPengajar && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Buat Tugas Baru
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                    <input
                      type="text"
                      required
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Contoh: Tugas 1: Praktikum Biologi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Deadline, WIB)</label>
                    <input
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tugas</label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Jelaskan detail tugas yang harus dikerjakan"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (Opsional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !judul || !deadline}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 font-medium"
                >
                  {creating ? 'Menyimpan...' : 'Buat Tugas'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {tugasList.length > 0 ? (
              tugasList.map((tugas) => (
                <TugasCard
                  key={tugas.id}
                  tugas={tugas}
                  serverNow={serverNow}
                  mySubmission={mySubmissions[tugas.id]}
                  onSubmitted={() => fetchData()}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <IconTugas size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada tugas</h3>
                <p className="text-gray-500">Tugas yang diberikan akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TugasCard({
  tugas,
  serverNow,
  mySubmission,
  onSubmitted,
}: {
  tugas: Tugas;
  serverNow: number;
  mySubmission?: Submission;
  onSubmitted: () => void;
}) {
  const deadlineDate = tugas.deadline ? new Date(tugas.deadline) : null;
  const isClosed = deadlineDate ? serverNow >= deadlineDate.getTime() : false;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || uploading) return;

    if (!isValidSubmissionFile(file)) {
      setUploadError('Format file tidak didukung.');
      return;
    }
    if (file.size > MAX_SUBMISSION_SIZE) {
      setUploadError(`Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_SUBMISSION_SIZE)}`);
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('assignmentId', tugas.id);
      formData.append('file', file);

      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Gagal mengumpulkan tugas.');
        return;
      }

      setUploadSuccess(true);
      setFile(null);
      onSubmitted();
    } catch {
      setUploadError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-600'}`}>
              <IconTugas size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{tugas.judul}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Tenggat: {deadlineDate ? formatDateTimeWIB(deadlineDate) : 'Tanpa batas'}
                </span>
                {deadlineDate && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      isClosed
                        ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-green-700 bg-green-50 border-green-200'
                    }`}
                  >
                    {isClosed ? 'DITUTUP' : 'AKTIF'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gray-50">
        <p className="text-gray-700 text-sm whitespace-pre-wrap mb-4">{tugas.deskripsi}</p>

        {tugas.fileUrl && (
          <a
            href={tugas.fileUrl}
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm mb-4"
          >
            <IconDownload size={16} />
            {tugas.fileName || 'Unduh Lampiran'}
          </a>
        )}

        {mySubmission ? (
          <SubmissionInfo submission={mySubmission} />
        ) : isClosed ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700 font-medium flex items-center gap-2">
              <IconClock size={16} />
              Waktu pengumpulan tugas sudah berakhir.
            </p>
            <p className="text-xs text-red-600 mt-1">Deadline telah berakhir pada {formatDateTimeWIB(deadlineDate!)}.</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-3">
            {uploadError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
                <IconCheck size={16} />
                Tugas berhasil dikumpulkan.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setUploadError('');
                    setUploadSuccess(false);
                  }}
                  accept={SUBMISSION_EXTENSIONS.join(',')}
                  disabled={uploading}
                  className="w-full text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                />
              </label>
              <button
                type="submit"
                disabled={!file || uploading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <IconUpload size={16} />
                {uploading ? 'Mengunggah...' : 'Upload Tugas'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Format: {SUBMISSION_EXTENSIONS.join(', ')} (Maks: {formatFileSize(MAX_SUBMISSION_SIZE)})
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function SubmissionInfo({ submission }: { submission: Submission }) {
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
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor} flex items-center gap-1`}>
          {submission.status === 'DINILAI' ? <IconNilai size={12} /> : <IconCheck size={12} />}
          {statusLabel}
        </span>
        <span className="text-xs text-gray-500">
          Dikumpulkan: {formatDateTimeWIB(submission.submittedAt)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <IconFile size={18} className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-800 truncate">{submission.fileName}</span>
          <span className="text-xs text-gray-500">({formatFileSize(submission.fileSize)})</span>
        </div>
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 border border-gray-200 px-2.5 py-1.5 rounded-md"
        >
          <IconDownload size={14} />
          Unduh
        </a>
      </div>
      {submission.status === 'DINILAI' && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          <p className="text-sm">
            <span className="font-semibold text-gray-800">Nilai: </span>
            <span className="font-bold text-blue-700">{submission.score}</span>
            <span className="text-gray-500"> / 100</span>
          </p>
          {submission.feedback && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Feedback: </span>
              {submission.feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}