'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const router = useRouter()
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`) }}
      className="w-full md:w-96"
    >
      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-800 overflow-hidden">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="px-3 py-2 text-sm flex-1 bg-transparent outline-none"
        />
        <button className="px-3 py-2 text-sm bg-primary text-white">Tìm</button>
      </div>
    </form>
  )
}
