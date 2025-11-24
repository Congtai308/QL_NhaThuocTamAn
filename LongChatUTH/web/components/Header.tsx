"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import SearchBar from "./SearchBar";
import AuthButtons from "@/components/nav/AuthButtons";
import { useCart, money } from "@/lib/cart";
import { useCartUi } from "@/lib/cart-ui";
import CartPreview from "@/components/CartPreview";
export default function Header() {
  // Đọc dữ liệu cart
  const count = useCart((s) => s.count());
  const items = useCart((s) => s.items);

  // Đọc UI state từng field riêng để tránh tạo object mới mỗi render
  const peekVisible = useCartUi((s) => s.peekVisible);
  const peek = useCartUi((s) => s.peek);

  // ❗ không đưa hidePeek vào deps, dùng getState() trong setTimeout
  useEffect(() => {
    if (!peekVisible) return;

    const t = setTimeout(() => {
      // Luôn lấy hàm mới nhất từ store, tránh lệ thuộc vào reference trong deps
      useCartUi.getState().hidePeek();
    }, 4000);

    return () => clearTimeout(t);
  }, [peekVisible]);

  const peekItem = useMemo(() => {
    if (!peek) return null;
    const actual = items.find((i) => i.id === peek.id);
    return {
      ...peek,
      qty: actual?.qty || peek.qty || 1,
    };
  }, [items, peek]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-800" />
          <span className="font-bold text-lg text-blue-800">Nhà Thuốc Tâm An</span>
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

        {/* Cart + Mini Cart + Peek */}
        <div className="relative">
          {/* Mini-cart hover */}
          <CartPreview />

          {/* Peek popup khi JUST thêm vào giỏ */}
          {peekVisible && peekItem && (
            <div className="absolute right-0 mt-3 w-[320px] rounded-2xl border bg-white shadow-2xl p-4 transition duration-200 z-50">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                Đã thêm vào giỏ hàng
              </div>
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border flex items-center justify-center overflow-hidden">
                  <img
                    src={peekItem.image || "/placeholder.png"}
                    alt={peekItem.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium leading-snug line-clamp-2">
                    {peekItem.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {peekItem.qty} {peekItem.unit || "Sản phẩm"}
                  </div>
                  <div className="text-base font-semibold text-blue-800 mt-1">
                    {peekItem.price ? money(peekItem.price) : "Liên hệ"}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block bg-emerald-500" />
                  Có {count} sản phẩm trong giỏ
                </span>
              </div>

              <div className="mt-3">
                <Link
                  href="/cart"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-[#0a56c5] text-white py-2 text-sm font-medium hover:bg-blue-800"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
