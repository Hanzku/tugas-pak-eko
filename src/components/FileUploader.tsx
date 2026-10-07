'use client'

import { useState, useRef } from 'react';
import { formatFileSize, isValidImageFile, isValidDocFile, MAX_IMAGE_SIZE, MAX_DOC_SIZE, cn } from '@/lib/utils';
import { IconUpload, IconFile, IconCheck } from './icons/DiampuIcons';

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
}

interface FileUploaderProps {
  onUpload: (file: File) => Promise<UploadResult>;
  accept: 'image' | 'document';
  maxSize?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

type Status = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

export default function FileUploader({
  onUpload,
  accept,
  maxSize,
  onSuccess,
  onError,
}: FileUploaderProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultMaxSize = maxSize || (accept === 'image' ? MAX_IMAGE_SIZE : MAX_DOC_SIZE);
  const acceptAttr = accept === 'image' ? '.jpg,.jpeg,.png,.webp' : '.pdf,.docx,.pptx,.xlsx,.zip';

  const handleFile = async (selectedFile: File) => {
    setStatus('validating');
    setErrorMsg('');
    setProgress(0);

    // Validate size
    if (selectedFile.size > defaultMaxSize) {
      const msg = `Ukuran file terlalu besar. Maksimal ${formatFileSize(defaultMaxSize)}`;
      setErrorMsg(msg);
      setStatus('error');
      if (onError) onError(msg);
      return;
    }

    // Validate type
    const isValidType = accept === 'image' ? isValidImageFile(selectedFile) : isValidDocFile(selectedFile);
    if (!isValidType) {
      const msg = 'Tipe file tidak didukung.';
      setErrorMsg(msg);
      setStatus('error');
      if (onError) onError(msg);
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    if (accept === 'image') {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null); // No preview for docs, rely on file name
    }

    setStatus('uploading');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await onUpload(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('success');
      if (onSuccess) onSuccess(result);
    } catch (error: any) {
      clearInterval(progressInterval);
      const msg = error?.message || 'Gagal mengunggah file.';
      setErrorMsg(msg);
      setStatus('error');
      if (onError) onError(msg);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setErrorMsg('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {status === 'idle' || status === 'error' ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400 bg-gray-50",
            status === 'error' && "border-red-300 bg-red-50"
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-primary-500 flex justify-center"><IconUpload size={32} /></span>
            <p className="text-sm text-gray-600 font-medium">
              Tarik dan lepas file di sini atau <span className="text-primary-500">Pilih File</span>
            </p>
            <p className="text-xs text-gray-500">
              Format: {acceptAttr.replace(/,/g, ', ')} (Maks: {formatFileSize(defaultMaxSize)})
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onChange}
            accept={acceptAttr}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white shadow-sm border-gray-200">
          <div className="flex items-start space-x-4">
            {accept === 'image' && preview ? (
              <div className="w-16 h-16 shrink-0 relative rounded overflow-hidden border border-gray-200">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 shrink-0 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <IconFile size={24} />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file?.name || 'Mengunggah file...'}
              </p>
              <p className="text-xs text-gray-500">
                {file ? formatFileSize(file.size) : ''}
              </p>
              
              {status === 'uploading' && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#1e3a5f] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center">
              {status === 'uploading' && (
                <span className="text-sm text-gray-500 animate-pulse">{progress}%</span>
              )}
              {status === 'success' && (
                <span className="text-green-500" title="Berhasil"><IconCheck size={20} /></span>
              )}
              {status === 'success' && (
                <button
                  onClick={removeFile}
                  className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none p-1"
                  title="Hapus"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}

export { FileUploader };
