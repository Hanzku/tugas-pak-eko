'use client'

export default function LoadingSpinner({ text = 'Memuat...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-6">
      <div className="w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  )
}

export { LoadingSpinner }
