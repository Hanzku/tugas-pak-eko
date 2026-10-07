export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Format file submission yang diizinkan (selaras dengan validasi server)
export const SUBMISSION_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.jpg', '.jpeg', '.png']
export const MAX_SUBMISSION_SIZE = 20 * 1024 * 1024 // 20MB

export function isValidSubmissionFile(file: File): boolean {
  const parts = file.name.split('.')
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : ''
  return SUBMISSION_EXTENSIONS.includes(ext)
}

// Format tanggal + jam dengan timezone Asia/Jakarta
export function formatDateTimeWIB(date: Date | string): string {
  const d = new Date(date)
  return (
    d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }) +
    ', ' +
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) +
    ' WIB'
  )
}

export function generateKode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
]

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const DOC_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.xlsx', '.zip']

export function isValidImageFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext)
}

export function isValidDocFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return DOC_TYPES.includes(file.type) || DOC_EXTENSIONS.includes(ext)
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_DOC_SIZE = 20 * 1024 * 1024 // 20MB
