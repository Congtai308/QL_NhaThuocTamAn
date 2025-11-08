'use client'
import Link from 'next/link'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary" />
          <span className="font-bold text-lg text-primary">Nhà Thuốc</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/category" className="hover:text-primary">Thuốc</Link>
          <Link href="/category?type=tpcn" className="hover:text-primary">Thực phẩm chức năng</Link>
        </nav>
        <div className="flex-1" />
        <SearchBar />
      </div>
    </header>
  )
}
