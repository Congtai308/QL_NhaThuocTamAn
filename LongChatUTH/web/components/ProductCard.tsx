// components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/api";
import { imageUrl } from "@/lib/api";
import { useCart, money } from "@/lib/cart";
import { useCallback, useMemo } from "react";

// tách giá/đơn vị nếu cần cho nút chọn mua
function parsePrice(text?: string) {
  if (!text) return 0;
  const digits = (text.match(/[\d\.]+/g) || []).join("").replace(/\./g, "");
  return Number(digits) || 0;
}
function parseUnit(text?: string, fallback = "Hộp") {
  if (!text) return fallback;
  const parts = text.split("/");
  return parts[1]?.trim() || fallback;
}

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const href = useMemo(
    () => `/products/${encodeURIComponent(String(p.id))}`,
    [p.id]
  );

  const priceNumber = parsePrice(p.price_text);
  const unit = parseUnit(p.price_text, "Hộp");

  const handleAdd = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // chỉ chặn khi bấm nút mua, không ảnh hưởng link
      e.stopPropagation();
      add(
        {
          id: Number(p.id),
          name: p.name,
          price: priceNumber,
          unit,
          image: p.image_path ? imageUrl(p.image_path) : undefined,
        },
        1
      );
    },
    [add, p.id, p.name, p.image_path, priceNumber, unit]
  );

  return (
    <div className="rounded-2xl border bg-white p-3 flex flex-col justify-between h-full">
      {/* Block ảnh có overlay anchor để click dễ hơn */}
      <div className="aspect-square bg-gray-100 relative">
        {p.image_path ? (
          <Image
            src={imageUrl(p.image_path)}
            alt={p.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
        {/* anchor phủ toàn bộ khung ảnh để bảo đảm click */}
        <Link href={href} className="absolute inset-0" aria-label={p.name} />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {/* Tiêu đề là link – vùng click thứ hai */}
        <Link
          href={href}
          className="text-sm font-medium line-clamp-2 group-hover:text-blue-800"
          title={p.name}
        >
          {p.name}
        </Link>

        <div className="mt-1 text-xs text-gray-500">
          {p.brand}
          {p.brand && p.category ? " • " : ""}
          {p.category}
        </div>

        {/* Giá: giữ nguyên price_text để khớp DB */}
        <div className="mt-2 font-semibold text-blue-800">
          {p.price_text || "Liên hệ"}
        </div>

        {/* Hành động */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={href}
            className="rounded-xl border px-3 py-2 text-center text-sm hover:bg-slate-50"
          >
            Xem chi tiết
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-[#0a56c5] text-white py-2 hover:bg-blue-800 text-sm"
          >
            Chọn mua
          </button>
        </div>

        {/* Gợi ý đơn vị nhỏ (tuỳ chọn) */}
        {/* {priceNumber > 0 && (
          <div className="mt-2 text-[11px] text-slate-600">
            {money(priceNumber)} / {unit}
          </div>
        )} */}
      </div>
    </div>
  );
}
