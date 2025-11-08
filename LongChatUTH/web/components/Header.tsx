"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useCart } from "@/lib/cart";
import AuthButtons from "@/components/nav/AuthButtons";

export default function Header() {
  const count = useCart((s) => s.count()); // số sp trong giỏ

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-800" />
          <span className="font-bold text-lg text-blue-800">Nhà Thuốc</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/category" className="hover:text-blue-800">
            Thuốc
          </Link>
          <Link href="/category?type=tpcn" className="hover:text-blue-800">
            Thực phẩm chức năng
          </Link>
        </nav>

        {/* Search */}
        <div className="flex-1" />
        <div className="hidden sm:block min-w-[280px] md:min-w-[420px]">
          <SearchBar />
        </div>

        {/* Auth buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <AuthButtons />
        </div>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative ml-2 rounded-lg border px-3 py-2 hover:bg-slate-50"
        >
          🧺
          {count > 0 && (
            <span className="absolute -top-2 -right-2 text-[11px] bg-blue-700 text-white rounded-full px-1.5 py-0.5">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
